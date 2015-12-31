// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function canManage(user, hourlyPlan)
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

  if (user.privileges.indexOf('HOURLY_PLANS:MANAGE') === -1)
  {
    return false;
  }

  if (!hourlyPlan)
  {
    return true;
  }

  return Date.now() < (hourlyPlan.createdAt.getTime() + 8 * 3600 * 1000);
};
