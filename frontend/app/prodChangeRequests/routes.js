// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  './ProdChangeRequestCollection',
  'i18n!app/nls/prodChangeRequests'
], function(
  router,
  viewport,
  user,
  ProdChangeRequestCollection
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PROD_DATA:VIEW', 'PROD_DATA:CHANGES:REQUEST');

  router.map('/prodChangeRequests', canView, function(req)
  {
    viewport.loadPage(['app/prodChangeRequests/pages/ProdChangeRequestListPage'], function(ProdChangeRequestListPage)
    {
      return new ProdChangeRequestListPage({
        collection: new ProdChangeRequestCollection(null, {rqlQuery: req.rql})
      });
    });
  });
});
