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
  './ObservationCategory',
  './ObservationCategoryCollection',
  'i18n!app/nls/wmes-osh-observationCategories'
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
  ObservationCategory
) {
  'use strict';

  var canView = user.auth('OSH:DICTIONARIES:VIEW');
  var canManage = user.auth('OSH:DICTIONARIES:MANAGE');

  router.map('/osh/observationCategories', canView, () =>
  {
    viewport.showPage(dictionaries.bind(new ListPage({
      load: null,
      collection: dictionaries.observationCategories,
      columns: [
        {id: 'shortName', className: 'is-min'},
        {id: 'longName'},
        {id: 'active', className: 'is-min'}
      ]
    })));
  });

  router.map('/osh/observationCategories/:id', canView, req =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-observationCategories/templates/details'
      ],
      (detailsTemplate) =>
      {
        const model = dictionaries.observationCategories.get(req.params.id);

        return dictionaries.bind(new DetailsPage({
          detailsTemplate: detailsTemplate,
          model: model || new ObservationCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/observationCategories;add', canManage, () =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-observationCategories/views/FormView'
      ],
      (FormView) =>
      {
        return dictionaries.bind(new AddFormPage({
          FormView,
          model: new ObservationCategory()
        }));
      }
    );
  });

  router.map('/osh/observationCategories/:id;edit', canManage, (req) =>
  {
    viewport.loadPage(
      [
        'app/wmes-osh-observationCategories/views/FormView'
      ],
      (FormView) =>
      {
        const model = dictionaries.observationCategories.get(req.params.id);

        return dictionaries.bind(new EditFormPage({
          FormView,
          model: model || new ObservationCategory({_id: req.params.id})
        }));
      }
    );
  });

  router.map('/osh/observationCategories/:id;delete', canManage, _.partial(showDeleteFormPage, ObservationCategory, _, _, {

  }));
});
