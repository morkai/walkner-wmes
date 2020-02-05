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
    var line = localStorage.getItem('HEFF:LINE');
    var station = localStorage.getItem('HEFF:STATION');
    var client = window.WMES_CLIENT;

    if (client && client.config && client.config.line && client.config.station)
    {
      line = client.config.line;
      station = client.config.station;
    }

    window.WMES_LINE_ID = line;
    window.WMES_STATION = station;

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
