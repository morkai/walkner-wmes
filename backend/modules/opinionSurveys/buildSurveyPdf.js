// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var spawn = require('child_process').spawn;
var _ = require('lodash');

module.exports = function buildSurveyPdf(app, module, surveyId, outputFile, done)
{
  var complete = _.once(done);
  var httpServer = app[module.config.httpServerId];
  var templateUrl = 'http://' + (httpServer.config.host === '0.0.0.0' ? '127.0.0.1' : httpServer.config.host)
    + ':' + httpServer.config.port + '/opinionSurveys/' + surveyId + '.html?template=';
  var args = [
    '--quiet',
    '--dpi', '600',
    '--image-dpi', '600',
    '--image-quality', '100',
    '--page-size', 'A4',
    '--orientation', 'Portrait',
    '-T', '23mm',
    '-R', '0',
    '-B', '20mm',
    '-L', '0',
    '--no-pdf-compression',
    '--no-outline',
    '--disable-smart-shrinking',
    '--header-html', templateUrl + 'print-hd',
    '--footer-html', templateUrl + 'print-ft',
    templateUrl + 'print-intro',
    templateUrl + 'print-survey',
    outputFile
  ];
  var p = spawn(module.config.wkhtmltopdfExe, args);
  var buffer = '';

  p.stderr.setEncoding('utf8');
  p.stderr.on('data', function(data) { buffer += data; });

  p.on('error', complete);
  p.on('exit', function(code)
  {
    if (code)
    {
      complete(new Error("wkhtmltopdf exit with code: " + code + "\n" + buffer.trim()));
    }
    else
    {
      complete(null, outputFile);
    }
  });
};
