// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  var canView = user.auth('LOCAL', 'PROD_DATA:VIEW');

  router.map('/prodLogEntries', canView, function(req)
  {
    viewport.loadPage(
      ['app/prodLogEntries/pages/ProdLogEntryListPage', 'i18n!app/nls/prodLogEntries'],
      function(ProdLogEntryListPage)
      {
        return new ProdLogEntryListPage({rql: req.rql});
      }
    );
  });
});
