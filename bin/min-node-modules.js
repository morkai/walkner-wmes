'use strict';

const RMDIR_ALWAYS = {
  '@types': true,
  '.bin': true,
  'commander': true,
  'coffee-script': true,
  'nan': true
};
const RMDIR_LEVEL0 = {
  'async': true,
  'glob': true,
  'minimatch': true,
  'minimist': true,
  'lru-cache': true,
  'debug': true,
  'ms': true,
  'iconv-lite': true,
  'isarray': true,
  'readable-stream': true,
  'inherits': true,
  'object-assign': true,
  'semver': true,
  'component-emitter': true,
  'mongodb': true,
  'sift': true,
  'editions': true,
  'typechecker': true,
  'string_decoder': true,
  'ansi-regex': true,
  'is-fullwidth-code-point': true,
  'string-width': true,
  'strip-ansi': true,
  'cookie': true,
  'bluebird': true,
  'accepts': true,
  'negotiator': true,
  'ws': true,
  'depd': true,
  'safe-buffer': true,
  'mime': true,
  'qs': true,
  'bl': true,
  'punycode': true,
  'xmlbuilder': true,
};
const KEEP_ALWAYS = [
  /(license|copying|author)/i,
  /^package\.json$/i,
  /^\.local-chromium$/
];
const RM_ALWAYS = [
  /^doc(umentation)?s?$/,
  /typings/i,
  /^bench(mark)?/i,
  /^test/,
  /^spec(ification)?s?$/,
  /^fixtures?$/,
  /^coverage$/,
  /(ex|s)ample/i,
  /^(Gruntfile|gulpfile|jakefile|postinstall|nakefile|ender)\.js$/,
  /^karma\.conf/,
  /\.(config|min|flow)\.js$/,
  /(bower|package-lock|tslint|jsdoc|renovate|component)\.json/,
  /^tsconfig\.$/,
  /^edition-browsers$/
];
const KEEP_MODULE = {
  'dayjs': [
    /^dayjs\.min\.js$/
  ],
  'deasync': [
    new RegExp(`node-${process.versions.node.split('.')[0]}$`)
  ],
  'lodash': [
    /^lodash\.js$/
  ],
  'pdf.js-extract': [
    /^cmaps$/
  ]
};
const RM_MODULE = {
  '@js-joda/core': [
    /^src$/,
    /^js-joda\.esm\.js$/
  ],
  '@azure/ms-rest-js': [
    /^es$/,
    /^msRest\.browser\.js$/
  ],
  'ajv': [
    /^dist$/,
    /^scripts$/
  ],
  'axios': [
    /^dist$/
  ],
  'bson': [
    /^browser_build$/
  ],
  'cfb': [
    /^dist$/
  ],
  'codepage': [
    /^bits$/,
    /^dist$/
  ],
  'dayjs': [
    /^esm$/
  ],
  'deasync': [
    /^(darwin|linux|win32)-/
  ],
  'debug': [
    /^dist$/
  ],
  'ejs-amd': [
    /^ejs$/,
    /^mkdirp$/
  ],
  'engine.io-client': [
    /^engine\.io\.js$/
  ],
  'eventemitter3': [
    /^umd$/
  ],
  'frac': [
    /^dist$/
  ],
  'hpack.js': [
    /^tools$/
  ],
  'immediate': [
    /^dist$/
  ],
  'jszip': [
    /^dist$/,
    /^vendor$/
  ],
  'later': [
    /^src$/,
    /^index-browserify\.js$/,
    /^later-core\.js$/
  ],
  'lie': [
    /^dist$/
  ],
  'lodash': [
    /^fp$/,
    /\.js$/
  ],
  'moment': [
    /^package\.js$/,
    /^min$/,
    /^src$/
  ],
  'mongoose': [
    /browser\.umd\.js/
  ],
  'object.assign': [
    /^dist$/
  ],
  'object-hash': [
    /^dist$/
  ],
  'pako': [
    /^dist$/
  ],
  'printj': [
    /^dist$/
  ],
  'psl': [
    /^dist$/
  ],
  'qs': [
    /^dist$/
  ],
  'redbird': [
    /^hl-tests$/
  ],
  'socket.io-client': [
    /^dist$/
  ],
  'stackframe': [
    /^dist$/
  ],
  'underscore': [
    /^underscore-min\.js$/
  ],
  'url-parse': [
    /^dist$/
  ],
  'xlsx': [
    /^xlsx\.mini\.js$/,
    /^xlsx\.extendscript\.js$/,
    /^xlsxworker\.js$/,
    /^dist\/jszip\.js$/,
    /^dist\/xlsx\.js$/
  ],
};

const fs = require('fs');

const root = process.cwd().replace(/\\/g, '/');
const queue = [];

