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

  var nls = 'i18n!app/nls/wmes-ct-orderGroups';
  var model = 'app/wmes-ct-orderGroups/OrderGroup';
  var canView = user.auth('PROD_DATA:VIEW');
  var canManage = canView;

  function baseBreadcrumb()
  {
    return [
      {href: '#ct', label: this.t('BREADCRUMBS:base')},
      {href: '#ct/reports/groups', label: this.t('BREADCRUMBS:reports:groups')}
    ];
  }

  router.map('/ct/orderGroups', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/wmes-ct-orderGroups/OrderGroupCollection',
        nls
      ],
      function(ListPage, Collection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          collection: new Collection(null, {rqlQuery: req.rql}),
          columns: [
            {id: 'active', className: 'is-min'},
            {id: 'name', className: 'is-min'},
            '-'
          ]
        });
      }
    );
  });

  router.map('/ct/orderGroups/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/wmes-ct-orderGroups/views/DetailsView',
        nls
      ],
      function(DetailsPage, Model, DetailsView)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          model: new Model({_id: req.params.id}),
          DetailsView: DetailsView
        });
      }
    );
  });

  router.map('/ct/orderGroups;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        model,
        'app/wmes-ct-orderGroups/views/FormView',
        'css!app/wmes-ct-orderGroups/assets/form.css',
        nls
      ],
      function(AddFormPage, Model, FormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Model()
        });
      }
    );
  });

  router.map('/ct/orderGroups/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        model,
        'app/wmes-ct-orderGroups/views/FormView',
        'css!app/wmes-ct-orderGroups/assets/form.css',
        nls
      ],
      function(EditFormPage, Model, FormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Model({_id: req.params.id})
        });
      }
    );
  });

  router.map('/ct/orderGroups/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: baseBreadcrumb
  }));
});
