// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  './aors',
  './companies',
  './downtimeReasons',
  './isaPalletKinds',
  './orderStatuses',
  './prodFunctions',
  './divisions',
  './subdivisions',
  './mrpControllers',
  './prodFlows',
  './workCenters',
  './prodLines'
], function(
  aors,
  companies,
  downtimeReasons,
  isaPalletKinds,
  orderStatuses,
  prodFunctions,
  divisions,
  subdivisions,
  mrpControllers,
  prodFlows,
  workCenters,
  prodLines
) {
  'use strict';

  return {
    aors: aors,
    AORS: aors,
    companies: companies,
    COMPANIES: companies,
    downtimeReasons: downtimeReasons,
    DOWNTIME_REASONS: downtimeReasons,
    isaPalletKinds: isaPalletKinds,
    ISA_PALLET_KINDS: isaPalletKinds,
    orderStatuses: orderStatuses,
    ORDER_STATUSES: orderStatuses,
    prodFunctions: prodFunctions,
    PROD_FUNCTIONS: prodFunctions,
    divisions: divisions,
    DIVISIONS: divisions,
    subdivisions: subdivisions,
    SUBDIVISIONS: subdivisions,
    mrpControllers: mrpControllers,
    MRP_CONTROLLERS: mrpControllers,
    prodFlows: prodFlows,
    PROD_FLOWS: prodFlows,
    workCenters: workCenters,
    WORK_CENTERS: workCenters,
    prodLines: prodLines,
    PROD_LINES: prodLines
  };
});
