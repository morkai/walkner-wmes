// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../router',
  '../viewport',
  '../user',
  './IsaShiftPersonnel',
  './IsaLineStateCollection',
  './IsaEventCollection',
  './pages/IsaLineStatePage',
  'i18n!app/nls/isa'
], function(
  router,
  viewport,
  user,
  IsaShiftPersonnel,
  IsaLineStateCollection,
  IsaEventCollection,
  IsaLineStatePage
) {
  'use strict';

  router.map('/isa', user.auth('LOCAL', 'ISA:VIEW'), function(req)
  {
    viewport.showPage(new IsaLineStatePage({
      fullscreen: req.query.fullscreen !== undefined,
      model: {
        shiftPersonnel: new IsaShiftPersonnel(null, {current: true}),
        lineStates: new IsaLineStateCollection(null, {paginate: false}),
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
