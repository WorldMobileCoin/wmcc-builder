#! /usr/bin/env node

const Rebuild = require('electron-rebuild');
const Builder = require("electron-builder")
const Path = require('path');
const Child = require('child_process');

const args = process.argv.slice(2);
const opts = {};

if (process.argv.length <= 3) {
    console.log("Arguments must contain at least platform and arch parameters, example wmcc-build --platform=win32 --arch=x64");
    process.exit(-1);
}

for (let arg of args) {
  const opt = arg.split("=");
  opts[opt[0].substring(2)] = opt[1];
}

if (!opts.platform || !opts.arch) {
    console.log("Arguments must contain at least platform and arch parameters, example wmcc-build --platform=win32 --arch=x64");
    process.exit(-1);
}

let options = {
  appId: 'com.worldmobilecoin.wmcc-desktop',
  productName: 'wmcc-desktop',
  copyright: 'Copyright © 2017 WorldMobileCoin | Park Alter',
  directories: {
    buildResources: './build',
    output: opts.out || './release',
    app: opts.dir || './node_modules/wmcc-desktop'
  },
  electronVersion: opts.electronVersion || '1.7.9',
  npmRebuild: JSON.parse(opts.rebuild) || true
}

options = assignOptions(options, opts.platform, opts.arch);

Builder.build({
  config: options
}).then(() => {
  console.log(`\u2714 Successfully compiled!`);
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(-1);
});

/** helper */
function assignOptions(opts, platform, arch) {
  return Object.assign({}, opts, require(Path.join(__dirname, `${platform}-${arch}.json`)));
}