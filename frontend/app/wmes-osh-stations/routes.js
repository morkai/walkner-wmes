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
  './Station',
  'i18n!app/nls/wmes-osh-stations'
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
  Station
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/stations', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.stations,
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/stations/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-stations/templates/details'
      ],
      function(detailsTemplate)
      {
        const model = dictionaries.stations.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate,
          model: model || new Station({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/stations;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-stations/views/FormView'
      ],
      function(FormView)
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new Station()
        }));
      }
    );
  });

  router.map('/osh/stations/:id;edit', canManage, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-stations/views/FormView'
      ],
      function(FormView)
      {
        const model = dictionaries.stations.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new Station({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/stations/:id;delete', canManage, _.partial(showDeleteFormPage, Station, _, _, {

  }));
});
