// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../router',
  '../viewport',
  '../i18n',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/subdivisions',
  './Subdivision',
  'i18n!app/nls/subdivisions'
], function(
  router,
  viewport,
  t,
  user,
  showDeleteFormPage,
  subdivisions,
  Subdivision
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/subdivisions', canView, function()
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/subdivisions/views/decorateSubdivision'],
      function(ListPage, decorateSubdivision)
      {
        return new ListPage({
          collection: subdivisions,
          columns: ['division', 'type', 'name', 'prodTaskTags', 'aor'],
          serializeRow: decorateSubdivision
        });
      }
    );
  });

  router.map('/subdivisions/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/subdivisions/views/SubdivisionDetailsView'],
      function(DetailsPage, SubdivisionDetailsView)
      {
        return new DetailsPage({
          DetailsView: SubdivisionDetailsView,
          model: new Subdivision({_id: req.params.id})
        });
      }
    );
  });

  router.map('/subdivisions;add', canManage, function()
  {
    viewport.loadPage(
      'app/subdivisions/pages/AddSubdivisionFormPage',
      function(AddSubdivisionFormPage)
      {
        return new AddSubdivisionFormPage({model: new Subdivision()});
      }
    );
  });

  router.map('/subdivisions/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      'app/subdivisions/pages/EditSubdivisionFormPage',
      function(EditSubdivisionFormPage)
      {
        return new EditSubdivisionFormPage({model: new Subdivision({_id: req.params.id})});
      }
    );
  });

  router.map('/subdivisions/:id;delete', canManage, showDeleteFormPage.bind(null, Subdivision));

});
