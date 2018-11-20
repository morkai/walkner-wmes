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

  var nls = 'i18n!app/nls/wmes-toolcal-types';
  var model = 'app/wmes-toolcal-types/Type';
  var canView = user.auth('TOOLCAL:DICTIONARIES:VIEW');
  var canManage = user.auth('TOOLCAL:DICTIONARIES:MANAGE');
  var baseBreadcrumb = '#toolcal/tools';

  router.map('/toolcal/types', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/wmes-toolcal-types/TypeCollection',
        nls
      ],
      function(ListPage, TypeCollection)
      {
        return new ListPage({
          baseBreadcrumb: baseBreadcrumb,
          collection: new TypeCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            {id: 'active', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/toolcal/types/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        model,
        'app/wmes-toolcal-types/templates/details',
        nls
      ],
      function(DetailsPage, Type, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: baseBreadcrumb,
          model: new Type({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/toolcal/types;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        model,
        'app/wmes-toolcal-types/views/FormView',
        nls
      ],
      function(AddFormPage, Type, FormView)
      {
        return new AddFormPage({
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Type()
        });
      }
    );
  });

  router.map('/toolcal/types/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        model,
        'app/wmes-toolcal-types/views/FormView',
        nls
      ],
      function(EditFormPage, Type, FormView)
      {
        return new EditFormPage({
          baseBreadcrumb: baseBreadcrumb,
          FormView: FormView,
          model: new Type({_id: req.params.id})
        });
      }
    );
  });

  router.map('/toolcal/types/:id;delete', canManage, _.partial(showDeleteFormPage, model, _, _, {
    baseBreadcrumb: baseBreadcrumb
  }));
});
