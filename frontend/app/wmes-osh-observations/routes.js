// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/router',
  'app/viewport',
  'app/user',
  'app/core/util/showDeleteFormPage',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/pages/ListPage',
  'app/wmes-osh-common/pages/AddFormPage',
  'app/wmes-osh-common/pages/EditFormPage',
  './Observation',
  './ObservationCollection',
  './pages/DetailsPage',
  './views/FilterView',
  './views/ListView',
  './views/FormView',
  'i18n!app/nls/wmes-osh-observations'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  dictionaries,
  ListPage,
  AddFormPage,
  EditFormPage,
  Observation,
  ObservationCollection,
  DetailsPage,
  FilterView,
  ListView,
  FormView
) {
  'use strict';

  const canView = user.auth('USER');
  const canAdd = canView;
  const canEdit = canView;

  router.map('/osh/observations', canView, req =>
  {
    viewport.showPage(new ListPage({
      FilterView,
      ListView,
      collection: new ObservationCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/osh/observations/:id', canView, req =>
  {
    viewport.showPage(new DetailsPage({
      model: new Observation({_id: +req.params.id || req.params.id})
    }));
  });

  router.map('/osh/observations;add', canAdd, () =>
  {
    viewport.showPage(new AddFormPage({
      FormView,
      model: new Observation()
    }));
  });

  router.map('/osh/observations/:id;edit', canEdit, (req) =>
  {
    viewport.showPage(new EditFormPage({
      FormView,
      model: new Observation({_id: +req.params.id || req.params.id})
    }));
  });

  router.map('/osh/observations/:id;delete', canEdit, _.partial(showDeleteFormPage, Observation, _, _, {

  }));
});
