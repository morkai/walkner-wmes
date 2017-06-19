// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const _ = require('lodash');

module.exports = function exportFteLeaderEntries(app, subdivisionsModule, queryStream, emitter)
{
  const docs = [];
  let functionMap = {};
  let functionList = [];
  let companyMap = {};
  let companyList = [];
  let divisionMap = {};
  let divisionList = [];

  queryStream.on('error', emitter.emit.bind(emitter, 'error'));

  queryStream.on('end', function()
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
    const taskFunctionMap = {};

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

    const taskCompanyMap = {};

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

        const taskDivisionMap = {};

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
  const functionCount = functionList.length;
  const companyCount = companyList.length;
  const divisionCount = divisionList.length;
  let taskFunction;
  let functionId;
  let companyId;
  let divisionId;

  for (let i = 0; i < functionCount; ++i)
  {
    functionId = functionList[i];
    taskFunction = task.functions[functionId];

    const functionColumn = '#' + functionId;

    row[functionColumn] = taskFunction === undefined ? 0 : taskFunction.total;

    for (let ii = 0; ii < companyCount; ++ii)
    {
      companyId = companyList[ii];

      const companyColumn = functionColumn + '[' + companyId + ']';

      row[companyColumn]
        = taskFunction === undefined || taskFunction.companies[companyId] === undefined
          ? 0
          : taskFunction.companies[companyId].total;

      for (let iii = 0; iii < divisionCount; ++iii)
      {
        divisionId = divisionList[iii];

        const divisionColumn = companyColumn + '[' + divisionId + ']';

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

  const taskCompany = taskFunction.companies[companyId];

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
