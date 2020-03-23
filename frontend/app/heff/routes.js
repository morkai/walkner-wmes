// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../data/localStorage',
  '../core/View',
  '../core/Model',
  './views/HeffView',
  'i18n!app/nls/heff',
  'i18n!app/nls/production',
  'i18n!app/nls/prodShifts'
], function(
  router,
  viewport,
  localStorage,
  View,
  Model,
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

    var model = new Model({
      prodLine: window.WMES_LINE_ID,
      station: +window.WMES_STATION || 0,
      date: null,
      quantitiesDone: []
    });

    model.nlsDomain = 'heff';

    viewport.showPage(new View({
      layoutName: 'blank',
      view: new HeffView({
        model: model
      })
    }));
  });
});
