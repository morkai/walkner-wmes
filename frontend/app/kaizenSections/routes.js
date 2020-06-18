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

  var nls = 'i18n!app/nls/kaizenSections';
  var canView = user.auth('KAIZEN:DICTIONARIES:VIEW');
  var canManage = user.auth('KAIZEN:DICTIONARIES:MANAGE');

  router.map('/kaizenSections', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenSections/KaizenSectionCollection',
        nls
      ],
      function(ListPage, KaizenSectionCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new KaizenSectionCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'name', className: 'is-min'},
            {id: 'active', className: 'is-min'},
            {id: 'subdivisions'},
            {id: 'coordinators'},
            {id: 'position', className: 'is-min', tdClassName: 'is-number'}
          ]
        });
      }
    );
  });

  router.map('/kaizenSections/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenSections/KaizenSection',
        'app/kaizenSections/templates/details',
        nls
      ],
      function(DetailsPage, KaizenSection, detailsTemplate)
      {
        return new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          model: new KaizenSection({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/kaizenSections;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenSections/KaizenSection',
        'app/kaizenSections/views/KaizenSectionFormView',
        nls
      ],
      function(AddFormPage, KaizenSection, KaizenSectionFormView)
      {
        return new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenSectionFormView,
          model: new KaizenSection()
        });
      }
    );
  });

  router.map('/kaizenSections/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenSections/KaizenSection',
        'app/kaizenSections/views/KaizenSectionFormView',
        nls
      ],
      function(EditFormPage, KaizenSection, KaizenSectionFormView)
      {
        return new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenSectionFormView,
          model: new KaizenSection({_id: req.params.id})
        });
      }
    );
  });

  router.map(
    '/kaizenSections/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/kaizenSections/KaizenSection', _, _, {baseBreadcrumb: true})
  );
});
