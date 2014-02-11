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
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/prodFunctions/views/decorateProdFunction'],
      function(ListPage, decorateProdFunction)
      {
        return new ListPage({
          collection: prodFunctions,
          columns: ['_id', 'label', 'position', 'direct', 'companies'],
          serializeRow: decorateProdFunction
        });
      }
    );
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
