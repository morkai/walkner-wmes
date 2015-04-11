// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './ProdDowntime',
  './pages/ProdDowntimeListPage',
  './pages/ProdDowntimeDetailsPage',
  './pages/ProdDowntimeEditFormPage',
  'i18n!app/nls/prodDowntimes'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  ProdDowntime,
  ProdDowntimeListPage,
  ProdDowntimeDetailsPage,
  ProdDowntimeEditFormPage
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PROD_DOWNTIMES:VIEW');
  var canManage = user.auth('PROD_DATA:MANAGE');

  router.map('/prodDowntimes', canView, function(req)
  {
    viewport.showPage(new ProdDowntimeListPage({rql: req.rql}));
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

  router.map('/prodDowntimes/:id;delete', canManage, showDeleteFormPage.bind(null, ProdDowntime));

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
