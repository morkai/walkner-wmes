// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './router',
  './viewport',
  './user',
  './wmes-trw-tests/pages/TestingPage',
  'i18n!app/nls/wmes-trw-tests',
  'i18n!app/nls/wmes-trw-programs'
], function(
  router,
  viewport,
  user,
  TesterPage
) {
  'use strict';

  router.map('/', user.auth('LOCAL', 'TRW:VIEW'), function()
  {
    viewport.showPage(new TesterPage());
  });
});
