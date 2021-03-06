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
  './NearMiss',
  './NearMissCollection',
  './pages/DetailsPage',
  './views/FilterView',
  './views/ListView',
  './views/FormView',
  'i18n!app/nls/wmes-osh-nearMisses',
  'i18n!app/nls/wmes-osh-kaizens'
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
  NearMiss,
  NearMissCollection,
  DetailsPage,
  FilterView,
  ListView,
  FormView
) {
  'use strict';

  const canView = user.auth('USER');
  const canAdd = canView;
  const canEdit = canView;

  router.map('/osh/nearMisses', canView, req =>
  {
    viewport.showPage(new ListPage({
      FilterView,
      ListView,
      collection: new NearMissCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/osh/nearMisses/:id', canView, req =>
  {
    viewport.showPage(new DetailsPage({
      model: new NearMiss({_id: +req.params.id || req.params.id})
    }));
  });

  router.map('/osh/nearMisses;add', canAdd, () =>
  {
    viewport.showPage(new AddFormPage({
      FormView,
      model: new NearMiss()
    }));
  });

  router.map('/osh/nearMisses/:id;edit', canEdit, (req) =>
  {
    viewport.showPage(new EditFormPage({
      FormView,
      model: new NearMiss({_id: +req.params.id || req.params.id})
    }));
  });

  router.map('/osh/nearMisses/:id;delete', canEdit, _.partial(showDeleteFormPage, NearMiss, _, _, {

  }));
});
