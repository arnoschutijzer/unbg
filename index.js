#! /usr/bin/env node
const Unbg = require('./lib/unbg');

async function run() {
  try {
    const unbg = new Unbg();
    // FIXME: don't always clear cache :)
    await unbg.clearCache();
    await unbg.createCache();
    const metadata = await unbg.fetchRandomMetadata();
    const path = await unbg.fetchAndWriteImage(metadata);
    console.log(`setting ${path}`);
    await unbg.setBackground(path);
  } catch(error) {
    console.log(error);
    return process.exit(1);
  }
}

run();
