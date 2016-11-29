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

      model = (model.get('mrpController') || []).map(function(id) { return mrpControllers.get(id); });

      if (!model.length)
      {
        return null;
      }
    }

    if (model.constructor === mrpControllers.model || (model[0] && model[0].constructor === mrpControllers.model))
    {
      orgUnits.unshift(model);

      model = subdivisions.get((model[0] || model).get('subdivision'));

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
        if (Array.isArray(model))
        {
          return model.map(function(m) { return renderOrgUnit(m, link); }).join('; ');
        }

        return renderOrgUnit(model, link);
      })
      .join(' \\ ');
  };

  function renderOrgUnit(model, link)
  {
    var label = _.escape(model.getLabel());
    var style = model.get('deactivatedAt') ? 'text-decoration: line-through!important': '';

    if (!link)
    {
      return '<span style="' + style + '">' + label + '</span>';
    }

    var href = model.genClientUrl();

    return '<a href="' + href + '" style="' + style + '">' + label + '</a>';
  }
});
