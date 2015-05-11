// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([

], function(

) {
  'use strict';

  var moduleList = window.MODULES || [];
  var moduleMap = {};

  for (var i = 0; i < moduleList.length; ++i)
  {
    moduleMap[moduleList[i]] = true;
  }

  return {
    list: moduleList,
    map: moduleMap,
    isLoaded: function(moduleName)
    {
      return moduleMap[moduleName] === true;
    }
  };
});
