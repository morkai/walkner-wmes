// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  return function(userInfo, userData)
  {
    if (userData.oshWorkplace)
    {
      userInfo.oshDivision = userData.oshDivision;
      userInfo.oshWorkplace = userData.oshWorkplace;
      userInfo.oshDepartment = userData.oshDepartment || 0;
    }

    return userInfo;
  };
});
