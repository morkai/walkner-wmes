// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function exportFteMasterEntries(app, subdivisionsModule, queryStream, emitter)
{
  const docs = [];
  const prodFunctionMap = {};
  let prodFunctionList;

  queryStream.on('error', emitter.emit.bind(emitter, 'error'));

  queryStream.on('end', function()
  {
    prodFunctionList = Object.keys(prodFunctionMap);

    _.forEach(prodFunctionList, function(prodFunctionId)
    {
      prodFunctionMap[prodFunctionId] = Object.keys(prodFunctionMap[prodFunctionId]);
    });

    tryExportNext();
  });

  queryStream.on('data', function(doc)
  {
    _.forEach(doc.tasks, function(task)
    {
      task.companyTotals = {};
      task.prodFunctionTotals = {};

      const taskFunctionMap = {};

      _.forEach(task.functions, function(prodFunction)
      {
        if (prodFunctionMap[prodFunction.id] === undefined)
        {
          prodFunctionMap[prodFunction.id] = {};
        }

        taskFunctionMap[prodFunction.id] = prodFunction;

        const taskCompanyMap = {};

        _.forEach(prodFunction.companies, function(company) // eslint-disable-line max-nested-callbacks
        {
          prodFunctionMap[prodFunction.id][company.id] = true;
          taskCompanyMap[company.id] = company.count;
        });

        prodFunction.companies = taskCompanyMap;
      });

      task.functions = taskFunctionMap;
    });

    docs.push(doc);
  });

  function tryExportNext()
  {
    let i = 0;

    while (i++ < 25 && docs.length > 0)
    {
      exportNext(docs.shift());
    }

    if (docs.length === 0)
    {
      emitter.emit('end');
    }
    else
    {
      setImmediate(tryExportNext);
    }
  }

  function exportNext(doc)
  {
    const date = app.formatDate(doc.date);
    let subdivision = subdivisionsModule.modelsById[doc.subdivision];
    const division = subdivision ? subdivision.division : '?';

    subdivision = subdivision ? subdivision.name : doc.subdivision;

    for (let i = 0, l = doc.tasks.length; i < l; ++i)
    {
      const task = doc.tasks[i];
      const row = {
        '"division': division,
        '"subdivision': subdivision,
        'date': date,
        'shiftNo': doc.shift,
        'type': task.type,
        '"task': task.name,
        'noPlan': task.noPlan ? 1 : 0
      };

      exportCountColumns(row, task, prodFunctionMap, prodFunctionList);

      row['"fteId'] = doc._id;

      emitter.emit('data', row);
    }
  }
};

function exportCountColumns(row, task, prodFunctionMap, prodFunctionList)
{
  for (let i = 0, l = prodFunctionList.length; i < l; ++i)
  {
    const prodFunctionId = prodFunctionList[i];
    const prodFunctionCompanies = prodFunctionMap[prodFunctionId];
    const prodFunctionData = task.functions[prodFunctionId];

    if (prodFunctionData === undefined)
    {
      exportNoProdFunctionData(row, prodFunctionId, prodFunctionCompanies);
    }
    else
    {
      exportProdFunctionData(
        row, prodFunctionId, prodFunctionCompanies, prodFunctionData.companies
      );
    }
  }
}

function exportNoProdFunctionData(row, prodFunctionId, prodFunctionCompanies)
{
  for (let i = 0, l = prodFunctionCompanies.length; i < l; ++i)
  {
    row['#' + prodFunctionId + '[' + prodFunctionCompanies[i] + ']'] = 0;
  }
}

function exportProdFunctionData(row, prodFunctionId, prodFunctionCompanies, prodFunctionData)
{
  for (let i = 0, l = prodFunctionCompanies.length; i < l; ++i)
  {
    const companyId = prodFunctionCompanies[i];

    row['#' + prodFunctionId + '[' + companyId + ']'] = prodFunctionData[companyId] || 0;
  }
}
