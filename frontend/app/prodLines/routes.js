// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/prodLines',
  './ProdLine'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  prodLines,
  ProdLine
) {
  'use strict';

  var nls = 'i18n!app/nls/prodLines';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodLines', canView, function()
  {
    viewport.loadPage(
      ['app/prodLines/pages/ProdLineListPage', nls],
      function(ProdLineListPage)
      {
        return new ProdLineListPage({
          collection: prodLines
        });
      }
    );
  });

  router.map('/prodLines/:id', function(req)
  {
    viewport.loadPage(
      ['app/prodLines/pages/ProdLineDetailsPage', nls],
      function(ProdLineDetailsPage)
      {
        return new ProdLineDetailsPage({
          model: new ProdLine({_id: req.params.id})
        });
      }
    );
  });

  router.map('/prodLines;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/prodLines/views/ProdLineFormView', nls],
      function(AddFormPage, ProdLineFormView)
      {
        return new AddFormPage({
          FormView: ProdLineFormView,
          model: new ProdLine()
        });
      }
    );
  });

  router.map('/prodLines/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/prodLines/views/ProdLineFormView', nls],
      function(EditFormPage, ProdLineFormView)
      {
        return new EditFormPage({
          FormView: ProdLineFormView,
          model: new ProdLine({_id: req.params.id})
        });
      }
    );
  });

  router.map('/prodLines/:id;delete', canManage, showDeleteFormPage.bind(null, ProdLine));
});
