// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
