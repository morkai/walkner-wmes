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
  './Location',
  'i18n!app/nls/wmes-osh-locations'
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
  Location
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/locations', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.locations,
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'buildings'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/locations/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-locations/templates/details'
      ],
      function(detailsTemplate)
      {
        const model = dictionaries.locations.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate,
          model: model || new Location({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/locations;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-locations/views/FormView'
      ],
      function(FormView)
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new Location()
        }));
      }
    );
  });

  router.map('/osh/locations/:id;edit', canManage, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-locations/views/FormView'
      ],
      function(FormView)
      {
        const model = dictionaries.locations.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new Location({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/locations/:id;delete', canManage, _.partial(showDeleteFormPage, Location, _, _, {

  }));
});
