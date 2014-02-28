define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './ProdTaskCollection',
  './ProdTask',
  'i18n!app/nls/prodTasks'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  ProdTaskCollection,
  ProdTask
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/prodTasks', canView, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/prodTasks/views/ProdTaskListView'],
      function(ListPage, ProdTaskListView)
      {
        return new ListPage({
          ListView: ProdTaskListView,
          collection: new ProdTaskCollection({rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/prodTasks/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/prodTasks/templates/details'],
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
    viewport.loadPage('app/prodTasks/pages/AddProdTaskFormPage', function(AddProdTaskFormPage)
    {
      return new AddProdTaskFormPage({model: new ProdTask()});
    });
  });

  router.map('/prodTasks/:id;edit', canManage, function(req)
  {
    viewport.loadPage('app/prodTasks/pages/EditProdTaskFormPage', function(EditProdTaskFormPage)
    {
      return new EditProdTaskFormPage({model: new ProdTask({_id: req.params.id})});
    });
  });

  router.map('/prodTasks/:id;delete', canManage, showDeleteFormPage.bind(null, ProdTask));

});
