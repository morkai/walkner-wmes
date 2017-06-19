// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
