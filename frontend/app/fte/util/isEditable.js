// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/core/util/getShiftEndDate',
  'app/data/subdivisions'
], function(
  getShiftEndDate,
  subdivisions
) {
  'use strict';

  return function isEditable(fteEntry, user)
  {
    if (user.isAllowedTo('PROD_DATA:MANAGE'))
    {
      return 'yes';
    }

    if (!user.isAllowedTo(fteEntry.getPrivilegePrefix() + ':MANAGE'))
    {
      return 'no';
    }

    var createdAt = Date.parse(fteEntry.get('createdAt'));
    var now = Date.now();
    var yes = 'yes';

    if (now >= createdAt + 8 * 3600 * 1000 && now >= getShiftEndDate(fteEntry.get('date')).getTime())
    {
      if (!user.isAllowedTo('PROD_DATA:CHANGES:REQUEST') || (fteEntry.isWithFunctions && !fteEntry.isWithFunctions()))
      {
        return 'no';
      }

      yes = 'request';
    }

    var userDivision = user.getDivision();

    if (!userDivision || user.isAllowedTo(fteEntry.getPrivilegePrefix() + ':ALL'))
    {
      return yes;
    }

    var subdivision = subdivisions.get(fteEntry.get('subdivision'));

    if (!subdivision)
    {
      return 'no';
    }

    var entryDivisionId = subdivision.get('division');

    if (!entryDivisionId || userDivision.id !== entryDivisionId)
    {
      return 'no';
    }

    var userSubdivision = user.getSubdivision();

    if (!userSubdivision)
    {
      return yes;
    }

    return userSubdivision.id === subdivision.id ? yes : 'no';
  };
});
