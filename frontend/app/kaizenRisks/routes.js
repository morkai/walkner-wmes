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

  var nls = 'i18n!app/nls/kaizenRisks';
  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenRisks', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenRisks/KaizenRiskCollection',
        nls
      ],
      function(ListPage, KaizenRiskCollection)
      {
        return new ListPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          collection: new KaizenRiskCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            {id: 'position', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/kaizenRisks/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenRisks/KaizenRisk',
        'app/kaizenRisks/templates/details',
        nls
      ],
      function(DetailsPage, KaizenRisk, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          model: new KaizenRisk({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/kaizenRisks;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenRisks/KaizenRisk',
        'app/kaizenRisks/views/KaizenRiskFormView',
        nls
      ],
      function(AddFormPage, KaizenRisk, KaizenRiskFormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenRiskFormView,
          model: new KaizenRisk()
        });
      }
    );
  });

  router.map('/kaizenRisks/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenRisks/KaizenRisk',
        'app/kaizenRisks/views/KaizenRiskFormView',
        nls
      ],
      function(EditFormPage, KaizenRisk, KaizenRiskFormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenRiskFormView,
          model: new KaizenRisk({_id: req.params.id})
        });
      }
    );
  });

  router.map('/kaizenRisks/:id;delete', canManage, _.partial(showDeleteFormPage, 'app/kaizenRisks/KaizenRisk', _, _, {
    baseBreadcrumb: true
  }));
});
