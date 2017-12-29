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
  npmRebuild: false
}

options = assignOptions(options, opts.platform, opts.arch);

if (opts.rebuild === "true") {
  let spinner;
  let packages = [
    'node-x15',
    'leveldown',
    'secp256k1'/*,
    'wmcc-native'*/
  ];

  _rebuild();
  
  console.log(`Please wait, this may take several moments`);
  function _rebuild() {
    spinner = _spinner(`Installing ${packages[0]}`);
    const child = Child.exec(`cd ./node_modules/${packages[0]} && npm install --ignore-scripts`);

    child.on('exit', ()=>{
      clearInterval(spinner);
      spinner = _spinner(`Rebuild native module: ${packages[0]}`);
      Rebuild.rebuild({
        buildPath: Path.resolve('node_modules', packages[0]),
        electronVersion: options.electronVersion
      }).then(() => {
        _clearLine(spinner);
        console.log(`\u2714 Finished building: ${packages[0]}!`);
        packages.shift();
        if (packages.length)
          _rebuild();
        else
          _build();
      }).catch((e) => {
        _clearLine();
        console.error(e);
      });
    });
  }
} else {
  _build();
}

function _build() {
  Builder.build({
    config: options
  }).then(() => {
    console.log(`\u2714 Successfully compiled!`);
    process.exit(0);
  }).catch((e) => {
    console.error(e);
    process.exit(-1);
  });
}

function _spinner(t) {
  let x = 0;
  const f = ["- ----","-- ---","--- --","---- -","----- ","---- -","--- --","-- ---","- ----"," -----"];
  return setInterval(()=>{
    x = (x>f.length-1)?0:x;
    process.stdout.write(`\r${f[x]} ${t} ${f[x]}`);
    x++;
  }, 150);
}

function _clearLine (o) {
  if (o) clearInterval(o);
  process.stdout.clearLine();
  process.stdout.write(`\r`);
}

/** helper */
function assignOptions(opts, platform, arch) {
  return Object.assign({}, opts, require(Path.join(__dirname, `${platform}-${arch}.json`)));
}