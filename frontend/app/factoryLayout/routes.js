// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../user',
  '../router',
  '../viewport',
  'i18n!app/nls/factoryLayout'
], function(
  user,
  router,
  viewport
) {
  'use strict';

  router.map('/factoryLayout', function()
  {
    router.replace('/factoryLayout/default');
  });

  router.map('/factoryLayout/:id', function()
  {
    viewport.loadPage(
      ['app/factoryLayout/productionState', 'app/factoryLayout/pages/FactoryLayoutPage'],
      function(productionState, FactoryLayoutPage)
      {
        return new FactoryLayoutPage({
          model: productionState
        });
      }
    );
  });

  router.map('/factoryLayout/:id;edit', function(req)
  {
    viewport.loadPage(
      ['app/factoryLayout/FactoryLayout', 'app/factoryLayout/pages/FactoryLayoutEditPage'],
      function(FactoryLayout, FactoryLayoutEditPage)
      {
        return new FactoryLayoutEditPage({model: new FactoryLayout({_id: req.params.id})});
      }
    );
  });

  router.map('/factoryLayout;list', function(req)
  {
    viewport.loadPage(
      [
        'app/factoryLayout/productionState',
        'app/factoryLayout/ProdLineStateDisplayOptions',
        'app/factoryLayout/pages/ProdLineStateListPage'
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

  router.map('/factoryLayout;settings', user.auth('FACTORY_LAYOUT:MANAGE'), function(req)
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
