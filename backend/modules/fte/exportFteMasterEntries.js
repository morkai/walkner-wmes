'use strict';

var moment = require('moment');

module.exports = function exportFteMasterEntries(subdivisionsModule, queryStream, emitter)
{
  var docs = [];
  var prodFunctionMap = {};
  var prodFunctionList;

  queryStream.on('error', emitter.emit.bind(emitter, 'error'));

  queryStream.on('close', function()
  {
    prodFunctionList = Object.keys(prodFunctionMap);

    prodFunctionList.forEach(function(prodFunctionId)
    {
      prodFunctionMap[prodFunctionId] = Object.keys(prodFunctionMap[prodFunctionId]);
    });

    tryExportNext();
  });

  queryStream.on('data', function(doc)
  {
    doc.tasks.forEach(function(task)
    {
      task.companyTotals = {};
      task.prodFunctionTotals = {};

      var taskFunctionMap = {};

      task.functions.forEach(function(prodFunction)
      {
        if (prodFunctionMap[prodFunction.id] === undefined)
        {
          prodFunctionMap[prodFunction.id] = {};
        }

        taskFunctionMap[prodFunction.id] = prodFunction;

        var taskCompanyMap = {};

        prodFunction.companies.forEach(function(company)
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
    var i = 0;

    while (i++ < 100 && docs.length > 0)
    {
      exportNext(docs.shift());
    }

    if (docs.length === 0)
    {
      emitter.emit('close');
    }
    else
    {
      setImmediate(tryExportNext);
    }
  }

  function exportNext(doc)
  {
    var date = moment(doc.date).format('YYYY-MM-DD');
    var subdivision = subdivisionsModule.modelsById[doc.subdivision];
    var division = subdivision ? subdivision.division : '?';

    subdivision = subdivision ? subdivision.name : doc.subdivision;

    for (var i = 0, l = doc.tasks.length; i < l; ++i)
    {
      var task = doc.tasks[i];
      var row = {
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
  for (var i = 0, l = prodFunctionList.length; i < l; ++i)
  {
    var prodFunctionId = prodFunctionList[i];
    var prodFunctionCompanies = prodFunctionMap[prodFunctionId];
    var prodFunctionData = task.functions[prodFunctionId];

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
  for (var i = 0, l = prodFunctionCompanies.length; i < l; ++i)
  {
    row['#' + prodFunctionId + '[' + prodFunctionCompanies[i] + ']'] = 0;
  }
}

function exportProdFunctionData(row, prodFunctionId, prodFunctionCompanies, prodFunctionData)
{
  for (var i = 0, l = prodFunctionCompanies.length; i < l; ++i)
  {
    var companyId = prodFunctionCompanies[i];

    row['#' + prodFunctionId + '[' + companyId + ']'] = prodFunctionData[companyId] || 0;
  }
}
