const db = require('../database');
const { getBenchmarkRecord, getCurrentOpenBenchmark, deriveState, getManifestForBenchmark } = require('./benchmarks');

function validationError(errorCode, message, status = 400) {
  const error = new Error(message);
  error.status = status;
  error.errorCode = errorCode;
  return error;
}

function formatIdSample(ids) {
  return ids.slice(0, 5).join(', ');
}

async function validateSubmissionPayload({ benchmark, payload }) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw validationError('INVALID_SCHEMA', 'It should be a dict, the key is question, the value is your option list.');
  }

  const manifest = await getManifestForBenchmark(benchmark.id);
  const validQuestions = new Map(
    manifest.map((item) => [Number(item.problem_id), item.section])
  );
  const expectedIds = [...validQuestions.keys()];
  const submittedEntries = Object.entries(payload);

  if (submittedEntries.length !== manifest.length) {
    throw validationError(
      'INVALID_SEMANTIC',
      `The number of submitted questions must match the benchmark size (${manifest.length}).`
    );
  }

  const invalidQuestionIds = [];
  const normalizedPayload = {};
  let expectedOptionCount = null;
  const illegalOptionIds = [];

  for (const [rawQuestionId, rawValue] of submittedEntries) {
    const normalizedProblemId = Number(rawQuestionId);

    if (!Number.isInteger(normalizedProblemId) || normalizedProblemId < 0 || !validQuestions.has(normalizedProblemId)) {
      invalidQuestionIds.push(rawQuestionId);
      continue;
    }

    if (!Array.isArray(rawValue)) {
      throw validationError('INVALID_SCHEMA', 'The value\'s format should be list, and fill the option in it.');
    }

    if (rawValue.length === 0) {
      throw validationError('INVALID_SEMANTIC', 'The option list must contain at least one element.');
    }

    if (expectedOptionCount === null) {
      expectedOptionCount = rawValue.length;
    } else if (rawValue.length !== expectedOptionCount) {
      throw validationError('INVALID_SEMANTIC', 'The option\'s size is not same, please unify it.');
    }

    const allowedOptions = validQuestions.get(normalizedProblemId) === 'non-inferiority'
      ? new Set(['a', 'b', 'c'])
      : new Set(['a', 'b']);

    const normalizedOptions = [];
    let hasIllegalOption = false;

    for (const option of rawValue) {
      const normalizedOption = String(option).trim().toLowerCase();
      if (!allowedOptions.has(normalizedOption)) {
        hasIllegalOption = true;
        break;
      }
      normalizedOptions.push(normalizedOption);
    }

    if (hasIllegalOption) {
      illegalOptionIds.push(normalizedProblemId);
      continue;
    }

    normalizedPayload[String(normalizedProblemId)] = normalizedOptions;
  }

  if (invalidQuestionIds.length) {
    throw validationError(
      'INVALID_SEMANTIC',
      `Some question ids are wrong: ${formatIdSample(invalidQuestionIds)}.`
    );
  }

  if (illegalOptionIds.length) {
    throw validationError(
      'INVALID_SEMANTIC',
      `Some element's option is illegal. Relevant question ids: ${formatIdSample(illegalOptionIds)}.`
    );
  }

  const missingIds = expectedIds.filter((problemId) => !(String(problemId) in normalizedPayload));
  if (missingIds.length) {
    throw validationError(
      'INVALID_SEMANTIC',
      `Missing required question ids: ${formatIdSample(missingIds)}.`
    );
  }

  Object.keys(payload).forEach((key) => delete payload[key]);
  Object.assign(payload, normalizedPayload);

  return {
    manifestCount: manifest.length,
    answerCount: Object.keys(normalizedPayload).length,
    optionCount: expectedOptionCount,
    missingIds,
    acceptedIds: expectedIds
  };
}

