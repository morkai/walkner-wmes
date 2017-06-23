// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  '../users/UserCollection',
  './IsaShiftPersonnel',
  './IsaRequestCollection',
  './IsaEventCollection',
  './pages/IsaLineStatePage',
  'i18n!app/nls/isa'
], function(
  router,
  viewport,
  user,
  UserCollection,
  IsaShiftPersonnel,
  IsaRequestCollection,
  IsaEventCollection,
  IsaLineStatePage
) {
  'use strict';

  router.map('/isa', user.auth('LOCAL', 'ISA:VIEW'), function(req)
  {
    viewport.showPage(new IsaLineStatePage({
      fullscreen: req.query.fullscreen !== undefined,
      model: {
        warehousemen: new UserCollection(null, {
          rqlQuery: 'select(firstName,lastName,personellId)&privileges=ISA%3AWHMAN'
        }),
        shiftPersonnel: new IsaShiftPersonnel(null, {current: true}),
        requests: IsaRequestCollection.active(),
        events: new IsaEventCollection(null, {paginate: false, rqlQuery: 'sort(-time)&limit(50)'}),
        selectedResponder: null,
        moving: {}
      }
    }));
  });

  router.map('/isa/events', user.auth('LOCAL', 'ISA:VIEW'), function(req)
  {
    viewport.loadPage(
      [
        'app/isa/pages/IsaEventListPage'
      ],
      function(IsaEventListPage)
      {
        return new IsaEventListPage({
          collection: new IsaEventCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });

  router.map('/isa/requests', user.auth('LOCAL', 'ISA:VIEW'), function(req)
  {
    viewport.loadPage(
      [
        'app/isa/IsaRequestCollection',
        'app/isa/pages/IsaRequestListPage'
      ],
      function(IsaRequestCollection, IsaRequestListPage)
      {
        return new IsaRequestListPage({
          collection: new IsaRequestCollection(null, {rqlQuery: req.rql})
        });
      }
    );
  });
});
