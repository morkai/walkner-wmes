// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/prodFunctions',
  './ProdFunction',
  'i18n!app/nls/prodFunctions'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  prodFunctions,
  ProdFunction
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodFunctions', canView, function()
  {
    viewport.loadPage(['app/core/pages/ListPage'], function(ListPage)
    {
      return new ListPage({
        collection: prodFunctions,
        columns: [
          {id: '_id', className: 'is-min'},
          'label',
          {id: 'fteMasterPosition', className: 'is-min'},
          {id: 'fteLeaderPosition', className: 'is-min'},
          {id: 'fteOtherPosition', className: 'is-min'},
          {id: 'direct', className: 'is-min'},
          {id: 'dirIndirRatio', className: 'is-min'},
          {id: 'companies', className: 'is-min'},
          {id: 'color', className: 'is-min'}
        ]
      });
    });
  });

  router.map('/prodFunctions/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/prodFunctions/views/ProdFunctionDetailsView'],
      function(DetailsPage, ProdFunctionDetailsView)
      {
        return new DetailsPage({
          DetailsView: ProdFunctionDetailsView,
          model: new ProdFunction({_id: req.params.id})
        });
      }
    );
  });

  router.map('/prodFunctions;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/prodFunctions/views/ProdFunctionFormView'],
      function(AddFormPage, ProdFunctionFormView)
      {
        return new AddFormPage({
          FormView: ProdFunctionFormView,
          model: new ProdFunction()
        });
      }
    );
  });

  router.map('/prodFunctions/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/prodFunctions/views/ProdFunctionFormView'],
      function(EditFormPage, ProdFunctionFormView)
      {
        return new EditFormPage({
          FormView: ProdFunctionFormView,
          model: new ProdFunction({_id: req.params.id})
        });
      }
    );
  });

  router.map('/prodFunctions/:id;delete', canManage, showDeleteFormPage.bind(null, ProdFunction));
});
