#! /usr/bin/env node
const Unbg = require('./lib/unbg');

async function run() {
  const unbg = new Unbg();

  try {
    const metadata = await unbg.fetchRandomMetadata();
    const path = await unbg.fetchAndWriteImage(metadata);
    console.log(path);
  } catch(error) {
    console.error(error);
  }
}

run();
