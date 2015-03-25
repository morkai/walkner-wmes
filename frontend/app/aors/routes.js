// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/aors',
  './Aor',
  'i18n!app/nls/aors'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  aors,
  Aor
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/aors', canView, function()
  {
    viewport.loadPage(['app/core/pages/ListPage'], function(ListPage)
    {
      return new ListPage({
        collection: aors,
        columns: [
          {id: 'name', className: 'is-min'},
          'description',
          {id: 'color', className: 'is-min'},
          {id: 'refColor', className: 'is-min'},
          {id: 'refValue', className: 'is-min'}
        ]
      });
    });
  });

  router.map('/aors/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/aors/templates/details'],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new Aor({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/aors;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/aors/views/AorFormView'],
      function(AddFormPage, AorFormView)
      {
        return new AddFormPage({
          FormView: AorFormView,
          model: new Aor()
        });
      }
    );
  });

  router.map('/aors/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/aors/views/AorFormView'],
      function(EditFormPage, AorFormView)
      {
        return new EditFormPage({
          FormView: AorFormView,
          model: new Aor({_id: req.params.id})
        });
      }
    );
  });

  router.map('/aors/:id;delete', canManage, showDeleteFormPage.bind(null, Aor));

});
