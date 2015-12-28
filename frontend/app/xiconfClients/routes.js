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

  var canView = user.auth('XICONF:VIEW');

  router.map('/xiconf/clients', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/xiconfClients/XiconfClientCollection',
        'app/xiconfClients/pages/XiconfClientListPage',
        'i18n!app/nls/xiconfClients',
        'i18n!app/nls/licenses'
      ],
      function(XiconfClientCollection, XiconfClientListPage)
      {
        return new XiconfClientListPage({
          collection: new XiconfClientCollection(null, {
            rqlQuery: req.rql
          })
        });
      }
    );
  });
});
