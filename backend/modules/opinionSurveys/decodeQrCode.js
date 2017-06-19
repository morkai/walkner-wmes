// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const exec = require('child_process').exec;
const xml2js = require('xml2js');

module.exports = function decodeQrCode(app, module, inputFile, done)
{
  const ZXING_EXE = module.config.decodeQrExe;
  const ZBARIMG_EXE = module.config.zbarimgExe;

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
    const cmd = ZXING_EXE + ' "' + inputFile + '"';

    exec(cmd, function(err, stdout, stderr)
    {
      let results = [];

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
    const results = [];
    const cmd = ZBARIMG_EXE + ' --xml -q -Sdisable -Sqr.enable "' + inputFile + '"';

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

        const sources = xml.barcodes && Array.isArray(xml.barcodes.source) ? xml.barcodes.source : [];

        for (let sourceI = 0; sourceI < sources.length; ++sourceI)
        {
          const indexes = sources[sourceI].index;

          if (!Array.isArray(indexes))
          {
            continue;
          }

          for (let indexI = 0; indexI < indexes.length; ++indexI)
          {
            const symbols = indexes[indexI].symbol;

            if (!Array.isArray(symbols))
            {
              continue;
            }

            for (let symbolI = 0; symbolI < symbols.length; ++symbolI)
            {
              const data = symbols[symbolI].data;

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