function findNodeModules(nodeModulesPath, level)
{
  let moduleNames = null;

  try
  {
    moduleNames = fs.readdirSync(`${root}/${nodeModulesPath}`);
  }
  catch (err)
  {
    return;
  }

  moduleNames.forEach(moduleName =>
  {
    const modulePath = `${nodeModulesPath}/${moduleName}`;

    if (RMDIR_ALWAYS[moduleName])
    {
      queue.push({
        moduleName,
        modulePath,
        level
      });

      return;
    }

    if (moduleName.startsWith('@'))
    {
      findNodeModules(modulePath, level);

      return;
    }

    if (/@[a-zA-Z0-9_-]+$/.test(nodeModulesPath))
    {
      moduleName = nodeModulesPath.split('/').pop() + '/' + moduleName;
    }

    queue.push({
      moduleName,
      modulePath,
      level
    });

    findNodeModules(`${modulePath}/node_modules`, level + 1);
  });
}

function cleanNodeModule(moduleInfo)
{
  const {moduleName, modulePath, level} = moduleInfo;

  if (RMDIR_ALWAYS[moduleName])
  {
    console.log(`rmdir always ${modulePath}`);

    rmdir(`${root}/${modulePath}`);

    return;
  }

  if (level !== 0 && RMDIR_LEVEL0[moduleName])
  {
    console.log(`rmdir level0 ${modulePath}`);

    rmdir(`${root}/${modulePath}`);

    return;
  }

  console.log(`module ${modulePath} level=${level}`);

  fs.readdirSync(`${root}/${modulePath}`, {withFileTypes: true}).forEach(dirent =>
  {
    if (KEEP_ALWAYS.some(pattern => pattern.test(dirent.name)))
    {
      return;
    }

    if (dirent.name.startsWith('.'))
    {
      console.log(`    rm dot ${dirent.name}`);

      rm(dirent, modulePath);

      return;
    }

    if (dirent.isDirectory())
    {
      cleanDirectory(moduleInfo, '', dirent);
    }
    else
    {
      cleanFile(moduleInfo, '', dirent);
    }
  });

  console.log();
}

function cleanDirectory(moduleInfo, parentPath, parentDirent)
{
  const dirPath = jp(root, moduleInfo.modulePath, parentPath, parentDirent.name);
  
  if (parentDirent.name !== 'node_modules')
  {
    const keepPatterns = KEEP_ALWAYS.concat(KEEP_MODULE[moduleInfo.moduleName] || []);

    if (keepPatterns.some(pattern => pattern.test(parentDirent.name)))
    {
      return;
    }
    
    const rmPatterns = RM_ALWAYS.concat(RM_MODULE[moduleInfo.moduleName] || []);

    if (rmPatterns.some(pattern => pattern.test(parentDirent.name)))
    {
      console.log(`    rm always ${jp(parentPath, parentDirent.name)}`);

      rm(parentDirent, jp(moduleInfo.modulePath, parentPath));

      return;
    }

    fs.readdirSync(dirPath, {withFileTypes: true}).forEach(dirent =>
    {
      if (dirent.isDirectory())
      {
        cleanDirectory(moduleInfo, jp(parentPath, parentDirent.name), dirent);
      }
      else
      {
        cleanFile(moduleInfo, jp(parentPath, parentDirent.name), dirent);
      }
    });
  }
  
  if (fs.readdirSync(dirPath).length === 0)
  {
    console.log(`    rm empty ${jp(parentPath, parentDirent.name)}`);
    
    rmdir(dirPath);
  }
}

function cleanFile(moduleInfo, parentPath, parentDirent)
{
  const keepPatterns = KEEP_ALWAYS.concat(KEEP_MODULE[moduleInfo.moduleName] || []);

  if (keepPatterns.some(pattern => pattern.test(parentDirent.name) || pattern.test(`${parentPath}/${parentDirent.name}`)))
  {
    return;
  }
  
  const rmPatterns = RM_ALWAYS.concat(RM_MODULE[moduleInfo.moduleName] || []);
  
  if (rmPatterns.some(pattern => pattern.test(parentDirent.name) || pattern.test(`${parentPath}/${parentDirent.name}`)))
  {
    console.log(`    rm always ${jp(parentPath, parentDirent.name)}`);

    rm(parentDirent, jp(moduleInfo.modulePath, parentPath));

    return;
  }
  
  if (/(\.js|json|node)$/.test(parentDirent.name))
  {
    return;
  }
  
  console.log(`    rm file ${jp(parentPath, parentDirent.name)}`);
  
  rm(parentDirent, jp(moduleInfo.modulePath, parentPath));
}

function jp(...parts)
{
  return parts.filter(p => !!p).join('/');
}

function rm(dirent, modulePath)
{
  const entryPath = jp(root, modulePath, dirent.name);

  try
  {
    if (dirent.isDirectory())
    {
      rmdir(entryPath);
    }
    else
    {
      fs.unlinkSync(entryPath);
    }
  }
  catch (err)
  {
    console.log(`rm error: ${err.message}`);
  }
}

function rmdir(path)
{
  fs.rmdirSync(path, {recursive: true});
}

findNodeModules(`node_modules`, 0);

queue.forEach(cleanNodeModule);
