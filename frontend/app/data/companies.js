define([
  'app/companies/CompanyCollection',
  './createStorage'
], function(
  CompanyCollection,
  createStorage
) {
  'use strict';

  return createStorage('COMPANIES', 'companies', CompanyCollection);
});
