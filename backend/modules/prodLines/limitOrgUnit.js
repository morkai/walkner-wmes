// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

module.exports = function limitOrgUnit(req, res, next)
{
  var user = req.session.user || {};
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
