// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../user',
  '../router',
  '../viewport'
], function(
  user,
  router,
  viewport
) {
  'use strict';

  var css = 'css!app/factoryLayout/assets/main';
  var nls = 'i18n!app/nls/factoryLayout';
  var canView = user.auth('PROD_DATA:VIEW');
  var canManage = user.auth('FACTORY_LAYOUT:MANAGE');

  router.map('/factoryLayout', function()
  {
    router.replace('/factoryLayout/default');
  });

  router.map('/factoryLayout/:id', canView, function()
  {
    viewport.loadPage(
      ['app/factoryLayout/productionState', 'app/factoryLayout/pages/FactoryLayoutPage', css, nls],
      function(productionState, FactoryLayoutPage)
      {
        return new FactoryLayoutPage({
          model: productionState
        });
      }
    );
  });

  router.map('/factoryLayout/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/factoryLayout/FactoryLayout', 'app/factoryLayout/pages/FactoryLayoutEditPage', css, nls],
      function(FactoryLayout, FactoryLayoutEditPage)
      {
        return new FactoryLayoutEditPage({model: new FactoryLayout({_id: req.params.id})});
      }
    );
  });

  router.map('/factoryLayout;list', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/factoryLayout/productionState',
        'app/factoryLayout/ProdLineStateDisplayOptions',
        'app/factoryLayout/pages/ProdLineStateListPage',
        'css!app/prodShifts/assets/main',
        css,
        'i18n!app/nls/prodShifts',
        nls
      ],
      function(productionState, ProdLineStateDisplayOptions, ProdLineStateListPage)
      {
        return new ProdLineStateListPage({
          model: productionState,
          displayOptions: ProdLineStateDisplayOptions.fromQuery(req.query)
        });
      }
    );
  });

  router.map('/factoryLayout;settings', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/factoryLayout/productionState',
        'app/factoryLayout/pages/FactoryLayoutSettingsPage'
      ],
      function(productionState, FactoryLayoutSettingsPage)
      {
        return new FactoryLayoutSettingsPage({
          initialTab: req.query.tab,
          model: productionState
        });
      }
    );
  });
});
