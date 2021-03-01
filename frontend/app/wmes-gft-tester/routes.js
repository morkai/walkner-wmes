// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/router',
  'app/viewport',
  'app/data/localStorage',
  'app/wmes-gft-tester/GftStation',
  'app/wmes-gft-tester/pages/TesterPage',
  'i18n!app/nls/wmes-gft-tester'
], function(
  router,
  viewport,
  localStorage,
  GftStation,
  TesterPage
) {
  'use strict';

  router.map('/', function()
  {
    let line = localStorage.getItem('GFT:LINE');
    let station = localStorage.getItem('GFT:STATION');
    const client = window.WMES_CLIENT;

    if (client && client.config && client.config.line && client.config.station)
    {
      line = client.config.line;
      station = client.config.station;
    }

    window.WMES_LINE_ID = line;
    window.WMES_STATION = station;

    const model = new GftStation({
      line: window.WMES_LINE_ID,
      station: +window.WMES_STATION || 0
    });

    viewport.showPage(new TesterPage({
      model: model
    }));
  });
});
