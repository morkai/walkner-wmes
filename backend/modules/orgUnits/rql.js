// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const rql = require('h5.rql');

module.exports = function setUpOrgUnitsRql()
{
  rql.specialTerms.orgUnit = function(query, name, args)
  {
    const selectorName = query.selector.name;

    if (selectorName !== 'and' && selectorName !== 'or' && selectorName !== 'nor')
    {
      return;
    }

    const orgUnitType = String(args.shift());

    if (args.length === 0)
    {
      return;
    }

    if (args.length === 1)
    {
      query.selector.args.push({
        name: 'eq',
        args: ['orgUnits', {type: orgUnitType, id: String(args[0])}]
      });
    }
    else
    {
      query.selector.args.push({
        name: 'in',
        args: ['orgUnits', {type: orgUnitType, id: args.map(String)}]
      });
    }
  };
};
