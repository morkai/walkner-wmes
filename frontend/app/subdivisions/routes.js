// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/subdivisions',
  './Subdivision'
], function(
  router,
  viewport,
  user,
  showDeleteFormPage,
  subdivisions,
  Subdivision
) {
  'use strict';

  var nls = 'i18n!app/nls/subdivisions';
  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/subdivisions', canView, function()
  {
    viewport.loadPage(
      ['app/core/pages/ListPage', 'app/subdivisions/views/decorateSubdivision', nls],
      function(ListPage, decorateSubdivision)
      {
        return new ListPage({
          collection: subdivisions,
          columns: [
            {id: 'division', className: 'is-min'},
            {id: 'type', className: 'is-min'},
            {id: 'name', className: 'is-min'},
            'prodTaskTags',
            {id: 'aor', className: 'is-min'},
            {id: 'autoDowntime', className: 'is-min'}
          ],
          serializeRow: decorateSubdivision
        });
      }
    );
  });

  router.map('/subdivisions/:id', function(req)
  {
    viewport.loadPage(
      ['app/core/pages/DetailsPage', 'app/subdivisions/views/SubdivisionDetailsView', nls],
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
      ['app/subdivisions/pages/AddSubdivisionFormPage', nls],
      function(AddSubdivisionFormPage)
      {
        return new AddSubdivisionFormPage({model: new Subdivision()});
      }
    );
  });

  router.map('/subdivisions/:id;edit', canManage, function(req)
  {
    viewport.loadPage(
      ['app/subdivisions/pages/EditSubdivisionFormPage', nls],
      function(EditSubdivisionFormPage)
      {
        return new EditSubdivisionFormPage({model: new Subdivision({_id: req.params.id})});
      }
    );
  });

  router.map('/subdivisions/:id;delete', canManage, showDeleteFormPage.bind(null, Subdivision));

});
