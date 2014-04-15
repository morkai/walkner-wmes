// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/prodFlows',
  './ProdFlow',
  'i18n!app/nls/prodFlows'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  prodFlows,
  ProdFlow
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodFlows', canView, function()
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/prodFlows/views/ProdFlowListView'],
      function(ListPage, ProdFlowListView)
      {
        return new ListPage({
          ListView: ProdFlowListView,
          collection: prodFlows
        });
      }
    );
  });

  router.map('/prodFlows/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/prodFlows/views/ProdFlowDetailsView'],
      function(DetailsPage, ProdFlowDetailsView)
      {
        return new DetailsPage({
          DetailsView: ProdFlowDetailsView,
          model: new ProdFlow({_id: req.params.id})
        });
      }
    );
  });

  router.map('/prodFlows;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/prodFlows/views/ProdFlowFormView'],
      function(AddFormPage, ProdFlowFormView)
      {
        return new AddFormPage({
          FormView: ProdFlowFormView,
          model: new ProdFlow()
        });
      }
    );
  });

  router.map('/prodFlows/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/prodFlows/views/ProdFlowFormView'],
      function(EditFormPage, ProdFlowFormView)
      {
        return new EditFormPage({
          FormView: ProdFlowFormView,
          model: new ProdFlow({_id: req.params.id})
        });
      }
    );
  });

  router.map('/prodFlows/:id;delete', canManage, showDeleteFormPage.bind(null, ProdFlow));

});
