// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const path = require('path');
const express = require('express');
const ejsAmd = require('ejs-amd');
const messageFormatAmd = require('messageformat-amd');
const wrapAmd = require('./wrapAmd');

try { require('iconv-lite').encodingExists('UTF-8'); }
catch (err) { console.log('Failed to load iconv-lite: %s', err.message); }

exports.DEFAULT_CONFIG = {
  staticPath: 'public',
  staticBuildPath: 'public-build',
  ejsAmdHelpers: {}
};

exports.start = function startExpressStaticModule(app, module)
{
  const config = module.config;
  const development = app.options.env === 'development';
  const staticPath = config[development ? 'staticPath' : 'staticBuildPath'];
  const expressApp = express();

  module.staticPath = staticPath;

  module.app = expressApp;

  expressApp.set('trust proxy', true);
  expressApp.set('view engine', 'ejs');
  expressApp.set('views', app.pathTo('templates'));

  if (development)
  {
    expressApp.set('json spaces', 2);
  }

  if (development)
  {
    setUpDevMiddleware(staticPath);
  }

  expressApp.use(express.static(staticPath));

  /**
   * @private
   * @param {string} staticPath
   */
  function setUpDevMiddleware(staticPath)
  {
    ejsAmd.wrapAmd = wrapEjsAmd.bind(null, config.ejsAmdHelpers);

    const templateUrlRe = /^\/app\/([a-zA-Z0-9\-]+)\/templates\/(.*?)\.js$/;
    const ejsAmdMiddleware = ejsAmd.middleware({
      views: staticPath
    });

    expressApp.use(function runEjsAmdMiddleware(req, res, next)
    {
      const matches = req.url.match(templateUrlRe);

      if (matches === null)
      {
        return next();
      }

      ejsAmdMiddleware(req, res, next);
    });

    expressApp.use('/app/nls/locale/', messageFormatAmd.localeMiddleware());

    expressApp.use('/app/nls/', messageFormatAmd.nlsMiddleware({
      localeModulePrefix: 'app/nls/locale/',
      jsonPath: function(locale, nlsName)
      {
        const jsonFile = (locale === null ? 'root' : locale) + '.json';

        return path.join(staticPath, 'app', nlsName, 'nls', jsonFile);
      }
    }));
  }

  /**
   * @private
   * @param {Object} ejsAmdHelpers
   * @param {string} js
   * @returns {string}
   */
  function wrapEjsAmd(ejsAmdHelpers, js)
  {
    return wrapAmd('return ' + js, ejsAmdHelpers);
  }
};
