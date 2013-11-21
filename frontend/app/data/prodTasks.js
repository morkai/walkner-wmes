define([
  'app/prodTasks/ProdTaskCollection',
  './createStorage'
], function(
  ProdTaskCollection,
  createStorage
) {
  'use strict';

  return createStorage('PROD_TASKS', 'prodTasks', ProdTaskCollection);
});
