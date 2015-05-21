// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');

module.exports = function setUpUpdaterRoutes(app, updaterModule)
{
  var express = app[updaterModule.config.expressId];

  _.forEach(updaterModule.config.manifests, function(manifestOptions)
  {
    express.get(manifestOptions.path, function(req, res)
    {
      var template = manifestOptions.template || updaterModule.manifest;

      if (app.options.env === 'development' || typeof template !== 'string')
      {
        return res.sendStatus(404);
      }

      var cacheManifest = template
        .replace('{version}', 'v' + updaterModule.getFrontendVersion())
        .replace('{mainJsFile}', manifestOptions.mainJsFile)
        .replace('{mainCssFile}', manifestOptions.mainCssFile);

      res.type('text/cache-manifest');
      res.send(cacheManifest);
    });
  });
};
