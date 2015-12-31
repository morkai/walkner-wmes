// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './ProdDowntimeAlert',
  './ProdDowntimeAlertCollection'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  ProdDowntimeAlert,
  ProdDowntimeAlertCollection
) {
  'use strict';

  var nls = 'i18n!app/nls/prodDowntimeAlerts';
  var canView = user.auth('PROD_DOWNTIME_ALERTS:VIEW');
  var canManage = user.auth('PROD_DOWNTIME_ALERTS:MANAGE');

  router.map('/prodDowntimeAlerts', canView, function(req)
  {
    viewport.loadPage(
      ['app/prodDowntimeAlerts/pages/ProdDowntimeAlertListPage', nls],
      function(ProdDowntimeAlertListPage)
      {
        return new ProdDowntimeAlertListPage({
          collection: new ProdDowntimeAlertCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });

  router.map('/prodDowntimeAlerts;add', canManage, function()
  {
    viewport.loadPage(
      ['app/prodDowntimeAlerts/pages/ProdDowntimeAlertAddFormPage', nls],
      function(ProdDowntimeAlertAddFormPage)
      {
        return new ProdDowntimeAlertAddFormPage({
          model: new ProdDowntimeAlert()
        });
      }
    );
  });

  router.map('/prodDowntimeAlerts/:id', canView, function(req)
  {
    viewport.loadPage(
      ['app/prodDowntimeAlerts/pages/ProdDowntimeAlertDetailsPage', nls],
      function(ProdDowntimeAlertDetailsPage)
      {
        return new ProdDowntimeAlertDetailsPage({
          model: new ProdDowntimeAlert({
            _id: req.params.id
          })
        });
      }
    );
  });

  router.map('/prodDowntimeAlerts/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/prodDowntimeAlerts/pages/ProdDowntimeAlertEditFormPage', nls],
      function(ProdDowntimeAlertEditFormPage)
      {
        return new ProdDowntimeAlertEditFormPage({
          model: new ProdDowntimeAlert({
            _id: req.params.id
          })
        });
      }
    );
  });

  router.map('/prodDowntimeAlerts/:id;delete', canManage, _.partial(showDeleteFormPage, ProdDowntimeAlert, _, _, {
    baseBreadcrumb: '#prodDowntimes'
  }));
});
