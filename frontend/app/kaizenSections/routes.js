// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './KaizenSection'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  KaizenSection
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
            'name',
            {id: 'position', className: 'is-min'}
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
          baseBreadcrumb: true,
          FormView: KaizenSectionFormView,
          model: new KaizenSection({_id: req.params.id})
        });
      }
    );
  });

  router.map('/kaizenSections/:id;delete', canManage, _.partial(showDeleteFormPage, KaizenSection, _, _, {
    baseBreadcrumb: true
  }));

});
