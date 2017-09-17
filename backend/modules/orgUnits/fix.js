// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpOrgUnitsFix(app, module)
{
  const oldToNewProdLine = {
    'CT1': 'CT1',
    'CT2': 'CT2',
    'CT3': 'CT3',
    'CT4': 'CT4',
    'CT5': 'CT5',
    'CT6': 'CT6',
    'CT7': 'CT7',
    'CT8': 'CT8',
    'CT9': 'CT9',
    'CT10': 'CT10',
    'W-1': 'W-1',
    'W-2': 'W-2',
    'W-3': 'W-3',
    'W1_SM-12_1': 'WB-1',
    'W1_SM-12_2': 'WB-2',
    'W1_SM-12_3': 'WB-3',
    'W1_SM-12_4': 'WB-4',
    'W1_SM-13_1': 'WU-1',
    'W1_SM-13_2': 'WU-2',
    'OFC': 'OFC',
    'CT11': 'MFP-11',
    'CT12': 'MFP-12',
    'CS': 'LM-9',
    'PSP': 'PSP',
    'PPS': 'PPS'
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
