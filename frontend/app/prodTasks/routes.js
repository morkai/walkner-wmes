// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './ProdTaskCollection',
  './ProdTask'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  ProdTaskCollection,
  ProdTask
) {
  'use strict';

  var nls = 'i18n!app/nls/prodTasks';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodTasks', canView, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/prodTasks/views/ProdTaskListView', nls],
      function(ListPage, ProdTaskListView)
      {
        return new ListPage({
          ListView: ProdTaskListView,
          collection: new ProdTaskCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/prodTasks/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/prodTasks/templates/details', nls],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new ProdTask({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/prodTasks;add', canManage, function()
  {
    viewport.loadPage(['app/prodTasks/pages/AddProdTaskFormPage', nls], function(AddProdTaskFormPage)
    {
      return new AddProdTaskFormPage({model: new ProdTask()});
    });
  });

  router.map('/prodTasks/:id;edit', canManage, function(req)
  {
    viewport.loadPage(['app/prodTasks/pages/EditProdTaskFormPage', nls], function(EditProdTaskFormPage)
    {
      return new EditProdTaskFormPage({model: new ProdTask({_id: req.params.id})});
    });
  });

  router.map('/prodTasks/:id;delete', canManage, showDeleteFormPage.bind(null, ProdTask));
});
