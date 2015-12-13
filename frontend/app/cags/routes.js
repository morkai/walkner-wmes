// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  './CagCollection',
  './Cag',
  'i18n!app/nls/cags'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  CagCollection,
  Cag
) {
  'use strict';

  var canView = user.auth('REPORTS:VIEW', 'REPORTS:9:VIEW');
  var canManage = user.auth('REPORTS:MANAGE');

  router.map('/cags', canView, function(req)
  {
    viewport.loadPage(['app/core/pages/ListPage'], function(ListPage)
    {
      return new ListPage({
        collection: new CagCollection(null, {rqlQuery: req.rql}),
        columns: [
          {id: '_id', className: 'is-min'},
          'name'
        ]
      });
    });
  });

  router.map('/cags/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/cags/templates/details'],
      function(DetailsPage, detailsTemplate)
      {
        return new DetailsPage({
          model: new Cag({_id: req.params.id}),
          detailsTemplate: detailsTemplate
        });
      }
    );
  });

  router.map('/cags;add', canManage, function()
  {
    viewport.loadPage(
      ['app/core/pages/AddFormPage', 'app/cags/templates/form'],
      function(AddFormPage, formTemplate)
      {
        return new AddFormPage({
          model: new Cag(),
          formTemplate: formTemplate
        });
      }
    );
  });

  router.map('/cags/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/core/pages/EditFormPage', 'app/cags/templates/form'],
      function(EditFormPage, formTemplate)
      {
        return new EditFormPage({
          model: new Cag({_id: req.params.id}),
          formTemplate: formTemplate
        });
      }
    );
  });

  router.map('/cags/:id;delete', canManage, showDeleteFormPage.bind(null, Cag));

});
