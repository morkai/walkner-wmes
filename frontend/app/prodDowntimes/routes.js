// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './ProdDowntime',
  'i18n!app/nls/prodDowntimes'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  ProdDowntime
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PROD_DOWNTIMES:VIEW');
  var canManage = user.auth('PROD_DOWNTIMES:MANAGE');

  router.map('/prodDowntimes', canView, function(req)
  {
    viewport.loadPage(
      ['app/prodDowntimes/pages/ProdDowntimeListPage'],
      function(ProdDowntimeListPage)
      {
        return new ProdDowntimeListPage({rql: req.rql});
      }
    );
  });

  router.map('/prodDowntimes/:id', function(req)
  {
    viewport.loadPage(
      ['app/prodDowntimes/pages/ProdDowntimeDetailsPage'],
      function(ProdDowntimeDetailsPage)
      {
        return new ProdDowntimeDetailsPage({modelId: req.params.id});
      }
    );
  });

  router.map('/prodDowntimes/:id;corroborate', canManage, function(req, referer)
  {
    viewport.loadPage(
      ['app/prodDowntimes/pages/CorroborateProdDowntimePage'],
      function(CorroborateProdDowntimePage)
      {
        return new CorroborateProdDowntimePage({
          cancelUrl: referer,
          modelId: req.params.id
        });
      }
    );
  });

  router.map('/prodDowntimes/:id;edit', user.auth('PROD_DATA:MANAGE'), function(req)
  {
    viewport.loadPage(
      ['app/prodDowntimes/pages/EditProdDowntimeFormPage'],
      function(EditProdDowntimeFormPage)
      {
        return new EditProdDowntimeFormPage({
          model: new ProdDowntime({_id: req.params.id})
        });
      }
    );
  });

  router.map('/prodDowntimes/:id;delete', canManage, showDeleteFormPage.bind(null, ProdDowntime));
});
