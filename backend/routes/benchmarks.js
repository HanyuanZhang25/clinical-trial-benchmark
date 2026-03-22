const express = require('express');
const path = require('path');
const { getBenchmarks, getBenchmarkByIdentifier, getDownloadPayload, getLeaderboard } = require('../services/benchmarks');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ success: true, benchmarks: getBenchmarks() });
});

router.get('/:id', (req, res) => {
  const benchmark = getBenchmarkByIdentifier(req.params.id);
  if (!benchmark) {
    return res.status(404).json({
      success: false,
      error_code: 'BENCHMARK_NOT_FOUND',
      message: 'Benchmark not found.'
    });
  }

  res.json({ success: true, benchmark });
});

router.get('/:id/leaderboard', (req, res) => {
  const benchmark = getBenchmarkByIdentifier(req.params.id);
  if (!benchmark) {
    return res.status(404).json({
      success: false,
      error_code: 'BENCHMARK_NOT_FOUND',
      message: 'Benchmark not found.'
    });
  }

  if (!benchmark.is_result_published) {
    return res.status(409).json({
      success: false,
      error_code: 'RESULTS_NOT_PUBLISHED',
      message: 'This benchmark does not have published results yet.'
    });
  }

  res.json({
    success: true,
    benchmark,
    leaderboard: getLeaderboard(req.params.id)
  });
});

router.get('/:id/download', (req, res) => {
  const payload = getDownloadPayload(req.params.id);
  if (!payload) {
    return res.status(404).json({
      success: false,
      error_code: 'BENCHMARK_NOT_FOUND',
      message: 'Benchmark file not found.'
    });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${path.basename(payload.benchmark.slug)}-benchmark-questions.json"`
  );
  res.send(JSON.stringify(payload.file, null, 2));
});

module.exports = router;
