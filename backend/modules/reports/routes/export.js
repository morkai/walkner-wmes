// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const fs = require('fs');
const tmpdir = require('os').tmpdir;
const exec = require('child_process').exec;

const DIACRITICS = {
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
  /* jshint -W015*/

  const input = req.body;
  const svg = input.svg;

  if (typeof svg !== 'string'
    || svg.length === 0
    || svg.indexOf('<!ENTITY') !== -1
    || svg.indexOf('<!DOCTYPE') !== -1)
  {
    return res.sendStatus(400);
  }

  const filename = typeof input.filename === 'string' ? cleanFilename(input.filename) : 'chart';
  let typeArg = null;
  let ext = null;

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

  let width = parseInt(input.width, 10);

  if (isNaN(width))
  {
    width = 0;
  }

  const tmpDir = tmpdir();
  const tmpFilename = (Date.now() + Math.random()).toString();
  const tmpFile = path.join(tmpDir, tmpFilename) + '.svg';
  const outFile = path.join(tmpDir, tmpFilename + '.' + ext);

  let cmd = reportsModule.config.javaBatik + ' ' + typeArg + ' -d "' + outFile + '"';

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

        return res.status(500).send(stderr);
      }

      if (!res.headersSent)
      {
        res.attachment(filename + '.' + ext);
        res.sendFile(outFile, cleanup);
      }
    });
  });

  function cleanup()
  {
    fs.unlink(tmpFile, () => {});
    fs.unlink(outFile, () => {});
  }
};

function cleanFilename(filename)
{
  return filename
    .replace(/[^a-zA-Z0-9_\-]/g, function(c) { return DIACRITICS[c] || ' '; })
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_');
}
