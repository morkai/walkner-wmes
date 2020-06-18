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

  var nls = 'i18n!app/nls/kaizenBehaviours';
  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenBehaviours', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenBehaviours/KaizenBehaviourCollection',
        nls
      ],
      function(ListPage, KaizenBehaviourCollection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          collection: new KaizenBehaviourCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/kaizenBehaviours/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenBehaviours/KaizenBehaviour',
        'app/kaizenBehaviours/templates/details',
        nls
      ],
      function(DetailsPage, KaizenBehaviour, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          model: new KaizenBehaviour({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/kaizenBehaviours;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenBehaviours/KaizenBehaviour',
        'app/kaizenBehaviours/views/KaizenBehaviourFormView',
        nls
      ],
      function(AddFormPage, KaizenBehaviour, KaizenBehaviourFormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenBehaviourFormView,
          model: new KaizenBehaviour()
        });
      }
    );
  });

  router.map('/kaizenBehaviours/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenBehaviours/KaizenBehaviour',
        'app/kaizenBehaviours/views/KaizenBehaviourFormView',
        nls
      ],
      function(EditFormPage, KaizenBehaviour, KaizenBehaviourFormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenBehaviourFormView,
          model: new KaizenBehaviour({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/kaizenBehaviours/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/kaizenBehaviours/KaizenBehaviour', _, _, {baseBreadcrumb: true})
  );
});
