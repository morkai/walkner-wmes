// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../data/localStorage',
  '../core/View',
  './views/HeffView',
  'i18n!app/nls/heff'
], function(
  router,
  viewport,
  localStorage,
  View,
  HeffView
) {
  'use strict';

  router.map('/', function()
  {
    viewport.showPage(new View({
      layoutName: 'blank',
      view: new HeffView({
        model: {
          prodLineId: localStorage.getItem('HEFF:LINE')
        }
      })
    }));
  });
});
