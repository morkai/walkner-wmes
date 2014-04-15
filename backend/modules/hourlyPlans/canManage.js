// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
