// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './CagGroupCollection',
  './CagGroup',
  'i18n!app/nls/cagGroups'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  CagGroupCollection,
  CagGroup
) {
  'use strict';

  var canView = user.auth('REPORTS:VIEW', 'REPORTS:9:VIEW');
  var canManage = user.auth('REPORTS:MANAGE');

  router.map('/cagGroups', canView, function(req)
  {
    viewport.loadPage(['app/core/pages/ListPage'], function(ListPage)
    {
      return new ListPage({
        collection: new CagGroupCollection(null, {rqlQuery: req.rql}),
        columns: [
          {id: 'name', className: 'is-min'},
          {id: 'color', className: 'is-min'},
          'cags'
        ]
      });
    });
  });

  router.map('/cagGroups/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/cagGroups/templates/details'],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new CagGroup({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/cagGroups;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/cagGroups/views/CagGroupFormView'],
      function(AddFormPage, CagGroupFormView)
      {
        return new AddFormPage({
          FormView: CagGroupFormView,
          model: new CagGroup()
        });
      }
    );
  });

  router.map('/cagGroups/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/cagGroups/views/CagGroupFormView'],
      function(EditFormPage, CagGroupFormView)
      {
        return new EditFormPage({
          FormView: CagGroupFormView,
          model: new CagGroup({_id: req.params.id})
        });
      }
    );
  });

  router.map('/cagGroups/:id;delete', canManage, showDeleteFormPage.bind(null, CagGroup));

});
