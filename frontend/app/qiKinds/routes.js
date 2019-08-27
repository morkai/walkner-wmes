// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage'
], function(
  _,
  t,
  router,
  viewport,
  user,
  showDeleteFormPage
) {
  'use strict';

  var nls = 'i18n!app/nls/qiKinds';
  var canView = user.auth('QI:DICTIONARIES:VIEW');
  var canManage = user.auth('QI:DICTIONARIES:MANAGE');

  router.map('/qi/kinds', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/qiKinds/QiKindCollection',
        nls
      ],
      function(ListPage, QiKindCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new QiKindCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: 'name', className: 'is-min'},
            {id: 'division'},
            {id: 'order', className: 'is-min'},
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/qi/kinds/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/qiKinds/QiKind',
        'app/qiKinds/templates/details',
        nls
      ],
      function(DetailsPage, QiKind, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new QiKind({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/qi/kinds;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/qiKinds/QiKind',
        'app/qiKinds/views/QiKindFormView',
        nls
      ],
      function(AddFormPage, QiKind, QiKindFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: QiKindFormView,
          model: new QiKind()
        });
      }
    );
  });

  router.map('/qi/kinds/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/qiKinds/QiKind',
        'app/qiKinds/views/QiKindFormView',
        nls
      ],
      function(EditFormPage, QiKind, QiKindFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: QiKindFormView,
          model: new QiKind({_id: req.params.id})
        });
      }
    );
  });

  router.map('/qi/kinds/:id;delete', canManage, _.partial(showDeleteFormPage, 'app/qiKinds/QiKind', _, _, {
    baseBreadcrumb: true
  }));
});
