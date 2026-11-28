#!/usr/bin/env node
// Dual-stack local playtest server on port 8999 serving dist/ under both
// /Worlds-Smartest/ and / with Cache-Control: no-store for live QA & user browser testing.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT || 8999);
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.gz': 'application/gzip',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.webm': 'audio/webm',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

function resolveDistFile(urlPath) {
  let clean = decodeURIComponent(urlPath.split('?')[0] || '/');
  if (clean === '/Worlds-Smartest') {
    clean = '/Worlds-Smartest/';
  }
  if (clean.startsWith('/Worlds-Smartest/')) {
    clean = '/' + clean.slice('/Worlds-Smartest/'.length);
  }
  if (clean === '/' || clean === '') {
    clean = '/index.html';
  }
  const candidate = path.resolve(DIST_DIR, '.' + clean);
  if (!candidate.startsWith(DIST_DIR)) {
    return null;
  }
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }
  const fallback = path.resolve(DIST_DIR, 'index.html');
  return fs.existsSync(fallback) ? fallback : null;
}

const server = http.createServer((req, res) => {
  if (req.url === '/Worlds-Smartest') {
    res.writeHead(302, { Location: '/Worlds-Smartest/', 'Cache-Control': 'no-store' });
    res.end();
    return;
  }
  const filePath = resolveDistFile(req.url || '/');
  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end('dist/ build not found');
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_MAP[ext] || 'application/octet-stream';
  const stat = fs.statSync(filePath);
  res.writeHead(200, {
    'Content-Type': mime,
    'Content-Length': stat.size,
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
  });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  fs.createReadStream(filePath).pipe(res);
});

server.listen({ port: PORT, host: '::', ipv6Only: false }, () => {
  console.log(`Live playtest server ready at http://127.0.0.1:${PORT}/Worlds-Smartest/ and http://localhost:${PORT}/Worlds-Smartest/`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already active.`);
    process.exit(0);
  }
  // Fallback to 0.0.0.0 if dual-stack :: is unavailable
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Live playtest server ready (IPv4) at http://127.0.0.1:${PORT}/Worlds-Smartest/`);
  });
});
