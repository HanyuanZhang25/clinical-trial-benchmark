const db = require('../database');
const { readJson } = require('./storage');

function deriveState(benchmark) {
  const now = Date.now();
  const openAt = benchmark.submission_open_at ? Date.parse(benchmark.submission_open_at) : null;
  const closeAt = benchmark.submission_close_at ? Date.parse(benchmark.submission_close_at) : null;
  const publishAt = benchmark.result_publish_at ? Date.parse(benchmark.result_publish_at) : null;

  if (benchmark.state === 'archived') return 'archived';
  if (publishAt && now >= publishAt) return 'results_published';
  if (closeAt && now > closeAt) return 'closed_pending_results';
  if (openAt && closeAt && now >= openAt && now <= closeAt) return 'open_for_submission';
  if (openAt && now < openAt) return 'upcoming';
  return benchmark.state;
}

function serializeBenchmark(row) {
  const state = deriveState(row);
  return {
    id: row.id,
    slug: row.slug,
    display_name: row.display_name,
    benchmark_cycle_label: row.benchmark_cycle_label,
    state,
    submission_open_at: row.submission_open_at,
    submission_close_at: row.submission_close_at,
    result_publish_at: row.result_publish_at,
    has_ground_truth: !!row.has_ground_truth,
    is_submission_open: state === 'open_for_submission',
    is_result_published: state === 'results_published' || state === 'archived',
    description: row.description
  };
}

function getBenchmarks() {
  return db
    .prepare('SELECT * FROM benchmarks ORDER BY submission_open_at ASC')
    .all()
    .map(serializeBenchmark);
}

function getCurrentOpenBenchmark() {
  const rows = db.prepare('SELECT * FROM benchmarks ORDER BY submission_open_at ASC').all();
  const open = rows.map(serializeBenchmark).find((benchmark) => benchmark.is_submission_open);
  if (!open) return null;
  return db.prepare('SELECT * FROM benchmarks WHERE id = ?').get(open.id);
}

function getBenchmarkByIdentifier(identifier) {
  const row = db.prepare('SELECT * FROM benchmarks WHERE slug = ? OR id = ?').get(identifier, identifier);
  return row ? serializeBenchmark(row) : null;
}

function getBenchmarkRecord(identifier) {
  return db.prepare('SELECT * FROM benchmarks WHERE slug = ? OR id = ?').get(identifier, identifier);
}

function getManifestForBenchmark(benchmarkIdOrSlug) {
  const record = getBenchmarkRecord(benchmarkIdOrSlug);
  if (!record) return null;
  return readJson(record.manifest_file_path);
}

function getDownloadPayload(benchmarkIdOrSlug) {
  const record = getBenchmarkRecord(benchmarkIdOrSlug);
  if (!record || !record.download_file_path) return null;
  return {
    benchmark: serializeBenchmark(record),
    file: readJson(record.download_file_path)
  };
}

function getLeaderboard(benchmarkIdOrSlug) {
  const benchmark = getBenchmarkRecord(benchmarkIdOrSlug);
  if (!benchmark) return null;

  const rows = db.prepare(`
    SELECT display_username, model_name, average_f1_macro, average_cross_entropy, cost,
      arm2arm_superiority_f1, arm2arm_superiority_cross_entropy,
      arm2arm_noninferiority_f1, arm2arm_noninferiority_cross_entropy,
      endpoint_prediction_f1, endpoint_prediction_cross_entropy,
      published_at
    FROM submission_evaluations
    WHERE benchmark_id = ? AND is_public = 1 AND status = 'published'
    ORDER BY average_f1_macro DESC, average_cross_entropy ASC, created_at ASC
  `).all(benchmark.id);

  return rows.map((row, index) => ({
    rank: index + 1,
    username: row.display_username,
    model: row.model_name,
    average_f1_macro: row.average_f1_macro,
    average_cross_entropy: row.average_cross_entropy,
    cost: row.cost,
    arm2arm_superiority_f1: row.arm2arm_superiority_f1,
    arm2arm_superiority_cross_entropy: row.arm2arm_superiority_cross_entropy,
    arm2arm_noninferiority_f1: row.arm2arm_noninferiority_f1,
    arm2arm_noninferiority_cross_entropy: row.arm2arm_noninferiority_cross_entropy,
    endpoint_prediction_f1: row.endpoint_prediction_f1,
    endpoint_prediction_cross_entropy: row.endpoint_prediction_cross_entropy,
    published_at: row.published_at
  }));
}

module.exports = {
  deriveState,
  getBenchmarks,
  getCurrentOpenBenchmark,
  getBenchmarkByIdentifier,
  getBenchmarkRecord,
  getManifestForBenchmark,
  getDownloadPayload,
  getLeaderboard
};
