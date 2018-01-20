// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function canManage(user, fteEntry, entryType)
{
  if (!user)
  {
    return false;
  }

  if (user.super)
  {
    return true;
  }

  if (!Array.isArray(user.privileges))
  {
    return false;
  }

  if (!user.privileges.includes('PROD_DATA:MANAGE'))
  {
    return true;
  }

  if (!user.privileges.includes(`FTE:${entryType}:MANAGE`))
  {
    return false;
  }

  if (!fteEntry.createdAt || !fteEntry.date)
  {
    return true;
  }

  const now = Date.now();

  return now < (fteEntry.createdAt.getTime() + 8 * 3600 * 1000)
    || now < (fteEntry.date.getTime() + 8 * 3600 * 1000);
};
