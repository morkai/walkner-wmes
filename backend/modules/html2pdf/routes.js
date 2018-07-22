// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {join} = require('path');

module.exports = function setUpHtml2pdfRoutes(app, module)
{
  const express = app[module.config.expressId];

  express.get('/html2pdf/:id.(:format)', readFileRoute);

  express.post('/html2pdf', generatePdfRoute);

  express.post('/html2pdf;print', printPdfRoute);

  function readFileRoute(req, res, next)
  {
    if (!/^[a-z0-9]{32}$/.test(req.params.id) || (req.params.format !== 'pdf' && req.params.format !== 'html'))
    {
      return next(app.createError('INPUT', 400));
    }

    res.sendFile(join(module.config.storagePath, `${req.params.id}.${req.params.format}`));
  }

  function generatePdfRoute(req, res, next)
  {
    module.generatePdf(req.body, req.query, (err, result) =>
    {
      if (err)
      {
        return next(err);
      }

      res.json(result);
    });
  }

  function printPdfRoute(req, res, next)
  {
    const {hash, printer, settings} = req.body;

    module.printPdf(hash, printer, settings, err =>
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);
    });
  }
};
