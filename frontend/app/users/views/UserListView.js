// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/loadedModules',
  'app/core/views/ListView'
], function(
  loadedModules,
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    localTopics: {
      'companies.synced': 'render'
    },

    columns: [
      {id: 'personnelId', className: 'is-min'},
      {id: 'login', className: 'is-min'},
      {id: 'lastName', className: 'is-min'},
      {id: 'firstName', className: 'is-min'},
      {id: 'active', className: 'is-min'},
      {id: 'company', className: 'is-min', visible: loadedModules.isLoaded('companies')},
      {id: 'orgUnit', className: 'is-min', visible: loadedModules.isLoaded('orgUnits')},
      {id: 'oshWorkplace', className: 'is-min', visible: loadedModules.isLoaded('wmes-osh')},
      {id: 'oshDepartment', className: 'is-min', visible: loadedModules.isLoaded('wmes-osh')},
      {id: 'prodFunction', visible: loadedModules.isLoaded('prodFunctions')},
      '-'
    ]

  });
});
