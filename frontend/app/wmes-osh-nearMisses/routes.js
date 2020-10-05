// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/router',
  'app/viewport',
  'app/user',
  'app/core/util/showDeleteFormPage',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-nearMisses/pages/ListPage',
  'app/wmes-osh-nearMisses/pages/DetailsPage',
  'app/wmes-osh-nearMisses/pages/AddFormPage',
  'app/wmes-osh-nearMisses/pages/EditFormPage',
  './NearMiss',
  './NearMissCollection',
  'i18n!app/nls/wmes-osh-nearMisses'
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
  NearMiss,
  NearMissCollection
) {
  'use strict';

  var canView = user.auth('USER');
  var canAdd = canView;
  var canEdit = canView;
  var canManage = user.auth('OSH:NEAR_MISSES:MANAGE');

  router.map('/osh/nearMisses', canView, req =>
  {
    viewport.showPage(new ListPage({
      collection: new NearMissCollection(null, {rqlQuery: req.rql})
    }));
  });

  router.map('/osh/nearMisses/:id', canView, req =>
  {
    viewport.showPage(new DetailsPage({
      model: new NearMiss({_id: +req.params.id})
    }));
  });

  router.map('/osh/nearMisses;add', canAdd, () =>
  {
    viewport.showPage(new AddFormPage({
      model: new NearMiss()
    }));
  });

  router.map('/osh/nearMisses/:id;edit', canEdit, (req) =>
  {
    viewport.showPage(new EditFormPage({
      model: new NearMiss({_id: +req.params.id})
    }));
  });

  router.map('/osh/nearMisses/:id;delete', canManage, _.partial(showDeleteFormPage, NearMiss, _, _, {

  }));
});
