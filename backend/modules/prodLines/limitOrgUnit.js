'use strict';

module.exports = function limitOrgUnit(req, res, next)
{
  var user = req.session.user;
  var selectors = req.rql.selector.args;
  var hasProdLineTerm = selectors.some(function(term)
  {
    return term.name === 'eq' && term.args[0] === 'prodLine';
  });

  if (hasProdLineTerm || user.super || !user.orgUnitId)
  {
    return next();
  }

  selectors.push({
    name: 'eq',
    args: [user.orgUnitType, user.orgUnitId]
  });

  return next();
};
