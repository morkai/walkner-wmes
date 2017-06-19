// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user'
], function(
  user
) {
  'use strict';

  return function()
  {
    return user.isAllowedTo('PROD_DATA:CHANGES:REQUEST') && !user.isAllowedTo('PROD_DATA:MANAGE');
  };
});
