// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function canManage(user, hourlyPlan) // eslint-disable-line no-unused-vars
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

  return true;
};
