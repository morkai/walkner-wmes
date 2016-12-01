// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../i18n',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/divisions',
  './Division'
], function(
  router,
  viewport,
  t,
  user,
  showDeleteFormPage,
  divisions,
  Division
) {
  'use strict';

  var nls = 'i18n!app/nls/divisions';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/divisions', canView, function()
  {
    viewport.loadPage(['app/core/pages/ListPage', nls], function(ListPage)
    {
      return new ListPage({
        collection: divisions,
        columns: [
          {id: '_id', className: 'is-min'},
          {id: 'type', className: 'is-min'},
          'description',
          {id: 'deactivatedAt', className: 'is-min'}
        ]
      });
    });
  });

  router.map('/divisions/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/divisions/templates/details', nls],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new Division({_id: req.params.id}),
          detailsTemplate: detailsTemplate,
          actions: function()
          {
            return this.model.get('deactivatedAt') && !user.data.super
              ? []
              : DetailsPage.prototype.actions.call(this);
          }
        });
      }
    );
  });

  router.map('/divisions;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/divisions/views/DivisionFormView', nls],
      function(AddFormPage, DivisionFormView)
      {
        return new AddFormPage({
          FormView: DivisionFormView,
          model: new Division()
        });
      }
    );
  });

  router.map('/divisions/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/divisions/views/DivisionFormView', nls],
      function(EditFormPage, DivisionFormView)
      {
        return new EditFormPage({
          FormView: DivisionFormView,
          model: new Division({_id: req.params.id})
        });
      }
    );
  });

  router.map('/divisions/:id;delete', canManage, showDeleteFormPage.bind(null, Division));

});
