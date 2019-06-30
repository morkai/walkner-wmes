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

  var nls = 'i18n!app/nls/qiStandards';
  var canView = user.auth('QI:DICTIONARIES:VIEW');
  var canManage = user.auth('QI:DICTIONARIES:MANAGE');

  router.map('/qi/standards', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/qiStandards/QiStandardCollection',
        nls
      ],
      function(ListPage, QiStandardCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new QiStandardCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: 'name', className: 'is-min'},
            'description',
            {id: 'active', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/qi/standards/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/qiStandards/QiStandard',
        'app/qiStandards/templates/details',
        nls
      ],
      function(DetailsPage, QiStandard, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new QiStandard({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/qi/standards;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/qiStandards/QiStandard',
        'app/qiStandards/templates/form',
        nls
      ],
      function(AddFormPage, QiStandard, formTemplate)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          formTemplate: formTemplate,
          model: new QiStandard()
        });
      }
    );
  });

  router.map('/qi/standards/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/qiStandards/QiStandard',
        'app/qiStandards/templates/form',
        nls
      ],
      function(EditFormPage, QiStandard, formTemplate)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          formTemplate: formTemplate,
          model: new QiStandard({_id: req.params.id})
        });
      }
    );
  });

  router.map('/qi/standards/:id;delete', canManage, _.partial(showDeleteFormPage, 'app/qiStandards/QiStandard', _, _, {
    baseBreadcrumb: true
  }));
});
