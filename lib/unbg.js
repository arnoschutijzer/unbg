const axios = require('axios');
const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');
const rimraf = require('rimraf');
const wp = require('wallpaper');

module.exports = class Unbg {
  constructor() {
    const { UNSPLASH_API_KEY } = process.env;
    const { UNBG_CACHE_PATH } = process.env;
    if (!UNSPLASH_API_KEY) {
      console.error('No UNSPLASH_API_KEY defined in env variable. Exiting...');
      return process.exit(1);
    }

    this.apiKey = UNSPLASH_API_KEY;
    this.cachePath = UNBG_CACHE_PATH || path.resolve(homedir, './.unbg-cache');
    this.endpoint = `https://api.unsplash.com`;
  }

  getAuthHeaders() {
    return {
      Authorization: `Client-ID ${this.apiKey}`
    };
  }

  getDownloadUrl(metadata) {
    const { urls } = metadata;
    return urls.raw || urls.full;
  }

  getWritePath(metadata) {
    const { id } = metadata;
    // FIXME: somehow find out the format, unsplash probably has something for this
    return path.resolve(this.cachePath, `${id}.jpeg`);
  }

  setBackground(path) {
    return wp.set(path);
  }

  createCache() {
    return new Promise((resolve, reject) => {
      fs.mkdir(
        this.cachePath,
        err => {
          if (err) return reject(err);
          return resolve();
        }
      )
    });
  }

  clearCache() {
    return new Promise((resolve, reject) => {
      rimraf(
        this.cachePath,
        err => {
          if (err) return reject(err);
          return resolve();
        }
      )
    });
  }

  fetchAndWriteImage(metadata) {
    const url = this.getDownloadUrl(metadata);
    const writePath = this.getWritePath(metadata);

    return axios(`${url}`, {
      method: 'GET',
      responseType: 'stream'
    }).then(({ data }) => {
      return new Promise((resolve, reject) => {
        data.pipe(fs.createWriteStream(writePath));
        data.on('end', () => {
          return resolve(writePath);
        });

        data.on('error', error => {
          return reject(error);
        });
      });
    });
  }

  fetchRandomMetadata() {
    return axios(`${this.endpoint}/photos/random`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    }).then(({ data }) => data);
  }
}
