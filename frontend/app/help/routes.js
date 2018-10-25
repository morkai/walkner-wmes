// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

  router.map('/help', user.auth('LOCAL', 'USER'), function(req)
  {
    viewport.loadPage(['app/help/pages/HelpPage', 'i18n!app/nls/help'], function(HelpPage)
    {
      return new HelpPage({
        folder: req.query.folder,
        file: req.query.file
      });
    });
  });
});
