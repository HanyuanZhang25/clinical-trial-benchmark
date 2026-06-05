const express = require('express');
const path = require('path');
const { getHomeContent } = require('../services/content');
const { createReadStream, getFileSize } = require('../services/storage');

const router = express.Router();
const visionVideoFileName = 'ct-open-vision-video.mp4';
const benchmarkAssetsBucket = process.env.BENCHMARK_ASSETS_BUCKET || 'test-to-see-clinical-trial-data';

function getVisionVideoPath() {
  if (process.env.VISION_VIDEO_PATH) return process.env.VISION_VIDEO_PATH;
  if (process.env.K_SERVICE) return `gs://${benchmarkAssetsBucket}/${visionVideoFileName}`;

  return path.join(__dirname, '..', '..', '6th vision video.mp4');
}

function parseRangeHeader(rangeHeader, fileSize) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader || '');
  if (!match) return null;

  const start = match[1] === '' ? 0 : Number(match[1]);
  const end = match[2] === '' ? fileSize - 1 : Number(match[2]);

  if (
    Number.isNaN(start)
    || Number.isNaN(end)
    || start < 0
    || end < start
    || start >= fileSize
  ) {
    return null;
  }

  return {
    start,
    end: Math.min(end, fileSize - 1)
  };
}

router.get('/home', async (req, res, next) => {
  try {
    const content = await getHomeContent();
    res.json({
      success: true,
      content
    });
  } catch (error) {
    next(error);
  }
});

router.get('/vision-video', async (req, res, next) => {
  try {
    const videoPath = getVisionVideoPath();
    const fileSize = await getFileSize(videoPath);
    const range = parseRangeHeader(req.headers.range, fileSize);

    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    if (req.headers.range && !range) {
      res.setHeader('Content-Range', `bytes */${fileSize}`);
      return res.status(416).end();
    }

    if (range) {
      res.status(206);
      res.setHeader('Content-Length', range.end - range.start + 1);
      res.setHeader('Content-Range', `bytes ${range.start}-${range.end}/${fileSize}`);

      const stream = createReadStream(videoPath, range);
      stream.on('error', next);
      stream.pipe(res);
      return;
    }

    res.setHeader('Content-Length', fileSize);
    const stream = createReadStream(videoPath);
    stream.on('error', next);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
