// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const spawn = require('child_process').spawn;
const _ = require('lodash');

const inProgress = {};

module.exports = function buildSurveyPdf(app, module, surveyId, outputFile, done)
{
  const complete = _.once(done);

  if (inProgress[surveyId])
  {
    return inProgress[surveyId].push(complete);
  }

  inProgress[surveyId] = [complete];

  const httpServer = app[module.config.httpServerId];
  const templateUrl = 'http://' + (httpServer.config.host === '0.0.0.0' ? '127.0.0.1' : httpServer.config.host)
    + ':' + httpServer.config.port + '/opinionSurveys/' + surveyId + '.html?template=';
  const args = [
    '--quiet',
    '--dpi', '96',
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
  const p = spawn(module.config.wkhtmltopdfExe, args);
  let buffer = '';

  p.stderr.setEncoding('utf8');
  p.stderr.on('data', function(data) { buffer += data; });

  p.on('error', complete);
  p.on('exit', function(code)
  {
    const err = code ? new Error('wkhtmltopdf exit with code: ' + code + '\n' + buffer.trim()) : null;

    _.forEach(inProgress[surveyId], function(done) { done(err, outputFile); });

    delete inProgress[surveyId];
  });
};
