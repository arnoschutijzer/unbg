#! /usr/bin/env node
const Unbg = require('./lib/unbg');
const pkg = require('./package.json');

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
    console.log(`Oops, something went wrong. Have a look at the error(s) below or open an issue at ${pkg.bugs.url}`)
    if (error.response && error.response && error.response.data && error.response.data.errors) {
      error.response.data.errors.forEach((errorMessage) => {
        console.log(errorMessage);
      });
    } else {
      console.log(error);
    }
    return process.exit(1);
  }
}

run();
