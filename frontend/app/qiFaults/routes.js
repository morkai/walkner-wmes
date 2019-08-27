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

  var nls = 'i18n!app/nls/qiFaults';
  var canView = user.auth('QI:DICTIONARIES:VIEW');
  var canManage = user.auth('QI:DICTIONARIES:MANAGE');

  router.map('/qi/faults', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/ListPage',
        'app/qiFaults/QiFaultCollection',
        nls
      ],
      function(ListPage, QiFaultCollection)
      {
        return new ListPage({
          baseBreadcrumb: true,
          collection: new QiFaultCollection(null, {rqlQuery: req.rql}),
          columns: [
            {id: '_id', className: 'is-min'},
            'name',
            'description',
            {id: 'weight', className: 'is-min'},
            {id: 'active', className: 'is-min'}
          ]
        });
      }
    );
  });

  router.map('/qi/faults/:id', canView, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/DetailsPage',
        'app/qiFaults/QiFault',
        'app/qiFaults/templates/details',
        nls
      ],
      function(DetailsPage, QiFault, detailsTemplate)
      {
        return new DetailsPage({
          baseBreadcrumb: true,
          model: new QiFault({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/qi/faults;add', canManage, function()
  {
    viewport.loadPage(
      [
        'app/core/pages/AddFormPage',
        'app/qiFaults/QiFault',
        'app/qiFaults/views/QiFaultFormView',
        nls
      ],
      function(AddFormPage, QiFault, QiFaultFormView)
      {
        return new AddFormPage({
          baseBreadcrumb: true,
          FormView: QiFaultFormView,
          model: new QiFault()
        });
      }
    );
  });

  router.map('/qi/faults/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      [
        'app/core/pages/EditFormPage',
        'app/qiFaults/QiFault',
        'app/qiFaults/views/QiFaultFormView',
        nls
      ],
      function(EditFormPage, QiFault, QiFaultFormView)
      {
        return new EditFormPage({
          baseBreadcrumb: true,
          FormView: QiFaultFormView,
          model: new QiFault({_id: req.params.id})
        });
      }
    );
  });

  router.map('/qi/faults/:id;delete', canManage, _.partial(showDeleteFormPage, 'app/qiFaults/QiFault', _, _, {
    baseBreadcrumb: true
  }));
});
