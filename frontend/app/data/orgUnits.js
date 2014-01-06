define([
  './divisions',
  './subdivisions',
  './mrpControllers',
  './prodFlows',
  './workCenters',
  './prodLines'
], function(
  divisions,
  subdivisions,
  mrpControllers,
  prodFlows,
  workCenters,
  prodLines
) {
  'use strict';

  function getProdFlowsForSubdivision(subdivision)
  {
    if (typeof subdivision === 'string')
    {
      subdivision = subdivisions.get(subdivision);
    }

    if (!subdivision)
    {
      return [];
    }

    return prodFlows.filter(function(prodFlow)
    {
      return prodFlow.getSubdivision() === subdivision;
    });
  }

  function getSubdivisionsForDivision(division)
  {
    if (typeof division !== 'string')
    {
      division = division.id;
    }

    return subdivisions.filter(function(subdivision)
    {
      return subdivision.get('division') === division;
    });
  }

  return {
    getProdFlowsForSubdivision: getProdFlowsForSubdivision,
    getSubdivisionsForDivision: getSubdivisionsForDivision,
    getAllDivisions: function()
    {
      return divisions.models;
    }
  };
});
