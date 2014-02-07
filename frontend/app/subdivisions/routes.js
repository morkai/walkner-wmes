define([
  '../router',
  '../viewport',
  '../i18n',
  '../user',
  '../core/util/showDeleteFormPage',
  '../data/divisions',
  '../data/subdivisions',
  '../data/views/renderOrgUnitPath',
  './Subdivision',
  'i18n!app/nls/subdivisions'
], function(
  router,
  viewport,
  t,
  user,
  showDeleteFormPage,
  divisions,
  subdivisions,
  renderOrgUnitPath,
  Subdivision
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/subdivisions', canView, function()
  {
    viewport.loadPage(['app/core/pages/ListPage'], function(ListPage)
    {
      return new ListPage({
        collection: subdivisions,
        columns: ['division', 'type', 'name', 'prodTaskTags'],
        serializeRow: function(model)
        {
          var row = model.toJSON();

          row.division = renderOrgUnitPath(divisions.get(row.division), true, false);

          row.type = t('subdivisions', 'TYPE:' + row.type);

          row.prodTaskTags =
            row.prodTaskTags && row.prodTaskTags.length ? row.prodTaskTags.join(', ') : null;

          return row;
        }
      });
    });
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
