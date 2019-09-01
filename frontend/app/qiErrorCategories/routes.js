// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/qiErrorCategories';
  var canView = user.auth('QI:DICTIONARIES:VIEW');
  var canManage = user.auth('QI:DICTIONARIES:MANAGE');

  router.map('/qi/errorCategories', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/qiErrorCategories/QiErrorCategoryCollection',
        nls
      ],
      function(ListPage, QiErrorCategoryCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new QiErrorCategoryCollection(null, {rqlQuery: req.rql}),
          columns: [
            'name'
          ]
        });
      }
    );
  });

  router.map('/qi/errorCategories/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/qiErrorCategories/QiErrorCategory',
        'app/qiErrorCategories/templates/details',
        nls
      ],
      function(DetailsPage, QiErrorCategory, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new QiErrorCategory({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/qi/errorCategories;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/qiErrorCategories/QiErrorCategory',
        'app/qiErrorCategories/views/QiErrorCategoryFormView',
        nls
      ],
      function(AddFormPage, QiErrorCategory, QiErrorCategoryFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: QiErrorCategoryFormView,
          model: new QiErrorCategory()
        });
      }
    );
  });

  router.map('/qi/errorCategories/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/qiErrorCategories/QiErrorCategory',
        'app/qiErrorCategories/views/QiErrorCategoryFormView',
        nls
      ],
      function(EditFormPage, QiErrorCategory, QiErrorCategoryFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: QiErrorCategoryFormView,
          model: new QiErrorCategory({_id: req.params.id})
        });
      }
    );
  });

  router.map('/qi/errorCategories/:id;delete', canManage, _.partial(
    showDeleteFormPage,
    'app/qiErrorCategories/QiErrorCategory',
    _,
    _,
    {baseBreadcrumb: true}
  ));
});
