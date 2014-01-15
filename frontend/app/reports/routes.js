define([
  '../router',
  '../viewport',
  'i18n!app/nls/reports'
], function(
  router,
  viewport
) {
  'use strict';

  router.map('/reports/1', function(req)
  {
    viewport.loadPage('app/reports/pages/Report1Page', function(Report1Page)
    {
      return new Report1Page({query: req.query});
    });
  });

});
