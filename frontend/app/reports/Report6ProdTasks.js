// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../data/orgUnits',
  '../prodTasks/ProdTaskCollection'
], function(
  _,
  t,
  orgUnits,
  ProdTaskCollection
) {
  'use strict';

  var CATEGORY_CHARTS = {
    exTransactions: 'qty',
    inTransactions: 'qty',
    coopComp: 'qty',
    exStorage: 'qty',
    fifo: 'fte'
  };

  return ProdTaskCollection.extend({

    initialize: function(data, options)
    {
      if (!options.settings)
      {
        throw new Error("settings option is required!");
      }

      this.settings = options.settings;
    },

    parse: function(data)
    {
      var compSubdivision = orgUnits.getByTypeAndId('subdivision', this.settings.getValue('wh.comp.id'));
      var finGoodsSubdivision = orgUnits.getByTypeAndId('subdivision', this.settings.getValue('wh.finGoods.id'));
      var compTags = (compSubdivision ? compSubdivision.get('prodTaskTags') : null) || [];
      var finGoodsTags = (finGoodsSubdivision ? finGoodsSubdivision.get('prodTaskTags') : null) || [];

      return data.collection
        .map(function(prodTask)
        {
          prodTask.inComp = _.intersection(prodTask.tags, compTags).length > 0;
          prodTask.inFinGoods = _.intersection(prodTask.tags, finGoodsTags).length > 0;

          return prodTask;
        })
        .filter(function(prodTask)
        {
          return prodTask.inComp || prodTask.inFinGoods;
        });
    },

    createChartsConfiguration: function()
    {
      var chartsConfig = [];
      var specialTasks = this.prepareSpecialTasks();

      this.sort();

      for (var i = 0; i < this.length; ++i)
      {
        var prodTask = this.models[i];

        if (!prodTask.get('parent'))
        {
          this.handleProdTask(chartsConfig, specialTasks, prodTask);
        }
      }

      var groups = {};

      for (var j = 0; j < chartsConfig.length; ++j)
      {
        var chartRows = chartsConfig[j];
        var child = chartRows[0].child;

        if (groups[child] === undefined)
        {
          groups[child] = [chartRows];
        }
        else
        {
          groups[child].push(chartRows);
        }
      }

      chartsConfig = [
        [
          {kind: 'totalAndAbsence', type: 'total'},
          {kind: 'category', type: 'totalAbsence', unit: 'fte'}
        ],
        [
          {kind: 'totalAndAbsence', type: 'comp', parent: 'comp'},
          {kind: 'category', type: 'compAbsence', unit: 'fte'}
        ],
        [
          {kind: 'totalAndAbsence', type: 'finGoods', parent: 'finGoods'},
          {kind: 'category', type: 'finGoodsAbsence', unit: 'fte'}
        ]
      ];

      _.forEach(groups, function(chartColumns)
      {
        chartColumns.sort(function(a, b)
        {
          return a[0].parent ? -1 : b[0].parent ? 1 : 0;
        });

        var nextFreeColumn = -1;
        var ops = 0;
        var l = chartColumns.length - 1;

        do
        {
          var i = nextFreeColumn + 1;

          nextFreeColumn = -1;

          for (; i < l; ++i)
          {
            if (chartColumns[i].length < 2)
            {
              nextFreeColumn = i;

              break;
            }
          }

          if (nextFreeColumn === -1)
          {
            break;
          }

          var lastSingleColumn = l;

          while (lastSingleColumn > nextFreeColumn)
          {
            if (chartColumns[lastSingleColumn].length === 1 && !chartColumns[lastSingleColumn][0].parent)
            {
              break;
            }

            --lastSingleColumn;
          }

          lastSingleColumn = chartColumns[lastSingleColumn];

          if (!lastSingleColumn || lastSingleColumn.length !== 1 || lastSingleColumn[0].parent)
          {
            continue;
          }

          chartColumns[nextFreeColumn].push(lastSingleColumn.shift());
        }
        while (++ops < 100);

        chartsConfig.push.apply(chartsConfig, chartColumns);
      });

      return chartsConfig.filter(function(chartRows) { return chartRows.length > 0; });
    },

    prepareSpecialTasks: function()
    {
      var specialTasks = {};

      this.settings.forEach(function(setting)
      {
        var matches = setting.id.match(/^reports\.wh\.(.*?)\.prodTask$/);

        if (!matches)
        {
          return;
        }

        var prodTaskId = setting.getValue();
        var metricType = matches[1];

        if (/Absence$/.test(matches[1]))
        {
          metricType = 'absence';
        }
        else if (metricType === 'fifo')
        {
          var fifoTask = this.get(prodTaskId);

          if (fifoTask)
          {
            var inTransactionsTask = this.get(fifoTask.get('parent'));

            if (inTransactionsTask)
            {
              specialTasks[inTransactionsTask.id] = 'inTransactions';
            }
          }
        }
        else if (metricType === 'inComp')
        {
          var inComp = this.get(prodTaskId);

          if (inComp)
          {
            var exTransactionsTask = this.get(inComp.get('parent'));

            if (exTransactionsTask)
            {
              specialTasks[exTransactionsTask.id] = 'exTransactions';
            }
          }
        }

        specialTasks[prodTaskId] = metricType;
      }, this);

      return specialTasks;
    },

    handleProdTask: function(chartsConfig, specialTasks, prodTask)
    {
      var specialTask = specialTasks[prodTask.id];

      if (specialTask === 'absence')
      {
        return;
      }

      if (prodTask.get('inComp'))
      {
        chartsConfig.push(this.createChartRows('comp', specialTask, prodTask));
      }

      if (prodTask.get('inFinGoods'))
      {
        chartsConfig.push(this.createChartRows('finGoods', specialTask, prodTask));
      }

      prodTask.children.forEach(this.handleProdTask.bind(this, chartsConfig, specialTasks));
    },

    createChartRows: function(whType, specialTask, prodTask)
    {
      var parentId = prodTask.get('parent');
      var chartRows = [];

      chartRows.push({
        kind: 'effAndFte',
        type: specialTask || (whType + '-' + prodTask.id),
        child: parentId || whType,
        parent: prodTask.children.length ? prodTask.id : null
      });

      if (specialTask && CATEGORY_CHARTS[specialTask])
      {
        chartRows.push({
          kind: 'category',
          type: specialTask,
          unit: CATEGORY_CHARTS[specialTask]
        });
      }

      return chartRows;
    }

  });
});
