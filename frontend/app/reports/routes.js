define([
  '../user',
  '../router',
  '../viewport',
  'i18n!app/nls/reports'
], function(
  user,
  router,
  viewport
) {
  'use strict';

  router.map('/reports/1', user.auth('REPORTS:VIEW'), function(req)
  {
    if (viewport.currentPage && viewport.currentPage.pageId === 'report1')
    {
      return viewport.currentPage.query.reset(req.query);
    }

    viewport.loadPage('app/reports/pages/Report1Page', function(Report1Page)
    {
      return new Report1Page({query: req.query});
    });
  });

});
