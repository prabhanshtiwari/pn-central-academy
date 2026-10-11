import * as cheerio from 'cheerio';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '..');
const assetsDir = path.join(root, 'frontend', 'public', 'assets');
const mirrorDir = path.join(assetsDir, 'site-mirror');
const documentsDir = path.join(root, 'frontend', 'public', 'documents');
const startUrl = new URL('https://www.pncentralacademy.com/');
const hostAliases = new Set(['www.pncentralacademy.com', 'pncentralacademy.com']);
const requestedPages = [
  '/', '/index.php', '/about.php', '/vision-and-mission.php', '/infrastructure.php',
  '/admisssion-Procedure.php', '/fees-structure.php', '/teaching-staff.php',
  '/non-teaching-staff.php', '/mandisclosure.php', '/photo-galley.php',
  '/video-gallery.php', '/contact.php',
];
const knownFiles = [
  { test: (url) => /SLIDER_693551fb3b7b08/i.test(url.pathname), file: 'hero-campus.png' },
  { test: (url) => /SLIDER_6935518d4de608/i.test(url.pathname), file: 'hero-community.png' },
  { test: (url) => /\/directorpn\.png$/i.test(url.pathname), file: 'director.png' },
  { test: (url) => /\/gallery\/(\d+)\.(png|jpe?g|webp|gif)$/i.test(url.pathname), file: (url) => {
    const match = url.pathname.match(/\/gallery\/(\d+)\.(png|jpe?g|webp|gif)$/i);
    return `gallery-${String(Number(match[1])).padStart(2, '0')}.${match[2].toLowerCase().replace('jpeg', 'jpg')}`;
  } },
];
const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']);
const documentExtensions = new Set(['.pdf', '.doc', '.docx', '.xls', '.xlsx']);
const userAgent = 'Mozilla/5.0 (compatible; PNCAAssetMirror/1.0; +website asset copy for site owner)';
const discoveredUrls = new Map();
const pages = new Map();
const errors = [];

function safeUrl(raw, base) {
  if (!raw || /^data:|^blob:|^javascript:|^mailto:|^tel:/i.test(raw)) return null;
  try {
    const url = new URL(raw, base);
    if (!['https:', 'http:'].includes(url.protocol) || !hostAliases.has(url.hostname.toLowerCase())) return null;
    url.hash = '';
    return url;
  } catch { return null; }
}
function isPageUrl(url) {
  const ext = path.extname(url.pathname).toLowerCase();
  return !ext || ext === '.php' || ext === '.html' || ext === '.htm';
}
function normalizeSource(url) { return `${url.origin}${url.pathname}${url.search}`; }
function getAssetKind(url) {
  const ext = path.extname(url.pathname).toLowerCase();
  if (imageExtensions.has(ext)) return 'image';
  if (documentExtensions.has(ext)) return 'document';
  return null;
}
function choosePath(url, item) {
  const fixed = knownFiles.find((rule) => rule.test(url));
  if (fixed) return path.join(assetsDir, typeof fixed.file === 'function' ? fixed.file(url) : fixed.file);
  const ext = path.extname(url.pathname).toLowerCase() || '.bin';
  const base = path.basename(url.pathname).replace(/[^a-zA-Z0-9._-]/g, '-').slice(-90) || 'asset';
  const digest = crypto.createHash('sha1').update(normalizeSource(url)).digest('hex').slice(0, 10);
  if (getAssetKind(url) === 'document') return path.join(documentsDir, `${digest}-${base}`);
  return path.join(mirrorDir, `${digest}-${base.replace(/\.[^.]+$/, '')}${ext === '.jpeg' ? '.jpg' : ext}`);
}
function registerAsset(rawUrl, pageUrl, alt = '', typeHint = null) {
  const url = safeUrl(rawUrl, pageUrl);
  if (!url) return;
  const kind = typeHint || getAssetKind(url);
  if (!kind) return;
  const key = normalizeSource(url);
  const current = discoveredUrls.get(key) || { url: key, kind, alt: '', pages: [], galleryCandidate: false };
  if (alt && !current.alt) current.alt = alt.trim().slice(0, 200);
  if (pageUrl && !current.pages.includes(pageUrl.pathname)) current.pages.push(pageUrl.pathname);
  if (url.pathname.toLowerCase().includes('/gallery/') || /SLIDER_/i.test(url.pathname) || /photo-galley\.php/i.test(pageUrl?.pathname || '')) current.galleryCandidate = true;
  discoveredUrls.set(key, current);
}
function parseSrcset(value) {
  return String(value || '').split(',').map((entry) => entry.trim().split(/\s+/)[0]).filter(Boolean);
}

