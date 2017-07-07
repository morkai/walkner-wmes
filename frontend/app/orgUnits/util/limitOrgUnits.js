// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user'
], function(
  _,
  user
) {
  'use strict';

  return function limitOrgUnits(selector, options)
  {
    options = _.assign({
      active: true,
      division: true,
      subdivision: true,
      divisionType: null,
      subdivisionType: null
    }, options);

    var userSubdivision = user.getSubdivision();

    if (options.subdivision && userSubdivision
      && (!options.active || userSubdivision.isActive())
      && (!options.subdivisionType || userSubdivision.get('type') === options.subdivisionType))
    {
      selector.push({name: 'eq', args: ['subdivision', userSubdivision.id]});

      return;
    }

    var userDivision = user.getDivision();

    if (options.division && userDivision
      && (!options.active || userDivision.isActive())
      && (!options.divisionType || userDivision.get('type') === options.divisionType))
    {
      selector.push({name: 'eq', args: ['division', userDivision.id]});
    }

    return selector;
  };
});
