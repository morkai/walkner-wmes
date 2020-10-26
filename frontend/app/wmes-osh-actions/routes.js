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
  './Action',
  './ActionCollection',
  './pages/DetailsPage',
  './views/FilterView',
  './views/ListView',
  './views/FormView',
  'i18n!app/nls/wmes-osh-actions'
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
  Action,
  ActionCollection,
  DetailsPage,
  FilterView,
  ListView,
  FormView
) {
  'use strict';

  const canView = user.auth('USER');
  const canAdd = canView;
  const canEdit = canView;

  router.map('/osh/actions', canView, req =>
  {
    viewport.showPage(new ListPage({
      FilterView,
      ListView,
      collection: new ActionCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/osh/actions/:id', canView, req =>
  {
    viewport.showPage(new DetailsPage({
      model: new Action({_id: +req.params.id})
    }));
  });

  router.map('/osh/actions;add', canAdd, () =>
  {
    viewport.showPage(new AddFormPage({
      FormView,
      model: new Action()
    }));
  });

  router.map('/osh/actions/:id;edit', canEdit, (req) =>
  {
    viewport.showPage(new EditFormPage({
      FormView,
      model: new Action({_id: +req.params.id})
    }));
  });

  router.map('/osh/actions/:id;delete', canEdit, _.partial(showDeleteFormPage, Action, _, _, {

  }));
});
