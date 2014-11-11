// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');
var lodash = require('lodash');
var express = require('express');
var bodyParser = require('body-parser');
var ejsAmd = require('ejs-amd');
var messageFormatAmd = require('messageformat-amd');
var MongoStore = require('./MongoStore')(express.session.Store);
var wrapAmd = require('./wrapAmd');
var rqlMiddleware = require('./rqlMiddleware');
var errorHandlerMiddleware = require('./errorHandlerMiddleware');
var crud = require('./crud');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  staticPath: 'public',
  staticBuildPath: 'public-build',
  sessionCookieKey: 'walkner.sid',
  sessionCookie: {
    maxAge: null,
    path: '/',
    httpOnly: true
  },
  cookieSecret: null,
  ejsAmdHelpers: {},
  title: 'express'
};

exports.start = function startExpressModule(app, module, done)
{
  var mongoose = app[module.config.mongooseId];

  module = app[module.name] = lodash.merge(express(), module);

  module.createHttpError = function(message, statusCode)
  {
    var httpError = new Error(message);
    httpError.status = statusCode || 400;

    return httpError;
  };

  module.crud = crud;

  var production = app.options.env === 'production';
  var staticPath = module.config[production ? 'staticBuildPath' : 'staticPath'];

  module.set('trust proxy', true);
  module.set('views', app.pathTo('templates'));
  module.set('view engine', 'ejs');
  module.set('static path', staticPath);

  app.broker.publish('express.beforeMiddleware', {
    module: module,
    express: express
  });

  if (!production)
  {
    setUpDevMiddleware(staticPath);
  }

  if (module.config.cookieSecret)
  {
    module.use(express.cookieParser(module.config.cookieSecret));
  }

  if (mongoose)
  {
    module.sessionStore = new MongoStore(mongoose.connection.db);

    module.use(express.session({
      store: module.sessionStore,
      key: module.config.sessionCookieKey,
      cookie: module.config.sessionCookie,
      secret: module.config.cookieSecret
    }));
  }

  module.use(bodyParser.json());
  module.use(bodyParser.urlencoded({extended: false}));
  module.use(bodyParser.text({type: 'text/*'}));
  module.use(rqlMiddleware());

  app.broker.publish('express.beforeRouter', {
    module: module,
    express: express
  });

  module.use(module.router);
  module.use(express.static(staticPath));

  var errorHandlerOptions = {
    title: module.config.title,
    basePath: path.resolve(__dirname, '../../../')
  };

  module.use(errorHandlerMiddleware(module, errorHandlerOptions));

  app.broker.publish('express.beforeRoutes', {
    module: module,
    express: express
  });

  app.loadDir(app.pathTo('routes'), [app, module], done);

  /**
   * @private
   * @param {string} staticPath
   */
  function setUpDevMiddleware(staticPath)
  {
    ejsAmd.wrapAmd = wrapEjsAmd.bind(null, module.config.ejsAmdHelpers);

    var templateUrlRe = /^\/app\/([a-zA-Z0-9\-]+)\/templates\/(.*?)\.js$/;
    var ejsAmdMiddleware = ejsAmd.middleware({
      views: staticPath
    });

    module.use(function(req, res, next)
    {
      var matches = req.url.match(templateUrlRe);

      if (matches === null)
      {
        return next();
      }

      ejsAmdMiddleware(req, res, next);
    });

    module.use('/app/nls/locale/', messageFormatAmd.localeMiddleware());

    module.use('/app/nls/', messageFormatAmd.nlsMiddleware({
      localeModulePrefix: 'app/nls/locale/',
      jsonPath: function(locale, nlsName)
      {
        var jsonFile = (locale === null ? 'root' : locale) + '.json';

        return path.join(staticPath, 'app', nlsName, 'nls', jsonFile);
      }
    }));
  }

  /**
   * @private
   * @param {object} ejsAmdHelpers
   * @param {string} js
   * @returns {string}
   */
  function wrapEjsAmd(ejsAmdHelpers, js)
  {
    return wrapAmd('return ' + js, ejsAmdHelpers);
  }
};
