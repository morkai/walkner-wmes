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

  return user.privileges.includes('PROD_DATA:MANAGE')
    || user.privileges.includes('HOURLY_PLANS:MANAGE')
    || user.privileges.includes('PLANNING:MANAGE')
    || user.privileges.includes('PLANNING:PLANNER');
};
