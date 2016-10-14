// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const transliteration = require('transliteration');

module.exports = function setUpOperationGroups(app, ordersModule)
{
  const settings = app[ordersModule.config.settingsId];
  let groups = [];

  ordersModule.getGroupedOperations = getGroupedOperations;

  app.broker.subscribe('app.started', reload).setLimit(1);
  app.broker.subscribe('settings.updated.orders.operations.groups', reload);

  function prepareOperationName(rawOperationName)
  {
    return transliteration.transliterate(rawOperationName).replace(/[^A-Za-z0-9]+/g, '').toLowerCase();
  }

  function getGroupedOperations(allOperations, selectedOperationNo)
  {
    const selectedOperation = allOperations[selectedOperationNo];
    const selectedOperationName = prepareOperationName(selectedOperation.name);
    const allOperationsKeys = Object.keys(allOperations);
    let groupedOperations = null;

    groups.forEach(function(group)
    {
      if (groupedOperations !== null)
      {
        return;
      }

      const selectedWorkCenter = group.get(selectedOperationName);

      if (selectedWorkCenter === undefined)
      {
        return;
      }

      if (selectedWorkCenter !== '' && selectedWorkCenter !== selectedOperation.workCenter)
      {
        return;
      }

      const matches = [selectedOperation];

      allOperationsKeys.forEach(function(key)
      {
        const operation = allOperations[key];

        if (operation === selectedOperation)
        {
          return;
        }

        const workCenter = group.get(prepareOperationName(operation.name));

        if (workCenter === undefined)
        {
          return;
        }

        if (workCenter !== '' && workCenter !== operation.workCenter)
        {
          return;
        }

        matches.push(operation);
      });

      if (matches.length === group.size)
      {
        groupedOperations = matches;
      }
    });

    return groupedOperations || [selectedOperation];
  }

  function reload()
  {
    settings.findById('orders.operations.groups', function(err, setting)
    {
      if (err)
      {
        return ordersModule.error(`Failed to reload operation groups: ${err.message}`);
      }

      if (!setting)
      {
        return ordersModule.warn(`No orders.operations.groups setting!`);
      }

      groups = [];

      setting.value.split('\n').forEach(function(line)
      {
        const group = new Map();

        line.split('|').forEach(function(rawOperationName)
        {
          const parts = rawOperationName.split('@');
          const operationName = prepareOperationName(parts[0]);

          if (operationName.length)
          {
            group.set(operationName, parts.length > 1 ? parts[1].trim() : '');
          }
        });

        if (group.size > 1)
        {
          groups.push(group);
        }
      });
    });
  }
};
