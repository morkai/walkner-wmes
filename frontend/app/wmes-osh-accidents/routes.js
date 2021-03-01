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
  './Accident',
  './AccidentCollection',
  './pages/DetailsPage',
  './views/FilterView',
  './views/ListView',
  './views/FormView',
  'i18n!app/nls/wmes-osh-accidents'
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
  Accident,
  AccidentCollection,
  DetailsPage,
  FilterView,
  ListView,
  FormView
) {
  'use strict';

  const canView = user.auth('USER');
  const canAdd = canView;
  const canEdit = canView;

  router.map('/osh/accidents', canView, req =>
  {
    viewport.showPage(new ListPage({
      FilterView,
      ListView,
      collection: new AccidentCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/osh/accidents/:id', canView, req =>
  {
    viewport.showPage(new DetailsPage({
      model: new Accident({_id: +req.params.id || req.params.id})
    }));
  });

  router.map('/osh/accidents;add', canAdd, () =>
  {
    viewport.showPage(new AddFormPage({
      FormView,
      model: new Accident()
    }));
  });

  router.map('/osh/accidents/:id;edit', canEdit, (req) =>
  {
    viewport.showPage(new EditFormPage({
      FormView,
      model: new Accident({_id: +req.params.id || req.params.id})
    }));
  });

  router.map('/osh/accidents/:id;delete', canEdit, _.partial(showDeleteFormPage, Accident, _, _, {

  }));
});
