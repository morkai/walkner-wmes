define([
  'underscore',
  '../divisions',
  '../subdivisions',
  '../mrpControllers',
  '../prodFlows',
  '../workCenters'
], function(
  _,
  divisions,
  subdivisions,
  mrpControllers,
  prodFlows,
  workCenters
) {
  'use strict';

  return function renderOrgUnitPath(model, link, pop)
  {
    var orgUnits = [];

    if (model.constructor === prodFlows.model)
    {
      orgUnits.unshift(model);

      model = mrpControllers.get(model.get('mrpController'));

      if (!model)
      {
        return null;
      }
    }

    if (model.constructor === mrpControllers.model)
    {
      orgUnits.unshift(model);

      model = subdivisions.get(model.get('subdivision'));

      if (!model)
      {
        return null;
      }
    }

    if (model.constructor === subdivisions.model)
    {
      orgUnits.unshift(model);

      model = divisions.get(model.get('division'));

      if (!model)
      {
        return null;
      }
    }

    if (model.constructor === divisions.model)
    {
      orgUnits.unshift(model);
    }

    if (pop !== false)
    {
      orgUnits.pop();
    }

    if (orgUnits.length === 0)
    {
      return null;
    }

    return orgUnits
      .map(function(model)
      {
        var label = _.escape(model.getLabel());

        return link ? ('<a href="' + model.genClientUrl() + '">' + label + '</a>') : label;
      })
      .join(' \\ ');
  };
});
