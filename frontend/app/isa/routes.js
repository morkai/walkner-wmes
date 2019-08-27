// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user'
], function(
  router,
  viewport,
  user
) {
  'use strict';

  router.map('/isa', user.auth('LOCAL', 'ISA:VIEW'), function(req)
  {
    viewport.loadPage(
      [
        'app/isa/WhmanCollection',
        'app/isa/IsaShiftPersonnel',
        'app/isa/IsaRequestCollection',
        'app/isa/IsaEventCollection',
        'app/isa/pages/IsaLineStatePage',
        'css!app/isa/assets/main',
        'i18n!app/nls/isa'
      ],
      function(
        WhmanCollection,
        IsaShiftPersonnel,
        IsaRequestCollection,
        IsaEventCollection,
        IsaLineStatePage
      ) {
        return new IsaLineStatePage({
          fullscreen: req.query.fullscreen !== undefined,
          model: {
            warehousemen: new WhmanCollection(),
            shiftPersonnel: new IsaShiftPersonnel(null, {current: true}),
            requests: IsaRequestCollection.active(),
            events: new IsaEventCollection(null, {paginate: false, rqlQuery: 'sort(-time)&limit(50)'}),
            selectedResponder: null,
            moving: {}
          }
        });
      }
    );
  });

  router.map('/isa/events', user.auth('LOCAL', 'ISA:VIEW'), function(req)
  {
    viewport.loadPage(
      [
        'app/isa/IsaEventCollection',
        'app/isa/pages/IsaEventListPage',
        'css!app/isa/assets/main',
        'i18n!app/nls/isa'
      ],
      function(IsaEventCollection, IsaEventListPage)
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
        'app/isa/pages/IsaRequestListPage',
        'css!app/isa/assets/main',
        'i18n!app/nls/isa'
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
