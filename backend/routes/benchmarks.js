const express = require('express');
const path = require('path');
const { createReadStream } = require('../services/storage');
const { getBenchmarks, getBenchmarkByIdentifier, getDownloadAsset, getAuxiliaryAsset, getLeaderboard } = require('../services/benchmarks');

const router = express.Router();

router.get('/', async (req, res) => {
  res.json({ success: true, benchmarks: await getBenchmarks() });
});

router.get('/:id', async (req, res) => {
  const benchmark = await getBenchmarkByIdentifier(req.params.id);
  if (!benchmark) {
    return res.status(404).json({
      success: false,
      error_code: 'BENCHMARK_NOT_FOUND',
      message: 'Benchmark not found.'
    });
  }

  res.json({ success: true, benchmark });
});

router.get('/:id/leaderboard', async (req, res) => {
  const benchmark = await getBenchmarkByIdentifier(req.params.id);
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
    leaderboard: await getLeaderboard(req.params.id)
  });
});

router.get('/:id/download', async (req, res, next) => {
  const asset = await getDownloadAsset(req.params.id);
  if (!asset) {
    return res.status(404).json({
      success: false,
      error_code: 'BENCHMARK_NOT_FOUND',
      message: 'Benchmark file not found.'
    });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="benchmark-questions-${path.basename(asset.benchmark.slug)}.json"`
  );

  const stream = createReadStream(asset.filePath);
  stream.on('error', next);
  stream.pipe(res);
});

router.get('/:id/auxiliary', async (req, res, next) => {
  const asset = await getAuxiliaryAsset(req.params.id);
  if (!asset) {
    return res.status(404).json({
      success: false,
      error_code: 'AUXILIARY_NOT_FOUND',
      message: 'Auxiliary benchmark file not found.'
    });
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="auxiliary-information-${path.basename(asset.benchmark.slug)}.json"`
  );

  const stream = createReadStream(asset.filePath);
  stream.on('error', next);
  stream.pipe(res);
});

module.exports = router;
