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
  viewport,
  productionState
) {
  'use strict';

  router.map('/factoryLayout', function()
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

  router.map('/factoryLayout/prodLines', function(req)
  {
    viewport.loadPage(
      [
        'app/factoryLayout/productionState',
        'app/factoryLayout/ProdLineStateListOptions',
        'app/factoryLayout/pages/ProdLineStateListPage'
      ],
      function(productionState, ProdLineStateListOptions, ProdLineStateListPage)
      {
        return new ProdLineStateListPage({
          model: productionState,
          listOptions: ProdLineStateListOptions.fromQuery(req.query)
        });
      }
    );
  });

});
