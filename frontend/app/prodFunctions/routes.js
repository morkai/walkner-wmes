// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/prodFunctions',
  './ProdFunction'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  prodFunctions,
  ProdFunction
) {
  'use strict';

  var nls = 'i18n!app/nls/prodFunctions';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodFunctions', canView, function()
  {
    viewport.loadPage(['app/core/pages/ListPage', nls], function(ListPage)
    {
      return new ListPage({
        collection: prodFunctions,
        columns: [
          {id: '_id', className: 'is-min'},
          'label',
          {id: 'direct', className: 'is-min'},
          {id: 'dirIndirRatio', className: 'is-min'},
          {id: 'color', className: 'is-min'}
        ]
      });
    });
  });

  router.map('/prodFunctions/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/prodFunctions/views/ProdFunctionDetailsView', nls],
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
      ['app/core/pages/AddFormPage', 'app/prodFunctions/views/ProdFunctionFormView', nls],
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
      ['app/core/pages/EditFormPage', 'app/prodFunctions/views/ProdFunctionFormView', nls],
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
