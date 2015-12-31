// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../divisions',
  '../subdivisions',
  '../mrpControllers',
  '../workCenters',
  '../prodFlows',
  '../prodLines'
], function(
  _,
  divisions,
  subdivisions,
  mrpControllers,
  workCenters,
  prodFlows,
  prodLines
) {
  'use strict';

  return function renderOrgUnitPath(model, link, pop)
  {
    if (!model)
    {
      return null;
    }

    var orgUnits = [];

    if (model.constructor === prodLines.model)
    {
      orgUnits.unshift(model);

      model = workCenters.get(model.get('workCenter'));

      if (!model)
      {
        return null;
      }
    }

    if (model.constructor === workCenters.model)
    {
      orgUnits.unshift(model);

      model = model.get('prodFlow')
        ? prodFlows.get(model.get('prodFlow'))
        : mrpControllers.get(model.get('mrpController'));

      if (!model)
      {
        return null;
      }
    }

    if (model.constructor === prodFlows.model)
    {
      orgUnits.unshift(model);

      model = mrpControllers.get((model.get('mrpController') || [])[0]);

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
