const axios = require('axios');
const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');
const wp = require('wallpaper');

const { API_KEY } = require('./config');
const ENDPOINT = 'https://api.unsplash.com';
const CACHE_PATH = path.resolve(homedir, './.unbg-cache');

const createCache = () => {
  return new Promise((resolve, reject) => {
    fs.mkdir(
      CACHE_PATH,
      err => {
        if (err) return reject(err);
        return resolve();
      }
    )
  });
};

const getCurrentBackground = async () => {
  const backgroundPath = await wp.get();
  fs.readFile(backgroundPath, data);
};

const fetchImageMetadata = async () => {
  return await axios(`${ENDPOINT}/photos/random`, {
    method: 'GET',
    headers: {
      'Authorization': `Client-ID ${API_KEY}`
    }
  }).then(({ data }) => data);
};

const getFullUrl = (metadata) => {
  const { urls } = metadata;
  return urls.raw || urls.full;
};

const getWritePath = (metadata) => {
  const { id } = metadata;
  return path.resolve(CACHE_PATH, id);
}

const fetchAndWriteImage = async (metadata) => {
  const url = getFullUrl(metadata);
  const writePath = getWritePath(metadata);

  return await axios(`${url}`, {
    method: 'GET',
    responseType: 'stream'
  }).then(({ data }) => {
    return new Promise((resolve, reject) => {
      data.pipe(fs.createWriteStream(writePath));
      data.on('end', () => {
        resolve();
      });

      data.on('error', () => {
        reject();
      });
    });
  });
};

const run = async () => {
  try {
    await createCache();
  } catch (err) {
    // ignore EEXIST errors
    if (!err.code === 'EEXIST') {
      console.log(err);
      return process.exit(1);
    }
  }

  try {
    const metadata = await fetchImageMetadata();
    await fetchAndWriteImage(metadata);
  } catch (err) {
    console.log(err);
  }
}

run();
