// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../router',
  '../viewport',
  '../data/localStorage',
  '../core/View',
  './views/MrlView',
  'i18n!app/nls/mrl'
], function(
  t,
  router,
  viewport,
  localStorage,
  View,
  MrlView
) {
  'use strict';

  router.map('/', function()
  {
    var prodLineId = localStorage.getItem('MRL:LINE');

    if (!prodLineId)
    {
      localStorage.setItem('MRL:LINE', prodLineId = window.prompt(t('mrl', 'linePrompt')) || ''); // eslint-disable-line no-alert
    }

    viewport.showPage(new View({
      layoutName: 'blank',
      breadcrumbs: [t.bound('mrl', 'title')],
      view: new MrlView({
        model: {
          prodLineId: prodLineId
        }
      })
    }));
  });
});
