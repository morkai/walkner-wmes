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
      {id: 'login', className: 'is-min', thClassName: 'is-filter'},
      {id: 'lastName', className: 'is-min', thClassName: 'is-filter'},
      {id: 'firstName', className: 'is-min'},
      {id: 'personnelId', className: 'is-min', thClassName: 'is-filter', tdClassName: 'text-fixed'},
      {id: 'card', className: 'is-min', thClassName: 'is-filter', tdClassName: 'text-fixed'},
      {
        id: 'prodFunction',
        className: 'is-min',
        thClassName: 'is-filter',
        visible: loadedModules.isLoaded('prodFunctions')
      },
      {
        id: 'company',
        className: 'is-min',
        thClassName: 'is-filter',
        visible: loadedModules.isLoaded('companies')
      },
      {
        id: 'prodOrgUnit',
        className: 'is-min',
        thClassName: 'is-filter',
        visible: loadedModules.isLoaded('orgUnits')
      },
      {
        id: 'oshWorkplace',
        className: 'is-min',
        thClassName: 'is-filter',
        visible: loadedModules.isLoaded('wmes-osh')
      },
      {
        id: 'oshDepartment',
        className: 'is-min',
        thClassName: 'is-filter',
        visible: loadedModules.isLoaded('wmes-osh')
      },
      {id: 'active', className: 'is-min'},
      '-'
    ]

  });
});