async function createSubmission({ user, payload }) {
  const benchmark = await getCurrentOpenBenchmark();
  if (!benchmark) {
    throw validationError('BENCHMARK_CLOSED', 'There is no open benchmark accepting submissions right now.', 409);
  }

  const benchmarkState = deriveState(benchmark);
  if (benchmarkState !== 'open_for_submission') {
    throw validationError('BENCHMARK_CLOSED', 'Only open benchmarks may accept new submissions.', 409);
  }

  const summary = await validateSubmissionPayload({ benchmark, payload });

  await db.run(`
    UPDATE submissions
    SET status = 'discarded',
      raw_payload = NULL,
      validation_summary = NULL
    WHERE user_id = ? AND benchmark_id = ? AND status = 'latest'
  `, [user.id, benchmark.id]);

  const result = await db.insert(`
    INSERT INTO submissions (
      user_id, benchmark_id, model_name, benchmark_version, raw_payload,
      total_cost, status, validation_summary
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    user.id,
    benchmark.id,
    user.username,
    benchmark.display_name,
    JSON.stringify(payload),
    0,
    'latest',
    JSON.stringify(summary)
  ]);

  await db.insert(`
    INSERT INTO submission_evaluations (
      submission_id, benchmark_id, display_username, model_name, cost, status, is_public
    ) VALUES (?, ?, ?, ?, ?, 'pending_results', 0)
  `, [result.lastInsertRowid, benchmark.id, user.username, user.username, 0]);

  return {
    id: result.lastInsertRowid,
    benchmark: {
      id: benchmark.id,
      slug: benchmark.slug,
      display_name: benchmark.display_name
    },
    status: 'latest',
    validation_summary: summary
  };
}

async function listUserSubmissions(userId) {
  const rows = await db.all(`
    SELECT s.id, s.status, s.submitted_at, b.display_name, b.slug
    FROM submissions s
    JOIN benchmarks b ON b.id = s.benchmark_id
    WHERE s.user_id = ?
    ORDER BY s.submitted_at DESC
    LIMIT 50
  `, [userId]);

  return rows.map((row) => ({
    id: row.id,
    benchmark_name: row.display_name,
    benchmark_slug: row.slug,
    status: row.status,
    submitted_at: row.submitted_at
  }));
}

async function listAllSubmissions() {
  const rows = await db.all(`
    SELECT s.id, s.user_id, u.username, u.email, s.model_name, s.benchmark_version, s.total_cost,
      s.status, s.submitted_at, b.display_name, b.slug, e.average_f1_macro,
      e.average_cross_entropy, e.is_public
    FROM submissions s
    JOIN users u ON u.id = s.user_id
    JOIN benchmarks b ON b.id = s.benchmark_id
    LEFT JOIN submission_evaluations e ON e.submission_id = s.id
    WHERE NOT EXISTS (
      SELECT 1
      FROM submissions newer
      WHERE newer.user_id = s.user_id
        AND newer.benchmark_id = s.benchmark_id
        AND (
          newer.submitted_at > s.submitted_at
          OR (newer.submitted_at = s.submitted_at AND newer.id > s.id)
        )
    )
    ORDER BY s.submitted_at DESC
  `);

  return rows.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    username: row.username,
    email: row.email,
    model_name: row.model_name,
    benchmark_name: row.display_name,
    benchmark_slug: row.slug,
    benchmark_version: row.benchmark_version,
    total_cost: row.total_cost,
    status: row.status,
    average_f1_macro: row.average_f1_macro,
    average_cross_entropy: row.average_cross_entropy,
    results_published: !!row.is_public,
    submitted_at: row.submitted_at
  }));
}

async function getSubmissionDetail(submissionId, user) {
  const row = await db.get(`
    SELECT s.*, b.display_name, b.slug, e.average_f1_macro, e.average_cross_entropy,
      e.arm2arm_superiority_f1, e.arm2arm_superiority_cross_entropy,
      e.arm2arm_noninferiority_f1, e.arm2arm_noninferiority_cross_entropy,
      e.endpoint_prediction_f1, e.endpoint_prediction_cross_entropy, e.is_public
    FROM submissions s
    JOIN benchmarks b ON b.id = s.benchmark_id
    LEFT JOIN submission_evaluations e ON e.submission_id = s.id
    WHERE s.id = ?
  `, [submissionId]);

  if (!row) {
    throw validationError('SUBMISSION_NOT_FOUND', 'Submission not found.', 404);
  }

  if (row.user_id !== user.id && user.role !== 'admin') {
    throw validationError('FORBIDDEN', 'Access denied.', 403);
  }

  return {
    id: row.id,
    model_name: row.model_name,
    benchmark_name: row.display_name,
    benchmark_slug: row.slug,
    benchmark_version: row.benchmark_version,
    total_cost: row.total_cost,
    status: row.status,
    submitted_at: row.submitted_at,
    raw_payload: JSON.parse(row.raw_payload),
    validation_summary: row.validation_summary ? JSON.parse(row.validation_summary) : null,
    evaluation: {
      average_f1_macro: row.average_f1_macro,
      average_cross_entropy: row.average_cross_entropy,
      arm2arm_superiority_f1: row.arm2arm_superiority_f1,
      arm2arm_superiority_cross_entropy: row.arm2arm_superiority_cross_entropy,
      arm2arm_noninferiority_f1: row.arm2arm_noninferiority_f1,
      arm2arm_noninferiority_cross_entropy: row.arm2arm_noninferiority_cross_entropy,
      endpoint_prediction_f1: row.endpoint_prediction_f1,
      endpoint_prediction_cross_entropy: row.endpoint_prediction_cross_entropy,
      is_public: !!row.is_public
    }
  };
}

module.exports = {
  validationError,
  validateSubmissionPayload,
  createSubmission,
  listUserSubmissions,
  listAllSubmissions,
  getSubmissionDetail
};
