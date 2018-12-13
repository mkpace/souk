import AWS from 'aws-sdk';
import fileType from 'file-type';

import logger from './logger';

export default async (attachment, dir = 'test', fileName = '') => {
  const S3 = new AWS.S3();

  try {
    const fileBuffer = Buffer.from(attachment, 'base64');
    let fileTypeInfo = fileType(fileBuffer);
    if (!fileTypeInfo) {
      fileTypeInfo = {
        ext: 'txt',
        mime: 'text/plain',
      };
    }

    let _fileName = fileName;
    if (_fileName === '') {
      _fileName = Math.floor(new Date() / 1000);
    }

    const filePath = `${dir}/${_fileName}.${fileTypeInfo.ext}`;
    const params = {
      Bucket: global.env.SOUK_BUCKET,
      Key: filePath,
      Body: fileBuffer,
      ACL: 'public-read',
      ContentEncoding: 'base64',
      ContentType: fileTypeInfo.mime,
    };

    await S3.putObject(params).promise();

    return `${global.env.SOUK_BUCKET_LINK}/${filePath}`;
  } catch (err) {
    logger.error(`Failed to upload to S3 bucket. Error: ${err.message}`);
    throw err;
  }
};
