// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/router',
  'app/viewport',
  'app/user',
  'app/core/util/showDeleteFormPage',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/pages/ListPage',
  './Action',
  './ActionCollection',
  './pages/DetailsPage',
  './pages/AddFormPage',
  './pages/EditFormPage',
  './views/FilterView',
  './views/ListView',
  'i18n!app/nls/wmes-osh-actions'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  dictionaries,
  ListPage,
  Action,
  ActionCollection,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  FilterView,
  ListView
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
      model: new Action({_id: +req.params.id || req.params.id})
    }));
  });

  router.map('/osh/actions;add', canAdd, () =>
  {
    viewport.showPage(new AddFormPage({
      model: new Action()
    }));
  });

  router.map('/osh/actions/:id;edit', canEdit, (req) =>
  {
    viewport.showPage(new EditFormPage({
      model: new Action({_id: +req.params.id || req.params.id})
    }));
  });

  router.map('/osh/actions/:id;delete', canEdit, _.partial(showDeleteFormPage, Action, _, _, {

  }));
});
