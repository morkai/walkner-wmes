// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './Category',
  './storage'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  Category,
  storage
) {
  'use strict';

  var nls = 'i18n!app/nls/wmes-fap-categories';
  var canView = user.auth('FAP:MANAGE');
  var canManage = canView;

  router.map('/fap/categories', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-fap-categories/pages/ListPage',
        nls
      ],
      function(ListPage)
      {
        return new ListPage({
          collection: storage.acquire()
        });
      }
    );
  });

  router.map('/fap/categories/:id', function(req)
  {
    viewport.loadPage(
      ['app/wmes-fap-categories/pages/DetailsPage', nls],
      function(DetailsPage)
      {
        return new DetailsPage({
          model: new Category({_id: req.params.id})
        });
      }
    );
  });

  router.map('/fap/categories;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/wmes-fap-categories/pages/AddFormPage',
        'i18n!app/nls/users',
        nls
      ],
      function(AddFormPage)
      {
        return new AddFormPage({
          model: new Category()
        });
      }
    );
  });

  router.map('/fap/categories/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/wmes-fap-categories/pages/EditFormPage',
        'i18n!app/nls/users',
        nls
      ],
      function(EditFormPage)
      {
        return new EditFormPage({
          model: new Category({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/fap/categories/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/wmes-fap-categories/Category', _, _, {
      baseBreadcrumb: '#fap/entries'
    })
  );
});
