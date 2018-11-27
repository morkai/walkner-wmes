// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './router',
  './viewport',
  './user',
  './isa/WhmanCollection',
  './isa/IsaShiftPersonnel',
  './isa/IsaRequestCollection',
  './isa/IsaEventCollection',
  './isa/pages/IsaLineStatePage',
  'i18n!app/nls/isa'
], function(
  router,
  viewport,
  user,
  WhmanCollection,
  IsaShiftPersonnel,
  IsaRequestCollection,
  IsaEventCollection,
  IsaLineStatePage
) {
  'use strict';

  router.map('/', user.auth('LOCAL', 'ISA:VIEW'), function()
  {
    viewport.showPage(new IsaLineStatePage({
      embedded: true,
      fullscreen: true,
      model: {
        warehousemen: new WhmanCollection(),
        shiftPersonnel: new IsaShiftPersonnel(null, {current: true}),
        requests: IsaRequestCollection.active(),
        events: new IsaEventCollection(null, {paginate: false, rqlQuery: 'sort(-time)&limit(50)'}),
        selectedResponder: null,
        moving: {}
      }
    }));
  });
});
