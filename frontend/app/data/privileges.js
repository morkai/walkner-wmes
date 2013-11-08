define([

], function(

) {
  'use strict';

  var STORAGE_KEY = 'PRIVILEGES';
  var privileges = window[STORAGE_KEY] || [];

  delete window[STORAGE_KEY];

  return privileges;
});
