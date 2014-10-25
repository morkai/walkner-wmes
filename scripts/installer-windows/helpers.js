/*jshint maxlen:false*/

'use strict';

var path = require('path');
var fs = require('fs');
var pkg = require('../../package.json');
var installerConfig = require('../../config/installer');

var CHROME_VERSION = fs.readdirSync(path.join(installerConfig.googleChromePortable, 'App', 'Chrome-bin'))
  .filter(function(file) { return /^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(file); })[0];
var DEST_INSTALLER = path.join(__dirname, '../../build/installer');
var DEST_SCRIPTS = path.join(__dirname, '../../build/scripts');
var DEST_APP = DEST_INSTALLER + '/bin/walkner-wmes-operator';
var DEST_CHROME = DEST_INSTALLER + '/bin/google-chrome';
var DEST_CHROME_BIN = DEST_CHROME + '/App/Chrome-bin/' + CHROME_VERSION;
var SRC_CHROME = installerConfig.googleChromePortable;
var SRC_CHROME_BIN = SRC_CHROME + '/App/Chrome-bin/' + CHROME_VERSION;

exports.copy = {
  scripts: {
    expand: true,
    cwd: './scripts/installer-windows',
    src: [
      'common.au3',
      'run.au3',
      'run.ico',
      'uninstall.au3',
      'uninstall.ico'
    ],
    dest: DEST_SCRIPTS
  },
  installer: {
    files: [
      {
        src: './data/.keep',
        dest: DEST_APP + '/.keep'
      },
      {
        src: './data/.keep',
        dest: DEST_INSTALLER + '/config/walkner-wmes-operator.ini'
      },
      {
        expand: true,
        cwd: SRC_CHROME_BIN,
        src: ['**', '!default_apps/*.crx', '!Locales/*.pak', 'Locales/pl.pak', 'Locales/en-US.pak'],
        dest: DEST_CHROME_BIN
      },
      {
        src: './data/GoogleChromePortable/external_extensions.json',
        dest: DEST_CHROME_BIN + '/default_apps/external_extensions.json'
      },
      {
        expand: true,
        cwd: path.dirname(SRC_CHROME_BIN),
        src: '**',
        dest: path.dirname(DEST_CHROME_BIN),
        filter: 'isFile'
      },
      {
        expand: true,
        cwd: './data/GoogleChromePortable/DefaultData',
        src: '**',
        dest: DEST_CHROME + '/App/DefaultData'
      },
      {
        src: DEST_SCRIPTS + '/Operator WMES.exe',
        dest: DEST_INSTALLER + '/Operator WMES.exe'
      },
      {
        src: DEST_SCRIPTS + '/walkner-wmes-operator-uninstall.exe',
        dest: DEST_INSTALLER + '/bin/walkner-wmes-operator-uninstall.exe'
      }
    ]
  }
};

exports.run = {
  run: {
    cmd: installerConfig.autoIt3Wrapper,
    args: [
      '/in', DEST_SCRIPTS + '/run.au3',
      '/pack',
      '/x86',
      '/NoStatus'
    ],
    options: {
      cwd: DEST_SCRIPTS
    }
  },
  uninstall: {
    cmd: installerConfig.autoIt3Wrapper,
    args: [
      '/in', DEST_SCRIPTS + '/uninstall.au3',
      '/pack',
      '/x86',
      '/NoStatus'
    ],
    options: {
      cwd: DEST_SCRIPTS
    }
  },
  install: {
    exec: '"' + installerConfig.makensis + '" ' + [
      '/INPUTCHARSET', 'UTF8',
      '/OUTPUTCHARSET', 'UTF8',
      '/DPRODUCT_GUID="' + pkg.guid + '"',
      '/DPRODUCT_VERSION="' + pkg.version + '"',
      '"' + __dirname + '/install.nsi"'
    ].join(' '),
    options: {
      cwd: __dirname
    }
  }
};

exports.replace = {
  scripts: {
    src: [
      DEST_SCRIPTS + '/common.au3',
      DEST_SCRIPTS + '/run.au3',
      DEST_SCRIPTS + '/uninstall.au3'
    ],
    overwrite: true,
    replacements: [
      {
        from: '$PRODUCT_GUID = "00000000-0000-0000-0000-000000000000"',
        to: '$PRODUCT_GUID = "' + pkg.guid + '"'
      },
      {
        from: '$PRODUCT_VERSION = "0.0.0"',
        to: '$PRODUCT_VERSION = "' + pkg.version + '"'
      },
      {
        from :'#AutoIt3Wrapper_Res_ProductVersion=0.0.0',
        to: '#AutoIt3Wrapper_Res_ProductVersion=' + pkg.version
      }
    ]
  }
};
