define([
  '../router',
  '../viewport',
  '../i18n',
  '../user',
  '../data/divisions',
  '../data/subdivisions',
  '../data/views/renderOrgUnitPath',
  './Subdivision',
  '../core/pages/ListPage',
  '../core/pages/DetailsPage',
  '../core/pages/ActionFormPage',
  './pages/AddSubdivisionFormPage',
  './pages/EditSubdivisionFormPage',
  './views/SubdivisionDetailsView',
  'i18n!app/nls/subdivisions'
], function(
  router,
  viewport,
  t,
  user,
  divisions,
  subdivisions,
  renderOrgUnitPath,
  Subdivision,
  ListPage,
  DetailsPage,
  ActionFormPage,
  AddSubdivisionFormPage,
  EditSubdivisionFormPage,
  SubdivisionDetailsView
) {
  'use strict';

  var canView = user.auth('DICTIONARIES:VIEW');
  var canManage = user.auth('DICTIONARIES:MANAGE');

  router.map('/subdivisions', canView, function()
  {
    viewport.showPage(new ListPage({
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
    }));
  });

  router.map('/subdivisions/:id', function(req)
  {
    viewport.showPage(new DetailsPage({
      DetailsView: SubdivisionDetailsView,
      model: new Subdivision({_id: req.params.id})
    }));
  });

  router.map('/subdivisions;add', canManage, function()
  {
    viewport.showPage(new AddSubdivisionFormPage({model: new Subdivision()}));
  });

  router.map('/subdivisions/:id;edit', canManage, function(req)
  {
    viewport.showPage(new EditSubdivisionFormPage({model: new Subdivision({_id: req.params.id})}));
  });

  router.map('/subdivisions/:id;delete', canManage, function(req, referer)
  {
    var model = new Subdivision({_id: req.params.id});

    viewport.showPage(new ActionFormPage({
      model: model,
      actionKey: 'delete',
      successUrl: model.genClientUrl('base'),
      cancelUrl: referer || model.genClientUrl('base'),
      formMethod: 'DELETE',
      formAction: model.url(),
      formActionSeverity: 'danger'
    }));
  });

});
