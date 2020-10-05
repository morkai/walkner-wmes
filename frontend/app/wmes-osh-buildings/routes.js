// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/router',
  'app/viewport',
  'app/user',
  'app/core/pages/ListPage',
  'app/core/pages/DetailsPage',
  'app/core/pages/AddFormPage',
  'app/core/pages/EditFormPage',
  'app/core/util/showDeleteFormPage',
  'app/wmes-osh-common/dictionaries',
  './Building',
  './BuildingCollection',
  'i18n!app/nls/wmes-osh-buildings'
], function(
  _,
  router,
  viewport,
  user,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  showDeleteFormPage,
  dictionaries,
  Building,
  BuildingCollection
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/buildings', canView, req =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      collection: new BuildingCollection(null, {rqlQuery: req.rql}),
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/buildings/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-buildings/templates/details'
      ],
      function(detailsTemplate)
      {
        return dictionaries.bind(new DetailsPage({
          detailsTemplate,
          model: new Building({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/buildings;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-buildings/views/FormView'
      ],
      function(FormView)
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new Building()
        }));
      }
    );
  });

  router.map('/osh/buildings/:id;edit', canManage, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-buildings/views/FormView'
      ],
      function(FormView)
      {
        return dictionaries.bind(new EditFormPage({
          FormView,
          model: new Building({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/buildings/:id;delete', canManage, _.partial(showDeleteFormPage, Building, _, _, {

  }));
});
