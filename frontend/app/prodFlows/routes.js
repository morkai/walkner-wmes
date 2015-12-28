// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/prodFlows',
  './ProdFlow'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  prodFlows,
  ProdFlow
) {
  'use strict';

  var nls = 'i18n!app/nls/prodFlows';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodFlows', canView, function()
  {
    viewport.loadPage(
      ['app/prodFlows/pages/ProdFlowListPage', nls],
      function(ProdFlowListPage)
      {
        return new ProdFlowListPage({
          collection: prodFlows
        });
      }
    );
  });

  router.map('/prodFlows/:id', function(req)
  {
    viewport.loadPage(
      ['app/prodFlows/pages/ProdFlowDetailsPage', nls],
      function(ProdFlowDetailsPage)
      {
        return new ProdFlowDetailsPage({
          model: new ProdFlow({_id: req.params.id})
        });
      }
    );
  });

  router.map('/prodFlows;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/prodFlows/views/ProdFlowFormView', nls],
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
      ['app/core/pages/EditFormPage', 'app/prodFlows/views/ProdFlowFormView', nls],
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
