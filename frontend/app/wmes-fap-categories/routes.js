// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../wmes-fap-entries/dictionaries',
  './Category'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  dictionaries,
  Category
) {
  'use strict';

  var nls = 'i18n!app/nls/wmes-fap-categories';
  var baseBreadcrumb = '#fap/entries';
  var canView = user.auth('FAP:MANAGE');
  var canManage = canView;

  router.map('/fap/categories', canView, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        nls
      ],
      function(ListPage)
      {
        return dictionaries.bind(new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          columns: [
            {id: 'name', className: 'is-min'},
            {id: 'active', className: 'is-min'},
            {id: 'etoCategory', className: 'is-min'},
            {id: 'planners', className: 'is-min'},
            '-'
          ],
          collection: dictionaries.categories
        }));
      }
    );
  });

  router.map('/fap/categories/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/wmes-fap-categories/templates/details',
        nls
      ],
      function(DetailsPage, detailsTemplate)
      {
        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          detailsTemplate: detailsTemplate,
          model: new Category({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/fap/categories;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-fap-categories/views/FormView',
        'i18n!app/nls/users',
        nls
      ],
      function(AddFormPage, FormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Category()
        }));
      }
    );
  });

  router.map('/fap/categories/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-fap-categories/views/FormView',
        'i18n!app/nls/users',
        nls
      ],
      function(EditFormPage, FormView)
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Category({_id: req.params.id})
        }));
      }
    );
  });

  router.map(
    '/fap/categories/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/wmes-fap-categories/Category', _, _, {
      baseBreadcrumb: baseBreadcrumb
    })
  );
});
