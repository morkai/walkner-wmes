// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var _ = require('lodash');

module.exports = function exportFteLeaderEntries(app, subdivisionsModule, queryStream, emitter)
{
  var docs = [];
  var functionMap = {};
  var functionList = [];
  var companyMap = {};
  var companyList = [];
  var divisionMap = {};
  var divisionList = [];

  queryStream.on('error', emitter.emit.bind(emitter, 'error'));

  queryStream.on('close', function()
  {
    functionList = Object.keys(functionMap);
    functionMap = null;
    companyList = Object.keys(companyMap);
    companyMap = null;
    divisionList = Object.keys(divisionMap);
    divisionMap = null;

    tryExportNext();
  });

  queryStream.on('data', function(doc)
  {
    _.forEach(doc.tasks, handleTask);

    if (Array.isArray(doc.fteDiv) && doc.fteDiv.length)
    {
      _.forEach(doc.fteDiv, function(division)
      {
        divisionMap[division] = true;
      });
    }

    docs.push(doc);
  });

  function handleTask(task)
  {
    var taskFunctionMap = {};

    if (Array.isArray(task.companies) && task.companies.length)
    {
      task.functions = [{
        id: 'wh',
        companies: task.companies
      }];
    }

    _.forEach(task.functions, function(taskFunction)
    {
      handleTaskFunction(taskFunctionMap, taskFunction);
    });

    task.functions = taskFunctionMap;
  }

  function handleTaskFunction(taskFunctionMap, taskFunction)
  {
    functionMap[taskFunction.id] = true;
    taskFunctionMap[taskFunction.id] = taskFunction;

    var taskCompanyMap = {};

    taskFunction.total = 0;

    _.forEach(taskFunction.companies, function(taskCompany)
    {
      companyMap[taskCompany.id] = true;
      taskCompanyMap[taskCompany.id] = taskCompany;

      if (typeof taskCompany.count === 'number')
      {
        taskCompany.total = taskCompany.count;
      }
      else
      {
        taskCompany.total = 0;

        var taskDivisionMap = {};

        _.forEach(taskCompany.count, function(taskDivision)
        {
          taskCompany.total += taskDivision.value;
          taskDivisionMap[taskDivision.division] = taskDivision.value;
        });

        taskCompany.count = taskDivisionMap;
      }

      taskFunction.total += taskCompany.total;
    });

    taskFunction.companies = taskCompanyMap;
  }

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
    var date = app.formatDate(doc.date);
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
        '"task': task.name,
        'parent': task.parent ? 0 : 1
      };

      exportCountColumns(row, task, functionList, companyList, divisionList);

      row['"fteId'] = doc._id;

      emitter.emit('data', row);
    }
  }
};

function exportCountColumns(row, task, functionList, companyList, divisionList)
{
  var functionCount = functionList.length;
  var companyCount = companyList.length;
  var divisionCount = divisionList.length;
  var taskFunction;
  var functionId;
  var companyId;
  var divisionId;

  for (var i = 0; i < functionCount; ++i)
  {
    functionId = functionList[i];
    taskFunction = task.functions[functionId];

    var functionColumn = '#' + functionId;

    row[functionColumn] = taskFunction === undefined ? 0 : taskFunction.total;

    for (var ii = 0; ii < companyCount; ++ii)
    {
      companyId = companyList[ii];

      var companyColumn = functionColumn + '[' + companyId + ']';

      row[companyColumn] =
        taskFunction === undefined || taskFunction.companies[companyId] === undefined
          ? 0
          : taskFunction.companies[companyId].total;

      for (var iii = 0; iii < divisionCount; ++iii)
      {
        divisionId = divisionList[iii];

        var divisionColumn = companyColumn + '[' + divisionId + ']';

        row[divisionColumn] = getDivisionCount(taskFunction, companyId, divisionId);
      }
    }
  }
}

function getDivisionCount(taskFunction, companyId, divisionId)
{
  if (taskFunction === undefined)
  {
    return 0;
  }

  var taskCompany = taskFunction.companies[companyId];

  if (taskCompany === undefined)
  {
    return 0;
  }

  if (typeof taskCompany.count[divisionId] === 'number')
  {
    return taskCompany.count[divisionId];
  }

  return 0;
}
