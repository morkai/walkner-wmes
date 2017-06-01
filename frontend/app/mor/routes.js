// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  './Mor',
  './pages/MorPage',
  'i18n!app/nls/mor'
], function(
  router,
  viewport,
  user,
  Mor,
  MorPage
) {
  'use strict';

  router.map('/mor', user.auth('LOCAL', 'USER'), function()
  {
    viewport.showPage(new MorPage({
      model: new Mor()
    }));
  });

  router.map('/mor;settings', user.auth('MOR:MANAGE'), function(req)
  {
    viewport.loadPage(['app/mor/pages/MorSettingsPage'], function(MorSettingsPage)
    {
      return new MorSettingsPage({
        initialTab: req.query.tab
      });
    });
  });

});
