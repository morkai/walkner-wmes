'use strict';

module.exports = function canManage(user, fteEntry)
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

  var modelName = fteEntry.modelName || fteEntry.constructor.modelName;
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

  return Date.now() < (fteEntry.createdAt.getTime() + 8 * 3600 * 1000);
};
