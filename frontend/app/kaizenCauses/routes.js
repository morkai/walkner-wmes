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

  var nls = 'i18n!app/nls/kaizenCauses';
  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenCauses', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenCauses/KaizenCauseCollection',
        nls
      ],
      function(ListPage, KaizenCauseCollection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          collection: new KaizenCauseCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/kaizenCauses/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenCauses/KaizenCause',
        'app/kaizenCauses/templates/details',
        nls
      ],
      function(DetailsPage, KaizenCause, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          model: new KaizenCause({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/kaizenCauses;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenCauses/KaizenCause',
        'app/kaizenCauses/views/KaizenCauseFormView',
        nls
      ],
      function(AddFormPage, KaizenCause, KaizenCauseFormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenCauseFormView,
          model: new KaizenCause()
        });
      }
    );
  });

  router.map('/kaizenCauses/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenCauses/KaizenCause',
        'app/kaizenCauses/views/KaizenCauseFormView',
        nls
      ],
      function(EditFormPage, KaizenCause, KaizenCauseFormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenCauseFormView,
          model: new KaizenCause({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/kaizenCauses/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/kaizenCauses/KaizenCause', _, _, {baseBreadcrumb: true})
  );
});
