// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpHeffRoutes(app, module)
{
  const express = app[module.config.expressId];
  const updaterModule = app[module.config.updaterId];

  express.get('/heff', function(req, res)
  {
    const sessionUser = req.session.user;
    const locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';

    res.format({
      'text/html': function()
      {
        res.render('index', {
          appCacheManifest: app.options.env !== 'development' ? '/heff/manifest.appcache' : '',
          appData: {
            ENV: JSON.stringify(app.options.env),
            VERSIONS: JSON.stringify(updaterModule ? updaterModule.getVersions() : {}),
            TIME: JSON.stringify(Date.now()),
            LOCALE: JSON.stringify(locale),
            FRONTEND_SERVICE: JSON.stringify('heff')
          },
          mainJsFile: 'wmes-heff.js',
          mainCssFile: 'assets/wmes-heff.css'
        });
      }
    });
  });
};
