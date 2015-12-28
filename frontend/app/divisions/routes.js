// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
          'description'
        ],
        serializeRow: function(model)
        {
          var row = model.toJSON();

          row.type = t('divisions', 'TYPE:' + row.type);

          return row;
        }
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
          detailsTemplate: detailsTemplate
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
