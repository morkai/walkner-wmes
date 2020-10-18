// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/router',
  'app/viewport',
  'app/user',
  'app/core/util/showDeleteFormPage',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-common/pages/ListPage',
  'app/wmes-osh-common/pages/DetailsPage',
  'app/wmes-osh-common/pages/AddFormPage',
  'app/wmes-osh-common/pages/EditFormPage',
  './Kaizen',
  './KaizenCollection',
  './views/FilterView',
  './views/ListView',
  './views/FormView',
  'app/wmes-osh-kaizens/templates/props',
  'i18n!app/nls/wmes-osh-kaizens'
], function(
  _,
  router,
  viewport,
  user,
  showDeleteFormPage,
  dictionaries,
  ListPage,
  DetailsPage,
  AddFormPage,
  EditFormPage,
  Kaizen,
  KaizenCollection,
  FilterView,
  ListView,
  FormView,
  propsTemplate
) {
  'use strict';

  var canView = user.auth('USER');
  var canAdd = canView;
  var canEdit = canView;
  var canManage = user.auth('OSH:KAIZENS:MANAGE');

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
      propsTemplate,
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

  router.map('/osh/kaizens/:id;delete', canManage, _.partial(showDeleteFormPage, Kaizen, _, _, {

  }));
});