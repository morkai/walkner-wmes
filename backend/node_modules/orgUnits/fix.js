// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpOrgUnitsFix(app, module)
{
  const oldToNewProdLine = {
    'LM-35': 'LM-35',
    'MT': 'LM-36',
    'MT_PAK': 'LM-36_PAK',
    'WB-1': 'WB-1',
    'WB-2': 'WB-2',
    'WB-3': 'WB-3',
    'WB-4': 'WB-4',
    'WU-1': 'WU-1',
    'WU-2': 'WU-2',
    'AV1': 'LM-37',
    'AV2': 'LM-38',
    'OFC': 'LM-39'
  };
  const prodLineToOrgUnits = new Map();
  const prodLineToPlainOrgUnits = new Map();

  app.broker.subscribe('orgUnits.rebuilt', () =>
  {
    prodLineToOrgUnits.clear();
    prodLineToPlainOrgUnits.clear();
  });

  function getAllForProdLine(oldProdLine) // eslint-disable-line no-unused-vars
  {
    const newProdLine = oldToNewProdLine[oldProdLine];

    if (!newProdLine)
    {
      return null;
    }

    if (!prodLineToOrgUnits.has(newProdLine))
    {
      const orgUnits = module.getAllForProdLine(newProdLine, prodLineToOrgUnits[newProdLine]);

      prodLineToOrgUnits.set(newProdLine, {
        division: orgUnits.division,
        subdivision: orgUnits.subdivision,
        mrpControllers: [].concat(orgUnits.mrpControllers),
        prodFlow: orgUnits.prodFlow,
        workCenter: orgUnits.workCenter,
        prodLine: orgUnits.prodLine
      });
    }

    return prodLineToOrgUnits.get(newProdLine);
  }

  function getAllPlainForProdLine(oldProdLine)
  {
    const newProdLine = oldToNewProdLine[oldProdLine];

    if (!newProdLine)
    {
      return null;
    }

    if (!prodLineToPlainOrgUnits.has(newProdLine))
    {
      const orgUnits = module.getAllForProdLine(newProdLine, prodLineToPlainOrgUnits[newProdLine]);

      prodLineToPlainOrgUnits.set(newProdLine, {
        division: orgUnits.division,
        subdivision: orgUnits.subdivision.toString(),
        mrpControllers: [].concat(orgUnits.mrpControllers),
        prodFlow: orgUnits.prodFlow.toString(),
        workCenter: orgUnits.workCenter,
        prodLine: orgUnits.prodLine
      });
    }

    return prodLineToPlainOrgUnits.get(newProdLine);
  }

  module.fix = {
    prodLine: function(oldProdLine)
    {
      return oldToNewProdLine[oldProdLine] || oldProdLine;
    },
    prodLogEntry: function(prodLogEntry)
    {
      const newOrgUnits = getAllPlainForProdLine(prodLogEntry.prodLine);

      if (!newOrgUnits)
      {
        return prodLogEntry;
      }

      Object.assign(prodLogEntry, newOrgUnits);

      if (prodLogEntry.data.startedProdShift)
      {
        Object.assign(prodLogEntry.data.startedProdShift, newOrgUnits);
      }
      else if (prodLogEntry.data.prodLine)
      {
        Object.assign(prodLogEntry.data, newOrgUnits);
      }

      return prodLogEntry;
    }
  };
};
