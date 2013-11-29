define([
  '../router',
  '../viewport',
  'i18n!app/nls/vis'
], function(
  router,
  viewport
) {
  'use strict';

  router.map('/vis/structure', viewport.loadPage.bind(viewport, 'app/vis/pages/StructureVisPage'));

});
