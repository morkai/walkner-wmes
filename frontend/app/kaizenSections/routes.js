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

  router.map('/kaizenSections', canView, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/kaizenOrders/dictionaries',
        nls
      ],
      function(ListPage, dictionaries)
      {
        return dictionaries.bind(new ListPage({
          baseBreadcrumb: true,
          load: null,
          collection: dictionaries.sections,
          columns: [
            {id: '_id', className: 'is-min'},
            {id: 'name'},
            {id: 'entryTypes', className: 'is-min'},
            {id: 'active', className: 'is-min'},
            {id: 'position', className: 'is-min', tdClassName: 'is-number'}
          ]
        }));
      }
    );
  });

  router.map('/kaizenSections/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenSections/KaizenSection',
        'app/kaizenSections/templates/details',
        nls
      ],
      function(DetailsPage, dictionaries, KaizenSection, detailsTemplate)
      {
        var model = dictionaries.sections.get(req.params.id) || new KaizenSection({_id: req.params.id});

        return dictionaries.bind(new DetailsPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          model: model,
          detailsTemplate: detailsTemplate
        }));
      }
    );
  });

  router.map('/kaizenSections;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenSections/KaizenSection',
        'app/kaizenSections/views/KaizenSectionFormView',
        nls
      ],
      function(AddFormPage, dictionaries, KaizenSection, KaizenSectionFormView)
      {
        return dictionaries.bind(new AddFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenSectionFormView,
          model: new KaizenSection()
        }));
      }
    );
  });

  router.map('/kaizenSections/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/kaizenOrders/dictionaries',
        'app/kaizenSections/KaizenSection',
        'app/kaizenSections/views/KaizenSectionFormView',
        nls
      ],
      function(EditFormPage, dictionaries, KaizenSection, KaizenSectionFormView)
      {
        var model = dictionaries.sections.get(req.params.id) || new KaizenSection({_id: req.params.id});

        return dictionaries.bind(new EditFormPage({
          pageClassName: 'page-max-flex',
          baseBreadcrumb: true,
          FormView: KaizenSectionFormView,
          model: model
        }));
      }
    );
  });

  router.map(
    '/kaizenSections/:id;delete',
    canManage,
    _.partial(showDeleteFormPage, 'app/kaizenSections/KaizenSection', _, _, {baseBreadcrumb: true})
  );
});
