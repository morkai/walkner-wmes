// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/prodLines',
  './ProdLine',
  'i18n!app/nls/prodLines'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  prodLines,
  ProdLine
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodLines', canView, function()
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/prodLines/views/ProdLineListView'],
      function(ListPage, ProdLineListView)
      {
        return new ListPage({
          ListView: ProdLineListView,
          collection: prodLines
        });
      }
    );
  });

  router.map('/prodLines/:id', function(req)
  {
    viewport.loadPage(
      ['app/prodLines/pages/ProdLineDetailsPage'],
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
      ['app/core/pages/AddFormPage', 'app/prodLines/views/ProdLineFormView'],
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
      ['app/core/pages/EditFormPage', 'app/prodLines/views/ProdLineFormView'],
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
