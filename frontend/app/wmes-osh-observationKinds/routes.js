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
  './ObservationKind',
  './ObservationKindCollection',
  'i18n!app/nls/wmes-osh-observationKinds'
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
  ObservationKind
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/observationKinds', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.observationKinds,
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/observationKinds/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-observationKinds/templates/details'
      ],
      (detailsTemplate) =>
      {
        const model = dictionaries.observationKinds.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: model || new ObservationKind({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/observationKinds;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-observationKinds/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new ObservationKind()
        }));
      }
    );
  });

  router.map('/osh/observationKinds/:id;edit', canManage, (req) =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-observationKinds/views/FormView'
      ],
      (FormView) =>
      {
        const model = dictionaries.observationKinds.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new ObservationKind({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/observationKinds/:id;delete', canManage, _.partial(showDeleteFormPage, ObservationKind, _, _, {

  }));
});
