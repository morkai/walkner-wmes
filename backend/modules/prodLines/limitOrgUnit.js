// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function limitOrgUnit(req, res, next)
{
  const user = req.session.user || {};
  const selectors = req.rql.selector.args;
  const hasSpecificTerm = selectors.some(function(term)
  {
    return term.name === 'eq'
      && (term.args[0] === 'prodLine' || term.args[0] === 'prodShiftOrder' || term.args[0] === 'prodShift');
  });

  if (hasSpecificTerm || user.super || !user.orgUnitId)
  {
    return next();
  }

  selectors.push({
    name: 'eq',
    args: [user.orgUnitType, user.orgUnitId]
  });

  return next();
};
