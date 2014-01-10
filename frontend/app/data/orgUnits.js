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

  return {
    getProdFlowsForSubdivision: function(subdivision)
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
    },
    getSubdivisionsForDivision: function(division)
    {
      if (typeof division !== 'string')
      {
        division = division.id;
      }

      return subdivisions.filter(function(subdivision)
      {
        return subdivision.get('division') === division;
      });
    },
    getAllDivisions: function()
    {
      return divisions.models;
    },
    getAllForProdLine: function(prodLine)
    {
      if (typeof prodLine === 'string')
      {
        prodLine = prodLines.get(prodLine);
      }

      var orgUnits = {
        division: null,
        subdivision: null,
        mrpControllers: null,
        prodFlow: null,
        workCenter: null,
        prodLine: null
      };

      if (!prodLine)
      {
        return orgUnits;
      }

      orgUnits.prodLine = prodLine.id;

      var workCenter = workCenters.get(prodLine.get('workCenter'));

      if (!workCenter)
      {
        return orgUnits;
      }

      orgUnits.workCenter = workCenter.id;

      var prodFlow = prodFlows.get(workCenter.get('prodFlow'));

      if (!prodFlow)
      {
        return orgUnits;
      }

      orgUnits.prodFlow = prodFlow.id;

      var mrpController = prodFlow.get('mrpController');

      if (!Array.isArray(mrpController) || !mrpController.length)
      {
        return orgUnits;
      }

      orgUnits.mrpControllers = mrpController;

      mrpController = mrpControllers.get(mrpController[0]);

      if (!mrpController)
      {
        return orgUnits;
      }

      var subdivision = subdivisions.get(mrpController.get('subdivision'));

      if (!subdivision)
      {
        return orgUnits;
      }

      orgUnits.subdivision = subdivision.id;

      var division = divisions.get(subdivision.get('division'));

      if (!division)
      {
        return orgUnits;
      }

      orgUnits.division = division.id;

      return orgUnits;
    }
  };
});
