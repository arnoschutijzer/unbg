const axios = require('axios');
const fs = require('fs');
const homedir = require('os').homedir();
const path = require('path');
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

    this.createCache().catch(error => {
      if (error.code === 'EEXIST') return Promise.resolve();
    });
  }

  getFullUrl(metadata) {
    const { urls } = metadata;
    return urls.raw || urls.full;
  }

  getWritePath(metadata) {
    const { id } = metadata;
    return path.resolve(this.cachePath, id);
  }

  async setBackground(path) {
    return wp.set(path);
  }

  async createCache() {
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

  async fetchAndWriteImage(metadata) {
    const url = this.getFullUrl(metadata);
    const writePath = this.getWritePath(metadata);

    return await axios(`${url}`, {
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

  async fetchRandomMetadata() {
    return await axios(`${this.endpoint}/photos/random`, {
      method: 'GET',
      headers: {
        'Authorization': `Client-ID ${this.apiKey}`
      }
    }).then(({ data }) => data);  
  }
}