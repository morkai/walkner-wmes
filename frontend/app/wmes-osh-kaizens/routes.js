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
  './Kaizen',
  './KaizenCollection',
  './pages/DetailsPage',
  './views/FilterView',
  './views/ListView',
  './views/FormView',
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
  Kaizen,
  KaizenCollection,
  DetailsPage,
  FilterView,
  ListView,
  FormView
) {
  'use strict';

  const canView = user.auth('USER');
  const canAdd = canView;
  const canEdit = canView;

  router.map('/osh/kaizens', canView, req =>
  {
    viewport.showPage(new ListPage({
      FilterView,
      ListView,
      collection: new KaizenCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/osh/kaizens/:id', canView, req =>
  {
    viewport.showPage(new DetailsPage({
      model: new Kaizen({_id: +req.params.id})
    }));
  });

  router.map('/osh/kaizens;add', canAdd, () =>
  {
    viewport.showPage(new AddFormPage({
      FormView,
      model: new Kaizen()
    }));
  });

  router.map('/osh/kaizens/:id;edit', canEdit, (req) =>
  {
    viewport.showPage(new EditFormPage({
      FormView,
      model: new Kaizen({_id: +req.params.id})
    }));
  });

  router.map('/osh/kaizens/:id;delete', canEdit, _.partial(showDeleteFormPage, Kaizen, _, _, {

  }));
});
