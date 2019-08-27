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

  var nls = 'i18n!app/nls/qiActionStatuses';
  var canView = user.auth('QI:DICTIONARIES:VIEW');
  var canManage = user.auth('QI:DICTIONARIES:MANAGE');

  router.map('/qi/actionStatuses', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/qiActionStatuses/QiActionStatusCollection',
        nls
      ],
      function(ListPage, QiActionStatusCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new QiActionStatusCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'name', className: 'is-min'},
            'position'
          ]
        });
      }
    );
  });

  router.map('/qi/actionStatuses/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/qiActionStatuses/QiActionStatus',
        'app/qiActionStatuses/templates/details',
        nls
      ],
      function(DetailsPage, QiActionStatus, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new QiActionStatus({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/qi/actionStatuses;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/qiActionStatuses/QiActionStatus',
        'app/qiActionStatuses/views/QiActionStatusFormView',
        nls
      ],
      function(AddFormPage, QiActionStatus, QiActionStatusFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: QiActionStatusFormView,
          model: new QiActionStatus()
        });
      }
    );
  });

  router.map('/qi/actionStatuses/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/qiActionStatuses/QiActionStatus',
        'app/qiActionStatuses/views/QiActionStatusFormView',
        nls
      ],
      function(EditFormPage, QiActionStatus, QiActionStatusFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: QiActionStatusFormView,
          model: new QiActionStatus({_id: req.params.id})
        });
      }
    );
  });

  router.map('/qi/actionStatuses/:id;delete', canManage, _.partial(
    showDeleteFormPage,
    'app/qiActionStatuses/QiActionStatus',
    _,
    _,
    {baseBreadcrumb: true}
  ));
});
