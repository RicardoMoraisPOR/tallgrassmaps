import { readFileSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync, inflateSync } from 'node:zlib';

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const CHANNELS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

const paeth = (a, b, c) => {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);

  if (pa <= pb && pa <= pc) return a;

  return pb <= pc ? b : c;
};

const unfilter = (data, width, height, bytesPerPixel, stride) => {
  const out = Buffer.alloc(stride * height);

  for (let y = 0; y < height; y++) {
    const filter = data[y * (stride + 1)];
    const row = data.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));

    for (let x = 0; x < stride; x++) {
      const left = x >= bytesPerPixel ? out[y * stride + x - bytesPerPixel] : 0;
      const up = y > 0 ? out[(y - 1) * stride + x] : 0;
      const upLeft =
        y > 0 && x >= bytesPerPixel
          ? out[(y - 1) * stride + x - bytesPerPixel]
          : 0;
      const predictor = [
        0,
        left,
        up,
        (left + up) >> 1,
        paeth(left, up, upLeft),
      ][filter];

      out[y * stride + x] = (row[x] + predictor) & 0xff;
    }
  }

  return out;
};

export const readPng = (path) => {
  const file = readFileSync(path);

  if (!file.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error(`${path} is not a PNG`);
  }

  let header;
  let palette;
  const idat = [];

  for (let offset = 8; offset < file.length;) {
    const length = file.readUInt32BE(offset);
    const type = file.toString('ascii', offset + 4, offset + 8);
    const body = file.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      header = {
        width: body.readUInt32BE(0),
        height: body.readUInt32BE(4),
        bitDepth: body[8],
        colorType: body[9],
        interlace: body[12],
      };
    } else if (type === 'PLTE') {
      palette = body;
    } else if (type === 'IDAT') {
      idat.push(body);
    }

    offset += 12 + length;
  }

  const { width, height, bitDepth, colorType, interlace } = header;

  const channels = CHANNELS[colorType];
  const lowBit = bitDepth < 8 && channels === 1;

  if (interlace !== 0 || (bitDepth !== 8 && !lowBit)) {
    throw new Error(
      `${path}: only non-interlaced 8-bit, or low-bit grayscale/indexed PNGs are supported`,
    );
  }

  const stride = Math.ceil((width * channels * bitDepth) / 8);
  const raw = unfilter(
    inflateSync(Buffer.concat(idat)),
    width,
    height,
    Math.max(1, (channels * bitDepth) / 8),
    stride,
  );

  const sample = (x, y) => {
    if (!lowBit) return raw[y * stride + x * channels];

    const bit = x * bitDepth;
    const byte = raw[y * stride + (bit >> 3)];

    return (byte >> (8 - bitDepth - (bit & 7))) & ((1 << bitDepth) - 1);
  };

  const rgb = (x, y) => {
    if (colorType === 3) {
      const entry = sample(x, y) * 3;

      return [palette[entry], palette[entry + 1], palette[entry + 2]];
    }

    if (channels < 3) {
      const value = Math.round((sample(x, y) * 255) / ((1 << bitDepth) - 1));

      return [value, value, value];
    }

    const i = y * stride + x * channels;

    return [raw[i], raw[i + 1], raw[i + 2]];
  };

  return { width, height, bitDepth, sample, rgb };
};

const chunk = (type, body) => {
  const length = Buffer.alloc(4);
  const typed = Buffer.concat([Buffer.from(type, 'ascii'), body]);
  const checksum = Buffer.alloc(4);

  length.writeUInt32BE(body.length);
  checksum.writeUInt32BE(crc32(typed));

  return Buffer.concat([length, typed, checksum]);
};

export const writePng = (path, width, height, rgba) => {
  const header = Buffer.alloc(13);
  const rows = Buffer.alloc((width * 4 + 1) * height);

  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  for (let y = 0; y < height; y++) {
    rows[y * (width * 4 + 1)] = 0;
    rgba.copy(
      rows,
      y * (width * 4 + 1) + 1,
      y * width * 4,
      (y + 1) * width * 4,
    );
  }

  writeFileSync(
    path,
    Buffer.concat([
      SIGNATURE,
      chunk('IHDR', header),
      chunk('IDAT', deflateSync(rows, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  );
};
