// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../data/localStorage',
  '../core/View',
  './views/HeffView',
  'i18n!app/nls/heff',
  'i18n!app/nls/production'
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
    window.WMES_LINE_ID = localStorage.getItem('HEFF:LINE');
    window.WMES_STATION = localStorage.getItem('HEFF:STATION');

    viewport.showPage(new View({
      layoutName: 'blank',
      view: new HeffView({
        model: {
          nlsDomain: 'heff',
          prodLine: window.WMES_LINE_ID,
          station: +window.WMES_STATION || 0
        }
      })
    }));
  });
});
