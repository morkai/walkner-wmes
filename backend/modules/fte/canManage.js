// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function canManage(user, fteEntry, modelName)
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

  if (user.privileges.indexOf('PROD_DATA:MANAGE') !== -1)
  {
    return true;
  }

  if (!modelName)
  {
    modelName = fteEntry.modelName || fteEntry.constructor.modelName;
  }

  var privilegePrefix = modelName === 'FteMasterEntry'
    ? 'FTE:MASTER'
    : 'FTE:LEADER';

  if (user.privileges.indexOf(privilegePrefix + ':MANAGE') === -1)
  {
    return false;
  }

  if (typeof fteEntry.modelName === 'string')
  {
    return true;
  }

  var now = Date.now();

  return now < (fteEntry.createdAt.getTime() + 8 * 3600 * 1000)
    || now < (fteEntry.date.getTime() + 8 * 3600 * 1000);
};
