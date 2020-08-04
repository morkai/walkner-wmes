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

  var nls = 'i18n!app/nls/wh-redirReasons';
  var canView = user.auth('WH:MANAGE');
  var canManage = canView;

  router.map('/wh/redirReasons', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/wh-redirReasons/WhRedirReasonCollection',
        nls
      ],
      function(ListPage, WhRedirReasonCollection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          collection: new WhRedirReasonCollection(null, {rqlQuery: req.rql}),
          columns: [
            'label',
            {id: 'active', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/wh/redirReasons/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/wh-redirReasons/WhRedirReason',
        'app/wh-redirReasons/templates/details',
        nls
      ],
      function(DetailsPage, WhRedirReason, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          model: new WhRedirReason({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/wh/redirReasons;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/wh-redirReasons/WhRedirReason',
        'app/wh-redirReasons/views/FormView',
        nls
      ],
      function(AddFormPage, WhRedirReason, FormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: FormView,
          model: new WhRedirReason()
        });
      }
    );
  });

  router.map('/wh/redirReasons/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/wh-redirReasons/WhRedirReason',
        'app/wh-redirReasons/views/FormView',
        nls
      ],
      function(EditFormPage, WhRedirReason, FormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: FormView,
          model: new WhRedirReason({_id: req.params.id})
        });
      }
    );
  });

  router.map('/wh/redirReasons/:id;delete', canManage, _.partial(
    showDeleteFormPage, 'app/wh-redirReasons/WhRedirReason', _, _, {
      baseBreadcrumb: true
    }
  ));
});
