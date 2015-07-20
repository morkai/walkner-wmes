// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../prodChangeRequests/util/createShowDeleteFormPage',
  './ProdDowntime',
  './ProdDowntimeCollection',
  './pages/ProdDowntimeListPage',
  './pages/ProdDowntimeDetailsPage',
  './pages/ProdDowntimeEditFormPage',
  'i18n!app/nls/prodDowntimes'
], function(
  router,
  viewport,
  user,
  createShowDeleteFormPage,
  ProdDowntime,
  ProdDowntimeCollection,
  ProdDowntimeListPage,
  ProdDowntimeDetailsPage,
  ProdDowntimeEditFormPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PROD_DATA:VIEW', 'PROD_DOWNTIMES:VIEW');
  var canManage = user.auth('PROD_DATA:MANAGE', 'PROD_DATA:CHANGES:REQUEST');

  router.map('/prodDowntimes', canView, function(req)
  {
    viewport.showPage(new ProdDowntimeListPage({
      collection: new ProdDowntimeCollection(null, {
        rqlQuery: req.rql
      })
    }));
  });

  router.map('/prodDowntimes/:id', function(req)
  {
    viewport.showPage(new ProdDowntimeDetailsPage({
      model: new ProdDowntime({
        _id: req.params.id
      }),
      corroborate: req.query.corroborate === '1'
    }));
  });

  router.map('/prodDowntimes/:id;edit', canManage, function(req)
  {
    viewport.showPage(new ProdDowntimeEditFormPage({
      model: new ProdDowntime({_id: req.params.id})
    }));
  });

  router.map('/prodDowntimes/:id;delete', canManage, createShowDeleteFormPage(ProdDowntime));

  router.map('/prodDowntimes;settings', canManage, function(req)
  {
    viewport.loadPage('app/prodDowntimes/pages/ProdDowntimeSettingsPage', function(ProdDowntimeSettingsPage)
    {
      return new ProdDowntimeSettingsPage({
        initialTab: req.query.tab
      });
    });
  });
});
