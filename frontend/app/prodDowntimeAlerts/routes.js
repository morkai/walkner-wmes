// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './ProdDowntimeAlert',
  './ProdDowntimeAlertCollection',
  'i18n!app/nls/prodDowntimeAlerts'
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

  var canView = user.auth('PROD_DOWNTIME_ALERTS:VIEW');
  var canManage = user.auth('PROD_DOWNTIME_ALERTS:MANAGE');

  router.map('/prodDowntimeAlerts', canView, function(req)
  {
    viewport.loadPage(
      ['app/prodDowntimeAlerts/pages/ProdDowntimeAlertListPage'],
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
      ['app/prodDowntimeAlerts/pages/ProdDowntimeAlertAddFormPage'],
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
      ['app/prodDowntimeAlerts/pages/ProdDowntimeAlertDetailsPage'],
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
      ['app/prodDowntimeAlerts/pages/ProdDowntimeAlertEditFormPage'],
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
