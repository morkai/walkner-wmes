// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  'app/data/localStorage',
  'app/heff/HeffState',
  'app/heff/pages/HeffPage',
  'i18n!app/nls/heff',
  'i18n!app/nls/production',
  'i18n!app/nls/prodShifts'
], function(
  router,
  viewport,
  localStorage,
  HeffState,
  HeffPage
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

    var heffState = new HeffState({
      prodLine: window.WMES_LINE_ID,
      station: +window.WMES_STATION || 0
    });

    viewport.showPage(new HeffPage({
      model: heffState
    }));
  });
});
