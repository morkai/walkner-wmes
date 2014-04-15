// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