async function fetchText(url) {
  const response = await fetch(url, { headers: { 'user-agent': userAgent }, redirect: 'follow', signal: AbortSignal.timeout(18000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
}

async function crawlPage(url) {
  const key = normalizeSource(url);
  if (pages.has(key)) return;
  pages.set(key, { url: key, status: 'fetching' });
  try {
    const html = await fetchText(url);
    const $ = cheerio.load(html);
    pages.set(key, { url: key, status: 'ok', title: $('title').text().trim() });

    $('img').each((_index, node) => {
      const image = $(node);
      for (const attr of ['src', 'data-src', 'data-lazy-src', 'data-original']) registerAsset(image.attr(attr), url, image.attr('alt') || image.attr('title') || '');
      for (const candidate of parseSrcset(image.attr('srcset') || image.attr('data-srcset'))) registerAsset(candidate, url, image.attr('alt') || '');
    });
    $('source').each((_index, node) => {
      const source = $(node);
      registerAsset(source.attr('src'), url, source.attr('alt') || '');
      for (const candidate of parseSrcset(source.attr('srcset'))) registerAsset(candidate, url, source.attr('alt') || '');
    });
    $('[style]').each((_index, node) => {
      const style = $(node).attr('style') || '';
      for (const match of style.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) registerAsset(match[1], url, '');
    });
    $('a[href]').each((_index, node) => {
      const raw = $(node).attr('href');
      const target = safeUrl(raw, url);
      if (!target) return;
      const kind = getAssetKind(target);
      if (kind) registerAsset(target.toString(), url, $(node).text().trim());
    });

    if ($('link[rel="stylesheet"]').length) {
      const stylesheets = [];
      $('link[rel="stylesheet"]').each((_index, node) => {
        const href = safeUrl($(node).attr('href'), url);
        if (href) stylesheets.push(href);
      });
      for (const stylesheetUrl of stylesheets) {
        try {
          const css = await fetchText(stylesheetUrl);
          for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) registerAsset(match[1], stylesheetUrl, '');
        } catch (error) { errors.push({ url: stylesheetUrl.toString(), stage: 'stylesheet', error: error.message }); }
      }
    }

    $('a[href]').each((_index, node) => {
      const target = safeUrl($(node).attr('href'), url);
      if (!target || !isPageUrl(target)) return;
      const pathname = target.pathname.toLowerCase();
      if (pathname.startsWith('/admin') || pathname.startsWith('/cpn/') || pathname.includes('logout')) return;
      if (pages.size < 75 && !pages.has(normalizeSource(target))) queue.push(target);
    });
  } catch (error) {
    pages.set(key, { url: key, status: 'error', error: error.message });
    errors.push({ url: key, stage: 'page', error: error.message });
  }
}

await fs.mkdir(mirrorDir, { recursive: true });
await fs.mkdir(documentsDir, { recursive: true });
const queue = requestedPages.map((item) => new URL(item, startUrl));
while (queue.length && pages.size < 75) {
  const next = queue.shift();
  if (!pages.has(normalizeSource(next))) await crawlPage(next);
}
// Hard-coded source URLs from links verified in the public site review. These serve as
// recovery seeds if a page template lazy-loads or injects them in a script.
for (const raw of [
  'https://www.pncentralacademy.com/cpn/uploads/slider/SLIDER_693551fb3b7b08.85905915.png',
  'https://www.pncentralacademy.com/cpn/uploads/slider/SLIDER_6935518d4de608.74859959.png',
  'https://www.pncentralacademy.com/directorpn.png',
  'https://www.pncentralacademy.com/gallery/1.png',
  'https://www.pncentralacademy.com/gallery/2.png',
  'https://www.pncentralacademy.com/gallery/3.png',
  'https://www.pncentralacademy.com/gallery/4.png',
]) registerAsset(raw, startUrl, 'Source-site image');

const manifest = [];
for (const item of discoveredUrls.values()) {
  const url = new URL(item.url);
  const localPath = choosePath(url, item);
  const publicPath = `/${path.relative(path.join(root, 'frontend', 'public'), localPath).split(path.sep).join('/')}`;
  try {
    const response = await fetch(item.url, { headers: { 'user-agent': userAgent }, redirect: 'follow', signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const contentType = response.headers.get('content-type') || '';
    if (item.kind === 'image' && contentType && !contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
      throw new Error(`Unexpected content type: ${contentType}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    const maxBytes = item.kind === 'document' ? 30 * 1024 * 1024 : 15 * 1024 * 1024;
    if (bytes.byteLength > maxBytes) throw new Error(`Asset exceeds ${Math.round(maxBytes / 1024 / 1024)} MB limit`);
    await fs.mkdir(path.dirname(localPath), { recursive: true });
    await fs.writeFile(localPath, bytes);
    manifest.push({ ...item, localPath: publicPath, bytes: bytes.byteLength, downloaded: true });
    console.log(`Downloaded ${item.kind}: ${new URL(item.url).pathname} → ${publicPath}`);
  } catch (error) {
    manifest.push({ ...item, localPath: publicPath, downloaded: false, error: error.message });
    errors.push({ url: item.url, stage: 'asset', error: error.message });
  }
}

const report = {
  source: startUrl.origin,
  generatedAt: new Date().toISOString(),
  pages: [...pages.values()],
  assetsDiscovered: discoveredUrls.size,
  assetsDownloaded: manifest.filter((item) => item.downloaded).length,
  manifest,
  errors,
  notes: [
    'Only same-origin public site assets are mirrored by this script.',
    'Review copyright, student/photo consent, document freshness and file licensing before publication.',
    'The modern frontend uses its own code and styling; legacy scripts/styles are not blindly copied.',
  ],
};
await fs.writeFile(path.join(assetsDir, 'site-assets.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(`\nFinished: ${report.assetsDownloaded}/${report.assetsDiscovered} assets downloaded; ${pages.size} pages visited.`);
if (!report.assetsDownloaded) {
  console.error('No assets were downloaded. Check internet access, site availability, and the errors in frontend/public/assets/site-assets.json.');
  process.exitCode = 1;
}
