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

function averageMetric(values) {
  const numericValues = values.filter((value) => typeof value === 'number');
  if (!numericValues.length) return null;
  return numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;
}

async function validateSubmissionPayload({ benchmark, payload }) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw validationError('INVALID_SCHEMA', 'The submission must be a JSON object (dictionary format): each key is a question id and each value is an option list.');
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
  const nonListValueIds = [];
  const emptyOptionIds = [];

  for (const [rawQuestionId, rawValue] of submittedEntries) {
    const normalizedProblemId = Number(rawQuestionId);

    if (!Number.isInteger(normalizedProblemId) || normalizedProblemId < 0 || !validQuestions.has(normalizedProblemId)) {
      invalidQuestionIds.push(rawQuestionId);
      continue;
    }

    if (!Array.isArray(rawValue)) {
      nonListValueIds.push(normalizedProblemId);
      continue;
    }

    if (rawValue.length === 0) {
      emptyOptionIds.push(normalizedProblemId);
      continue;
    }

    if (expectedOptionCount === null) {
      expectedOptionCount = rawValue.length;
    } else if (rawValue.length !== expectedOptionCount) {
      throw validationError('INVALID_SEMANTIC', 'All option lists must have the same length.');
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
      `Some question IDs are invalid. Example question IDs include: ${formatIdSample(invalidQuestionIds)}.`
    );
  }

  if (illegalOptionIds.length) {
    throw validationError(
      'INVALID_SEMANTIC',
      `Some options are invalid. Example question IDs include: ${formatIdSample(illegalOptionIds)}.`
    );
  }

  if (nonListValueIds.length) {
    throw validationError(
      'INVALID_SCHEMA',
      `Some values are not option lists. Example question IDs include: ${formatIdSample(nonListValueIds)}.`
    );
  }

  if (emptyOptionIds.length) {
    throw validationError(
      'INVALID_SEMANTIC',
      `Some option lists are empty. Example question IDs include: ${formatIdSample(emptyOptionIds)}.`
    );
  }

  const missingIds = expectedIds.filter((problemId) => !(String(problemId) in normalizedPayload));
  if (missingIds.length) {
    throw validationError(
      'INVALID_SEMANTIC',
      `Some required question IDs are missing. Example question IDs include: ${formatIdSample(missingIds)}.`
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
      raw_payload = '{}',
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
      submission_id, benchmark_id, display_username, model_name, status, is_public
    ) VALUES (?, ?, ?, ?, 'pending_results', 0)
  `, [result.lastInsertRowid, benchmark.id, user.username, user.username]);

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
    SELECT s.id, s.user_id, u.username, u.email, s.model_name, s.benchmark_version,
      s.status, s.submitted_at, b.display_name, b.slug,
      e.endpoint_macro_f1, e.endpoint_balanced_accuracy,
      e.superiority_macro_f1, e.superiority_balanced_accuracy,
      e.comparative_effect_macro_f1, e.comparative_effect_balanced_accuracy,
      e.is_public
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

  return rows.map((row) => {
    const endpointMacroF1 = row.endpoint_macro_f1 ?? null;
    const endpointBalancedAccuracy = row.endpoint_balanced_accuracy ?? null;
    const superiorityMacroF1 = row.superiority_macro_f1 ?? null;
    const superiorityBalancedAccuracy = row.superiority_balanced_accuracy ?? null;
    const comparativeEffectMacroF1 = row.comparative_effect_macro_f1 ?? null;
    const comparativeEffectBalancedAccuracy = row.comparative_effect_balanced_accuracy ?? null;

    return {
    id: row.id,
    user_id: row.user_id,
    username: row.username,
    email: row.email,
    model_name: row.model_name,
    benchmark_name: row.display_name,
    benchmark_slug: row.slug,
    benchmark_version: row.benchmark_version,
    status: row.status,
    average_f1_macro: averageMetric([endpointMacroF1, superiorityMacroF1, comparativeEffectMacroF1]),
    average_balanced_accuracy: averageMetric([endpointBalancedAccuracy, superiorityBalancedAccuracy, comparativeEffectBalancedAccuracy]),
    results_published: !!row.is_public,
    submitted_at: row.submitted_at
    };
  });
}

async function getSubmissionDetail(submissionId, user) {
  const row = await db.get(`
    SELECT s.id, s.user_id, s.model_name, s.benchmark_version, s.status, s.submitted_at,
      s.raw_payload, s.validation_summary, b.display_name, b.slug,
      e.endpoint_macro_f1, e.endpoint_balanced_accuracy,
      e.superiority_macro_f1, e.superiority_balanced_accuracy,
      e.comparative_effect_macro_f1, e.comparative_effect_balanced_accuracy,
      e.is_public
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

  const endpointMacroF1 = row.endpoint_macro_f1 ?? null;
  const endpointBalancedAccuracy = row.endpoint_balanced_accuracy ?? null;
  const superiorityMacroF1 = row.superiority_macro_f1 ?? null;
  const superiorityBalancedAccuracy = row.superiority_balanced_accuracy ?? null;
  const comparativeEffectMacroF1 = row.comparative_effect_macro_f1 ?? null;
  const comparativeEffectBalancedAccuracy = row.comparative_effect_balanced_accuracy ?? null;

  return {
    id: row.id,
    model_name: row.model_name,
    benchmark_name: row.display_name,
    benchmark_slug: row.slug,
    benchmark_version: row.benchmark_version,
    status: row.status,
    submitted_at: row.submitted_at,
    raw_payload: row.raw_payload ? JSON.parse(row.raw_payload) : null,
    validation_summary: row.validation_summary ? JSON.parse(row.validation_summary) : null,
    evaluation: {
      average_f1_macro: averageMetric([endpointMacroF1, superiorityMacroF1, comparativeEffectMacroF1]),
      average_balanced_accuracy: averageMetric([endpointBalancedAccuracy, superiorityBalancedAccuracy, comparativeEffectBalancedAccuracy]),
      endpoint_macro_f1: endpointMacroF1,
      endpoint_balanced_accuracy: endpointBalancedAccuracy,
      superiority_macro_f1: superiorityMacroF1,
      superiority_balanced_accuracy: superiorityBalancedAccuracy,
      comparative_effect_macro_f1: comparativeEffectMacroF1,
      comparative_effect_balanced_accuracy: comparativeEffectBalancedAccuracy,
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
