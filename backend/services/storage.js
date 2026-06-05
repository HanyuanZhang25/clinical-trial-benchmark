const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

const seedFilesDir = path.join(__dirname, '..', 'seed', 'benchmark-files');
const storage = new Storage();

function isGcsPath(filePath = '') {
  return typeof filePath === 'string' && filePath.startsWith('gs://');
}

function parseGcsPath(filePath) {
  const match = /^gs:\/\/([^/]+)\/(.+)$/.exec(filePath || '');
  if (!match) {
    throw new Error(`Invalid GCS path: ${filePath}`);
  }

  return {
    bucket: match[1],
    object: match[2]
  };
}

function resolveFilePath(filePath) {
  if (fs.existsSync(filePath)) {
    return filePath;
  }

  const fallbackPath = path.join(seedFilesDir, path.basename(filePath));
  if (fs.existsSync(fallbackPath)) {
    return fallbackPath;
  }

  return filePath;
}

async function readJson(filePath) {
  if (isGcsPath(filePath)) {
    const { bucket, object } = parseGcsPath(filePath);
    const [contents] = await storage.bucket(bucket).file(object).download();
    return JSON.parse(contents.toString('utf8'));
  }

  return JSON.parse(fs.readFileSync(resolveFilePath(filePath), 'utf8'));
}

async function readText(filePath) {
  if (isGcsPath(filePath)) {
    const { bucket, object } = parseGcsPath(filePath);
    const [contents] = await storage.bucket(bucket).file(object).download();
    return contents.toString('utf8');
  }

  return fs.readFileSync(resolveFilePath(filePath), 'utf8');
}

async function getFileSize(filePath) {
  if (isGcsPath(filePath)) {
    const { bucket, object } = parseGcsPath(filePath);
    const [metadata] = await storage.bucket(bucket).file(object).getMetadata();
    return Number(metadata.size);
  }

  return fs.statSync(resolveFilePath(filePath)).size;
}

function createReadStream(filePath, options = {}) {
  if (isGcsPath(filePath)) {
    const { bucket, object } = parseGcsPath(filePath);
    return storage.bucket(bucket).file(object).createReadStream(options);
  }

  return fs.createReadStream(resolveFilePath(filePath), options);
}

module.exports = { readJson, readText, createReadStream, getFileSize, isGcsPath, parseGcsPath };
