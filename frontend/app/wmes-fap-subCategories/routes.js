// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../wmes-fap-entries/dictionaries',
  './SubCategory'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  dictionaries,
  SubCategory
) {
  'use strict';

  var nls = [
    'i18n!app/nls/wmes-fap-entries',
    'i18n!app/nls/wmes-fap-categories',
    'i18n!app/nls/wmes-fap-subCategories'
  ];
  var baseBreadcrumb = '#fap/entries';
  var canView = user.auth('FAP:MANAGE');
  var canManage = canView;

  router.map('/fap/subCategories', canView, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage'
      ].concat(nls),
      function(ListPage)
      {
        return dictionaries.bind(new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          columns: [
            {id: 'parent', className: 'is-min'},
            {id: 'name', className: 'is-min'},
            {id: 'active', className: 'is-min'},
            {id: 'etoCategory', className: 'is-min'},
            {id: 'planners', className: 'is-min'},
            '-'
          ],
          collection: dictionaries.subCategories
        }));
      }
    );
  });

  router.map('/fap/subCategories/:id', function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/wmes-fap-subCategories/views/DetailsView'
      ].concat(nls),
      function(DetailsPage, DetailsView)
      {
        return dictionaries.bind(new DetailsPage({
          DetailsView: DetailsView,
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          model: new SubCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/fap/subCategories;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wmes-fap-subCategories/views/FormView',
        'i18n!app/nls/users'
      ].concat(nls),
      function(AddFormPage, FormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new SubCategory()
        }));
      }
    );
  });

  router.map('/fap/subCategories/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wmes-fap-subCategories/views/FormView',
        'i18n!app/nls/users'
      ].concat(nls),
      function(EditFormPage, FormView)
      {
        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new SubCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map(
    '/fap/subCategories/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/wmes-fap-subCategories/SubCategory', _, _, {
      baseBreadcrumb: baseBreadcrumb
    })
  );
});
