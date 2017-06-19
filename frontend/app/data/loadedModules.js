// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
