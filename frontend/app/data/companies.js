// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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
