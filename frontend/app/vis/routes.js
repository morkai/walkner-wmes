// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport'
], function(
  router,
  viewport
) {
  'use strict';

  router.map('/vis/structure', viewport.loadPage.bind(viewport, [
    'app/vis/pages/StructureVisPage',
    'css!app/vis/assets/main',
    'i18n!app/nls/vis'
  ]));
});
