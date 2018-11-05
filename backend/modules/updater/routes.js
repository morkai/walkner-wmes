// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpUpdaterRoutes(app, updaterModule)
{
  const express = app[updaterModule.config.expressId];

  updaterModule.config.manifests.forEach(manifestOptions =>
  {
    express.get(manifestOptions.path, (req, res) =>
    {
      const template = manifestOptions.template || updaterModule.manifest;
      const matches = (req.headers['user-agent'] || '').match(/Chrome\/([0-9]+)/);
      const chromeVersion = matches ? +matches[1] : 99;

      if ((!req.secure && chromeVersion >= 70) || app.options.env === 'development' || typeof template !== 'string')
      {
        return res.sendStatus(404);
      }

      const cacheManifest = template
        .replace('{version}', 'v' + updaterModule.getFrontendVersion(manifestOptions.frontendVersionKey))
        .replace('{mainJsFile}', manifestOptions.mainJsFile)
        .replace('{mainCssFile}', manifestOptions.mainCssFile);

      res.type('text/cache-manifest');
      res.send(cacheManifest);
    });
  });
};
