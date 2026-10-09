import sharp from 'sharp';

export const toWebp = (image) => sharp(image).webp({ quality: 90 }).toBuffer();
