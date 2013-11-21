'use strict';

var step = require('h5.step');
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

  express.get('/wmes.appcache', sendAppCacheManifest);

  function showIndex(req, res, next)
  {
    var sessionUser = req.session.user;
    var locale = sessionUser && sessionUser.locale ? sessionUser.locale : 'pl';

    step(
      function fetchAppDataStep()
      {
        app.mongoose.model('OrderStatus')
          .find({}, {color: 1, label: 1}).lean().exec(this.parallel());

        app.mongoose.model('DowntimeReason')
          .find({}, {label: 1}).lean().exec(this.parallel());

        app.mongoose.model('Aor')
          .find({}, {name: 1, description: 1}).lean().exec(this.parallel());

        app.mongoose.model('Company')
          .find({}, {name: 1}).lean().exec(this.parallel());

        app.mongoose.model('ProdTask')
          .find({}, {name: 1, aors: 1}).lean().exec(this.parallel());
      },
      function sendResponseStep(err, orderStatuses, downtimeReasons, aors, companies, prodTasks)
      {
        if (err)
        {
          return next(err);
        }

        var prodFunctions = app.mongoose.model('User').schema.path('prodFunction').enumValues;

        res.render('index', {
          appCache: appCache,
          appData: {
            TIME: JSON.stringify(Date.now()),
            LOCALE: JSON.stringify(locale),
            GUEST_USER: JSON.stringify(app.user.guest),
            PRIVILEGES: JSON.stringify(app.user.config.privileges),
            PROD_FUNCTIONS: JSON.stringify(prodFunctions),
            ORDER_STATUSES: JSON.stringify(orderStatuses),
            DOWNTIME_REASONS: JSON.stringify(downtimeReasons),
            AORS: JSON.stringify(aors),
            COMPANIES: JSON.stringify(companies),
            PROD_TASKS: JSON.stringify(prodTasks)
          }
        });
      }
    );
  }

  function sendRequireJsConfig(req, res)
  {
    res.type('js');
    res.render('config.js.ejs', {
      paths: requirejsPaths,
      shim: requirejsShim
    });
  }

  function sendAppCacheManifest(req, res)
  {
    if (appCache)
    {
      res.type('text/cache-manifest');
      res.sendfile('wmes.appcache', {root: express.get('static path')});
    }
    else
    {
      res.send(404);
    }
  }
};
