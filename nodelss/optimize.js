'use strict';

const AWS = require('aws-sdk');
const S3 = new AWS.S3();
const { basename, extname } = require('path');

const sharp = require('sharp');

module.exports.handle = async ({Records: records}, context) => {
  try {
    await Promise.all(records.map(async record => {
      const { key } = record.S3.object;
      const { Bucket } = process.env.Bucket;

      const image = await S3.getObject({
        Bucket: Bucket,
        key: key
      }).promise();

      const optimized = await sharp(image.Body)
        .resize(1280, 720, { fit: 'inside', withoutEnlargement: true })
        .toFormat('jpeg', { progressive: true, quality: 50 })
        .toBuffer()
      
      await S3.putObject({
        Body: optimized,
        Bucket: Bucket,
        ContentType: 'image/jpeg',
        Key: `compressed/${basename(key, extname(key))}`
      }).promise();
    }))
  } catch (err) {
    return err;
  }
};
