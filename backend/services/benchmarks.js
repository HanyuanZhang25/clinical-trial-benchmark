const db = require('../database');
const { readJson, isGcsPath, parseGcsPath } = require('./storage');
const path = require('path');

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
    .all('SELECT * FROM benchmarks ORDER BY submission_open_at ASC')
    .then((rows) => rows.map(serializeBenchmark));
}

async function getCurrentOpenBenchmark() {
  const rows = await db.all('SELECT * FROM benchmarks ORDER BY submission_open_at ASC');
  const open = rows.map(serializeBenchmark).find((benchmark) => benchmark.is_submission_open);
  if (!open) return null;
  return db.get('SELECT * FROM benchmarks WHERE id = ?', [open.id]);
}

async function getBenchmarkByIdentifier(identifier) {
  const row = await db.get('SELECT * FROM benchmarks WHERE slug = ? OR id = ?', [identifier, identifier]);
  return row ? serializeBenchmark(row) : null;
}

function getBenchmarkRecord(identifier) {
  return db.get('SELECT * FROM benchmarks WHERE slug = ? OR id = ?', [identifier, identifier]);
}

async function getManifestForBenchmark(benchmarkIdOrSlug) {
  const record = await getBenchmarkRecord(benchmarkIdOrSlug);
  if (!record) return null;
  return readJson(record.manifest_file_path);
}

async function getDownloadAsset(benchmarkIdOrSlug) {
  const record = await getBenchmarkRecord(benchmarkIdOrSlug);
  if (!record || !record.download_file_path) return null;
  return {
    benchmark: serializeBenchmark(record),
    filePath: record.download_file_path
  };
}

async function getAuxiliaryAsset(benchmarkIdOrSlug) {
  const record = await getBenchmarkRecord(benchmarkIdOrSlug);
  if (!record) return null;

  const auxiliaryPath = isGcsPath(record.manifest_file_path)
    ? `gs://${parseGcsPath(record.manifest_file_path).bucket}/auxiliary_${record.slug.replace('-', '_')}.json`
    : path.join(path.dirname(record.manifest_file_path), `${record.slug}-auxiliary.json`);
  try {
    return {
      benchmark: serializeBenchmark(record),
      filePath: auxiliaryPath
    };
  } catch (error) {
    return null;
  }
}

async function getLeaderboard(benchmarkIdOrSlug) {
  const benchmark = await getBenchmarkRecord(benchmarkIdOrSlug);
  if (!benchmark) return null;

  const useHistoricalReportOrder = ['25-02', '25-09'].includes(benchmark.slug);
  const averageMacroF1Expr = `(
    endpoint_macro_f1 +
    superiority_macro_f1 +
    comparative_effect_macro_f1
  ) / 3.0`;
  const averageBalancedAccuracyExpr = `(
    endpoint_balanced_accuracy +
    superiority_balanced_accuracy +
    comparative_effect_balanced_accuracy
  ) / 3.0`;
  const rows = await db.all(`
    SELECT display_username, model_name,
      endpoint_macro_f1,
      endpoint_balanced_accuracy,
      superiority_macro_f1,
      superiority_balanced_accuracy,
      comparative_effect_macro_f1,
      comparative_effect_balanced_accuracy,
      published_at
    FROM submission_evaluations
    WHERE benchmark_id = ? AND is_public = 1 AND status = 'published'
    ORDER BY ${useHistoricalReportOrder ? 'created_at ASC' : `${averageMacroF1Expr} DESC, ${averageBalancedAccuracyExpr} DESC, created_at ASC`}
  `, [benchmark.id]);

  return rows.map((row, index) => ({
    rank: index + 1,
    username: row.display_username,
    model: row.model_name,
    is_section_header:
      row.endpoint_macro_f1 == null &&
      row.endpoint_balanced_accuracy == null &&
      row.superiority_macro_f1 == null &&
      row.superiority_balanced_accuracy == null &&
      row.comparative_effect_macro_f1 == null &&
      row.comparative_effect_balanced_accuracy == null,
    endpoint_macro_f1: row.endpoint_macro_f1,
    endpoint_balanced_accuracy: row.endpoint_balanced_accuracy,
    superiority_macro_f1: row.superiority_macro_f1,
    superiority_balanced_accuracy: row.superiority_balanced_accuracy,
    comparative_effect_macro_f1: row.comparative_effect_macro_f1,
    comparative_effect_balanced_accuracy: row.comparative_effect_balanced_accuracy,
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
  getDownloadAsset,
  getAuxiliaryAsset,
  getLeaderboard
};
