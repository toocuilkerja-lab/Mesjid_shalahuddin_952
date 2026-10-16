import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Generate clean SVG icon for Masjid Shalahuddin
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064e3b" />
      <stop offset="50%" stop-color="#0f766e" />
      <stop offset="100%" stop-color="#022c22" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="50%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <!-- Background with squircle padding -->
  <rect width="512" height="512" rx="100" fill="url(#bg)" />
  <circle cx="256" cy="256" r="210" fill="none" stroke="url(#gold)" stroke-width="6" stroke-dasharray="8 6" opacity="0.6"/>
  
  <!-- Mosque Dome & Minarets -->
  <g fill="url(#gold)" transform="translate(0, 10)">
    <!-- Main Center Dome -->
    <path d="M256,120 C210,180 180,240 180,300 L332,300 C332,240 302,180 256,120 Z" />
    <!-- Crescent & Star on top of Dome -->
    <path d="M256,82 A16,16 0 1,1 256,114 A12,12 0 1,0 256,90 Z" />
    <polygon points="256,92 258,97 263,97 259,100 260,105 256,102 252,105 253,100 249,97 254,97" />

    <!-- Left Minaret -->
    <rect x="130" y="210" width="28" height="150" rx="4" />
    <path d="M144,160 L130,210 L158,210 Z" />
    <circle cx="144" cy="154" r="5" />

    <!-- Right Minaret -->
    <rect x="354" y="210" width="28" height="150" rx="4" />
    <path d="M368,160 L354,210 L382,210 Z" />
    <circle cx="368" cy="154" r="5" />

    <!-- Mosque Base / Gates -->
    <rect x="150" y="295" width="212" height="85" rx="6" />
    <!-- Center Arch Gate -->
    <path d="M232,380 L232,330 C232,315 280,315 280,330 L280,380 Z" fill="#064e3b" />
    <!-- Left Arch Gate -->
    <path d="M180,380 L180,345 C180,335 212,335 212,345 L212,380 Z" fill="#064e3b" />
    <!-- Right Arch Gate -->
    <path d="M300,380 L300,345 C300,335 332,335 332,345 L332,380 Z" fill="#064e3b" />

    <!-- Base steps -->
    <rect x="110" y="380" width="292" height="18" rx="4" />
    <rect x="90" y="398" width="332" height="12" rx="4" opacity="0.9" />
  </g>

  <!-- Title Ribbon -->
  <text x="256" y="445" font-family="sans-serif" font-weight="900" font-size="28" fill="#fef3c7" text-anchor="middle" letter-spacing="3">MASJID SHALAHUDDIN</text>
  <text x="256" y="472" font-family="sans-serif" font-weight="700" font-size="16" fill="#6ee7b7" text-anchor="middle" letter-spacing="2">KPP PRATAMA JAYAPURA</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon, 'utf-8');
console.log('Created public/icon.svg');

// 2. Helper to create a valid raw PNG with emerald green (#064e3b) background and gold emblem
function createSolidPNG(width, height) {
  // Simple uncompressed or deflate PNG generator
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
    }
    return crc ^ -1;
  }

  // IHDR chunk: width(4), height(4), bitDepth(1), colorType(2=RGB), comp(0), filter(0), interlace(0)
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 2; // RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Scanlines with emerald & gold pattern
  const rawData = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;
  const cx = width / 2;
  const cy = height / 2;
  const r2 = Math.pow(width * 0.42, 2);

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist2 = dx * dx + dy * dy;

      // Crescent / Mosque shape approximation in RGB
      const isInnerRing = dist2 < r2 && dist2 > Math.pow(width * 0.40, 2);
      const isDome = dist2 < Math.pow(width * 0.22, 2) && y <= cy + 10;
      const isBase = Math.abs(dx) < width * 0.25 && y > cy - 5 && y < cy + height * 0.25;

      if (isInnerRing || isDome || isBase) {
        // Gold (#f59e0b)
        rawData[offset++] = 245;
        rawData[offset++] = 158;
        rawData[offset++] = 11;
      } else if (dist2 < r2) {
        // Dark Teal (#0f766e)
        rawData[offset++] = 15;
        rawData[offset++] = 118;
        rawData[offset++] = 110;
      } else {
        // Emerald (#064e3b)
        rawData[offset++] = 6;
        rawData[offset++] = 78;
        rawData[offset++] = 59;
      }
    }
  }

  const idatData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', idatData);
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idat, iendChunk]);
}

// Write the required standard sizes
const png192 = createSolidPNG(192, 192);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

const png512 = createSolidPNG(512, 512);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

const appleIcon = createSolidPNG(180, 180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// Favicon ico
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png192);

console.log('Generated PNG icons: 192x192, 512x512, apple-touch-icon, and favicon.');
