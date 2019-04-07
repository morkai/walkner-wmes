// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/mrpControllers',
  'app/data/workCenters',
  'app/data/prodFlows',
  'app/data/prodLines'
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
      return '?';
    }

    var orgUnits = [];
    var parentId = '???';

    if (model.constructor === prodLines.model)
    {
      orgUnits.unshift(model);

      parentId = model.get('workCenter');

      model = workCenters.get(parentId);

      if (!model)
      {
        return '???' + parentId + '???';
      }
    }

    if (model.constructor === workCenters.model)
    {
      orgUnits.unshift(model);

      parentId = model.get('prodFlow') || model.get('mrpController');

      model = model.get('prodFlow')
        ? prodFlows.get(parentId)
        : mrpControllers.get(parentId);

      if (!model)
      {
        return '???' + parentId + '???';
      }
    }

    if (model.constructor === prodFlows.model)
    {
      orgUnits.unshift(model);

      parentId = model.get('mrpController') || [];

      model = parentId.map(function(id) { return mrpControllers.get(id); }).filter(function(m) { return !!m; });

      if (!model.length)
      {
        return '???' + parentId.join('; ') + '???';
      }
    }

    if (model.constructor === mrpControllers.model || (model[0] && model[0].constructor === mrpControllers.model))
    {
      orgUnits.unshift(model);

      parentId = (model[0] || model).get('subdivision');

      model = subdivisions.get(parentId);

      if (!model)
      {
        return '???' + parentId + '???';
      }
    }

    if (model.constructor === subdivisions.model)
    {
      orgUnits.unshift(model);

      parentId = model.get('division');

      model = divisions.get(parentId);

      if (!model)
      {
        return '???' + parentId + '???';
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
      return '???';
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
    var style = model.get('deactivatedAt') ? 'text-decoration: line-through!important' : '';

    if (!link)
    {
      return '<span style="' + style + '">' + label + '</span>';
    }

    var href = model.genClientUrl();

    return '<a href="' + href + '" style="' + style + '">' + label + '</a>';
  }
});
