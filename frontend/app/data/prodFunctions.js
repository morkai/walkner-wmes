define([

], function(

) {
  'use strict';

  var STORAGE_KEY = 'PROD_FUNCTIONS';
  var prodFunctions = window[STORAGE_KEY] || [];

  delete window[STORAGE_KEY];

  return prodFunctions;
});
