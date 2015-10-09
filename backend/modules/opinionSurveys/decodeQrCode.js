// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var exec = require('child_process').exec;
var xml2js = require('xml2js');

module.exports = function decodeQrCode(app, module, inputFile, done)
{
  var ZXING_EXE = module.config.decodeQrExe;
  var ZBARIMG_EXE = module.config.zbarimgExe;

  decodeQrCodeUsingZxing(inputFile, function(err, results)
  {
    if (results.length !== 0)
    {
      return done(null, results);
    }

    decodeQrCodeUsingZbar(inputFile, done);
  });

  function decodeQrCodeUsingZxing(inputFile, done)
  {
    var cmd = ZXING_EXE + ' "' + inputFile + '"';

    exec(cmd, function(err, stdout, stderr)
    {
      var results = [];

      if (err)
      {
        err.stdout = stdout;
        err.stderr = stderr;

        return done(err, results);
      }

      try
      {
        results = JSON.parse(stdout).map(function(result) { return result.value; });
      }
      catch (err)
      {
        return done(err, results);
      }

      return done(null, results);
    });
  }

  function decodeQrCodeUsingZbar(inputFile, done)
  {
    var results = [];
    var cmd = ZBARIMG_EXE + ' --xml -q -Sdisable -Sqr.enable "' + inputFile + '"';

    exec(cmd, function(err, stdout)
    {
      if (err && !stdout)
      {
        return done(err, results);
      }

      xml2js.parseString(stdout || '', function(err, xml)
      {
        if (err)
        {
          return done(err, results);
        }

        var sources = xml.barcodes && Array.isArray(xml.barcodes.source) ? xml.barcodes.source : [];

        for (var sourceI = 0; sourceI < sources.length; ++sourceI)
        {
          var indexes = sources[sourceI].index;

          if (!Array.isArray(indexes))
          {
            continue;
          }

          for (var indexI = 0; indexI < indexes.length; ++indexI)
          {
            var symbols = indexes[indexI].symbol;

            if (!Array.isArray(symbols))
            {
              continue;
            }

            for (var symbolI = 0; symbolI < symbols.length; ++symbolI)
            {
              var data = symbols[symbolI].data;

              if (Array.isArray(data) && data.length)
              {
                results.push(data[0]);
              }
            }
          }
        }

        return done(null, results);
      });
    });
  }
};
