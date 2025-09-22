const fs = require("fs");
const path = require("path");

// Function to create a simple PNG-like file
function createBasicIcon(size, filename) {
  // Create a minimal PNG file structure
  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(6, 9); // color type (RGBA)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrCrc = crc32(Buffer.concat([Buffer.from("IHDR"), ihdrData]));
  const ihdr = Buffer.concat([
    Buffer.from([0, 0, 0, 13]), // length
    Buffer.from("IHDR"), // chunk type
    ihdrData, // data
    Buffer.alloc(4), // CRC placeholder
  ]);
  ihdr.writeUInt32BE(ihdrCrc, ihdr.length - 4);

  // Simple blue pixel data (very minimal)
  const pixelData = Buffer.alloc(size * size * 4);
  for (let i = 0; i < pixelData.length; i += 4) {
    pixelData[i] = 0x0e; // R
    pixelData[i + 1] = 0xa5; // G
    pixelData[i + 2] = 0xe9; // B
    pixelData[i + 3] = 0xff; // A
  }

  // IDAT chunk (compressed data - simplified)
  const idat = Buffer.concat([
    Buffer.from([0, 0, 0, 10]), // length (placeholder)
    Buffer.from("IDAT"), // chunk type
    Buffer.from([0x78, 0x9c, 0x63, 0x60, 0x18, 0x05, 0xa3, 0x60, 0x14, 0x8c]), // minimal zlib data
    Buffer.alloc(4), // CRC placeholder
  ]);

  // IEND chunk
  const iend = Buffer.concat([
    Buffer.from([0, 0, 0, 0]), // length
    Buffer.from("IEND"), // chunk type
    Buffer.from([0xae, 0x42, 0x60, 0x82]), // CRC
  ]);

  const png = Buffer.concat([signature, ihdr, idat, iend]);

  const filepath = path.join("static", filename);
  fs.writeFileSync(filepath, png);
  console.log(`Created ${filepath} (${size}x${size})`);
}

// Simple CRC32 implementation
function crc32(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return ~crc >>> 0;
}

// Create directories if needed
const staticDir = path.join(__dirname, "static");
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir);
}

// Create icons
try {
  createBasicIcon(192, "icon-192.png");
  createBasicIcon(512, "icon-512.png");
  createBasicIcon(32, "favicon.png");
  console.log("All PNG icons created successfully!");
} catch (error) {
  console.error("Error creating icons:", error);

  // Fallback: Copy existing SVG as PNG (browser will handle)
  console.log("Creating fallback by copying SVG files...");

  try {
    fs.copyFileSync("static/icon-192.svg", "static/icon-192.png");
    fs.copyFileSync("static/icon-512.svg", "static/icon-512.png");
    console.log("SVG files copied as PNG fallback");
  } catch (copyError) {
    console.error("Fallback copy also failed:", copyError);
  }
}
