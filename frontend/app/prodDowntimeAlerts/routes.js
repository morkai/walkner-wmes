// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var css = 'css!app/prodDowntimeAlerts/assets/main';
  var nls = 'i18n!app/nls/prodDowntimeAlerts';
  var canView = user.auth('PROD_DOWNTIME_ALERTS:VIEW');
  var canManage = user.auth('PROD_DOWNTIME_ALERTS:MANAGE');

  router.map('/prodDowntimeAlerts', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/prodDowntimeAlerts/ProdDowntimeAlertCollection',
        'app/prodDowntimeAlerts/pages/ProdDowntimeAlertListPage',
        nls
      ],
      function(ProdDowntimeAlertCollection, ProdDowntimeAlertListPage)
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
      [
        'app/prodDowntimeAlerts/ProdDowntimeAlert',
        'app/prodDowntimeAlerts/pages/ProdDowntimeAlertAddFormPage',
        css,
        nls
      ],
      function(ProdDowntimeAlert, ProdDowntimeAlertAddFormPage)
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
      [
        'app/prodDowntimeAlerts/ProdDowntimeAlert',
        'app/prodDowntimeAlerts/pages/ProdDowntimeAlertDetailsPage',
        css,
        nls
      ],
      function(ProdDowntimeAlert, ProdDowntimeAlertDetailsPage)
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
      [
        'app/prodDowntimeAlerts/ProdDowntimeAlert',
        'app/prodDowntimeAlerts/pages/ProdDowntimeAlertEditFormPage',
        css,
        nls
      ],
      function(ProdDowntimeAlert, ProdDowntimeAlertEditFormPage)
      {
        return new ProdDowntimeAlertEditFormPage({
          model: new ProdDowntimeAlert({
            _id: req.params.id
          })
        });
      }
    );
  });

  router.map('/prodDowntimeAlerts/:id;delete', canManage, _.partial(
    showDeleteFormPage,
    'app/prodDowntimeAlerts/ProdDowntimeAlert',
    _,
    _,
    {baseBreadcrumb: '#prodDowntimes'}
  ));
});
