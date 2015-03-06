// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');
var fs = require('fs');
var tmpdir = require('os').tmpdir;
var exec = require('child_process').exec;

var DIACRITICS = {
  ę: 'e',
  ą: 'a',
  ś: 's',
  ł: 'l',
  ż: 'z',
  ź: 'z',
  ć: 'c',
  ń: 'n',
  Ę: 'E',
  Ą: 'A',
  Ś: 'S',
  Ł: 'L',
  Ż: 'Z',
  Ź: 'Z',
  Ć: 'C',
  Ń: 'N'
};


module.exports = function exportRoute(reportsModule, req, res, next)
{
  /*jshint -W015*/

  var input = req.body;
  var svg = input.svg;

  if (typeof svg !== 'string'
    || svg.length === 0
    || svg.indexOf('<!ENTITY') !== -1
    || svg.indexOf('<!DOCTYPE') !== -1)
  {
    return res.send(400);
  }

  var filename = typeof input.filename === 'string' ? cleanFilename(input.filename) : 'chart';
  var typeArg = null;
  var ext = null;

  switch (input.type)
  {
    case 'image/png':
      typeArg = '-m image/png';
      ext = 'png';
      break;

    case 'image/jpeg':
      typeArg = '-m image/jpeg';
      ext = 'jpg';
      break;

    case 'application/pdf':
      typeArg = '-m application/pdf';
      ext = 'pdf';
      break;
  }

  if (typeArg === null)
  {
    res.attachment(filename + '.svg');

    return res.send(svg);
  }

  var width = parseInt(input.width, 10);

  if (isNaN(width))
  {
    width = 0;
  }

  var tmpDir = tmpdir();
  var tmpFilename = (Date.now() + Math.random()).toString();
  var tmpFile = path.join(tmpDir, tmpFilename) + '.svg';
  var outFile = path.join(tmpDir, tmpFilename + '.' + ext);

  var cmd = reportsModule.config.javaBatik + ' ' + typeArg + ' -d "' + outFile + '"';

  if (width > 0)
  {
    cmd += ' ' + width;
  }

  cmd += ' "' + tmpFile + '"';

  fs.writeFile(tmpFile, svg, 'utf8', function(err)
  {
    if (err)
    {
      return next(err);
    }

    exec(cmd, function(err, stdout, stderr)
    {
      if (err)
      {
        cleanup();

        return next(err);
      }

      if (stderr.length)
      {
        cleanup();

        return res.send(stderr, 500);
      }

      if (!res.headersSent)
      {
        res.attachment(filename + '.' + ext);
        res.sendfile(outFile, cleanup);
      }
    });
  });

  function cleanup()
  {
    fs.unlink(tmpFile);
    fs.unlink(outFile);
  }
};

function cleanFilename(filename)
{
  return filename
    .replace(/[^a-zA-Z0-9_\-]/g, function(c) { return DIACRITICS[c] || ' '; })
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_');
}
