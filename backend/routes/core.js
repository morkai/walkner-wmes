'use strict';

var requirejsConfig = require('../../config/require');

module.exports = function startCoreRoutes(app, express)
{
  var appCache = app.options.env === 'production';
  var requirejsPaths = JSON.stringify(requirejsConfig.paths);
  var requirejsShim = JSON.stringify(requirejsConfig.shim);

  express.get('/', showIndex);

  express.get('/time', function(req, res)
  {
    res.send(Date.now().toString());
  });

  express.get('/config.js', sendRequireJsConfig);

  function showIndex(req, res)
  {
    var sessionUser = req.session.user;
    var locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';

    // TODO: Add caching
    res.render('index', {
      appCache: appCache,
      appData: {
        VERSIONS: JSON.stringify({
          backend: app.updater.package.backendVersion,
          frontend: app.updater.package.frontendVersion
        }),
        TIME: JSON.stringify(Date.now()),
        LOCALE: JSON.stringify(locale),
        GUEST_USER: JSON.stringify(app.user.guest),
        PRIVILEGES: JSON.stringify(app.user.config.privileges),
        PROD_FUNCTIONS: JSON.stringify(app.prodFunctions.models),
        COMPANIES: JSON.stringify(app.companies.models),
        DIVISIONS: JSON.stringify(app.divisions.models),
        SUBDIVISIONS: JSON.stringify(app.subdivisions.models),
        MRP_CONTROLLERS: JSON.stringify(app.mrpControllers.models),
        PROD_FLOWS: JSON.stringify(app.prodFlows.models),
        WORK_CENTERS: JSON.stringify(app.workCenters.models),
        PROD_LINES: JSON.stringify(app.prodLines.models.map(function(prodLine)
        {
          return {
            _id: prodLine.get('_id'),
            workCenter: prodLine.get('workCenter'),
            description: prodLine.get('description')
          };
        })),
        AORS: JSON.stringify(app.aors.models),
        ORDER_STATUSES: JSON.stringify(app.orderStatuses.models),
        DOWNTIME_REASONS: JSON.stringify(app.downtimeReasons.models.map(function(downtimeReason)
        {
          return {
            _id: downtimeReason.get('_id'),
            label: downtimeReason.get('label'),
            pressPosition: downtimeReason.get('pressPosition')
          };
        }))
      }
    });
  }

  function sendRequireJsConfig(req, res)
  {
    res.type('js');
    res.render('config.js.ejs', {
      paths: requirejsPaths,
      shim: requirejsShim
    });
  }
};
