// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../i18n',
  '../data/orgUnits',
  '../data/views/renderOrgUnitPath',
  '../core/Model'
], function(
  _,
  t,
  orgUnits,
  renderOrgUnitPath,
  Model
) {
  'use strict';

  function round(num)
  {
    return isNaN(num) || !isFinite(num) ? 0 : (Math.round(num * 100) / 100);
  }

  return Model.extend({

    urlRoot: '/reports/6',

    defaults: function()
    {
      return {};
    },

    initialize: function(data, options)
    {
      if (!options.query)
      {
        throw new Error("query option is required!");
      }

      this.query = options.query;
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.extend(
        options.data || {},
        this.query.serializeToObject()
      );

      return Model.prototype.fetch.call(this, options);
    },

    parse: function(report)
    {
      var attrs = {
        settings: report.options.settings,
        prodTasks: report.options.prodTasks,
        effAndFte: {
          inComp: {fte: [], eff: []},
          coopComp: {fte: [], eff: []},
          exStorage: {fte: [], eff: []},
          exTransactions: {fte: [], eff: []}
        },
        category: {
          coopComp: [],
          exStorage: [],
          exTransactions: [],
          fifo: [],
          totalAbsence: [],
          compAbsence: [],
          finGoodsAbsence: []
        },
        totalAndAbsence: {
          total: {fte: [], absence: []},
          comp: {fte: [], absence: []},
          finGoods: {fte: [], absence: []}
        },
        fte: {
          fifo: {},
          totalAbsence: {},
          compAbsence: {},
          finGoodsAbsence: {}
        },
        count: {
          inComp: 0,
          coopComp541: 0,
          coopCompProcessing: 0,
          exStorageOut: 0,
          exStorageIn: 0,
          fifo: 0,
          staging: 0,
          sm: 0,
          paint: 0,
          fixBin: 0,
          finGoodsIn: 0,
          finGoodsOut: 0
        }
      };

      var fifoTasks = [];
      var fifoParentTaskId = attrs.settings['fifo.prodTask'];
      var compAbsenceTasks = [];
      var compAbsenceParentTaskId = attrs.settings['compAbsence.prodTask'];
      var finGoodsAbsenceTasks = [];
      var finGoodsAbsenceParentTaskId = attrs.settings['finGoodsAbsence.prodTask'];

      _.forEach(attrs.prodTasks, function(prodTask, prodTaskId)
      {
        if (prodTask.parent === fifoParentTaskId)
        {
          fifoTasks.push(prodTaskId);
        }

        if (prodTask.parent === compAbsenceParentTaskId)
        {
          compAbsenceTasks.push(prodTaskId);
        }

        if (prodTask.parent === finGoodsAbsenceParentTaskId)
        {
          finGoodsAbsenceTasks.push(prodTaskId);
        }
      });

      for (var i = 0, l = report.data.length; i < l; ++i)
      {
        var groupData = report.data[i];

        if (groupData.compTasks === undefined)
        {
          this.prepareEmptyGroupData(groupData);
        }

        this.calcExTransactions(attrs, groupData);
        this.calcFifo(attrs, groupData, fifoTasks);
        this.calcEffAndFte(attrs, groupData, 'staging');
        this.calcEffAndFte(attrs, groupData, 'sm');
        this.calcEffAndFte(attrs, groupData, 'paint');
        this.calcEffAndFte(attrs, groupData, 'fixBin');
        this.calcEffAndFte(attrs, groupData, 'finGoodsIn');
        this.calcEffAndFte(attrs, groupData, 'finGoodsOut');
        this.calcAbsence(attrs, groupData, compAbsenceTasks, finGoodsAbsenceTasks);
      }

      attrs.category.coopComp.push(
        this.createCategoryPoint('coopComp541', attrs.count.coopComp541),
        this.createCategoryPoint('coopCompProcessing', attrs.count.coopCompProcessing)
      );

      attrs.category.exStorage.push(
        this.createCategoryPoint('exStorageIn', attrs.count.exStorageIn),
        this.createCategoryPoint( 'exStorageOut', attrs.count.exStorageOut)
      );

      attrs.category.exTransactions.push(
        this.createCategoryPoint('inComp', attrs.count.inComp),
        this.createCategoryPoint('coopComp', attrs.count.coopComp541 + attrs.count.coopCompProcessing),
        this.createCategoryPoint('exStorage', attrs.count.exStorageIn + attrs.count.exStorageOut)
      );

      this.createFteCategoryPoints(attrs, 'fifo');
      this.createFteCategoryPoints(attrs, 'totalAbsence');
      this.createFteCategoryPoints(attrs, 'compAbsence');
      this.createFteCategoryPoints(attrs, 'finGoodsAbsence');

      return attrs;
    },

    createCategoryPoint: function(metric, value)
    {
      return {
        name: t('reports', 'wh:category:name:' + metric),
        y: value
      };
    },

    createFteCategoryPoints: function(attrs, metric)
    {
      _.forEach(attrs.fte[metric], function(fte, taskId)
      {
        var task = attrs.prodTasks[taskId];

        attrs.category[metric].push({
          name: task.name,
          y: fte,
          color: task.color
        });
      });
    },

    prepareEmptyGroupData: function(groupData)
    {
      return _.extend(groupData, {
        finGoodsTasks: {},
        compTasks: {},
        finGoodsTotalFte: 0,
        compTotalFte: 0,
        finGoodsAbsenceFte: 0,
        compAbsenceFte: 0,
        finGoodsOutFte: 0,
        finGoodsOutCount: 0,
        finGoodsInFte: 0,
        finGoodsInCount: 0,
        fixBinFte: 0,
        fixBinCount: 0,
        paintFte: 0,
        paintCount: 0,
        smFte: 0,
        smCount: 0,
        stagingFte: 0,
        stagingCount: 0,
        fifoFte: 0,
        fifoCount: 0,
        exStorageInCount: 0,
        exStorageOutCount: 0,
        exStorageFte: 0,
        coopCompFte: 0,
        coopComp541Count: 0,
        coopComp344Count: 0,
        coopComp343Count: 0,
        inCompFte: 0,
        inCompCount: 0
      });
    },

    calcExTransactions: function(attrs, groupData)
    {
      var key = groupData.key;

      attrs.effAndFte.inComp.eff.push({x: key, y: round(groupData.inCompCount / groupData.inCompFte)});
      attrs.effAndFte.inComp.fte.push({x: key, y: groupData.inCompFte});
      attrs.count.inComp += groupData.inCompCount;

      var coopCompProcessingCount = groupData.coopComp344Count + groupData.coopComp343Count;
      var coopCompCount = groupData.coopComp541Count + coopCompProcessingCount;

      attrs.effAndFte.coopComp.eff.push({x: key, y: round(coopCompCount / groupData.coopCompFte)});
      attrs.effAndFte.coopComp.fte.push({x: key, y: groupData.coopCompFte});
      attrs.count.coopComp541 += groupData.coopComp541Count;
      attrs.count.coopCompProcessing += coopCompProcessingCount;

      var exStorageCount = groupData.exStorageInCount + groupData.exStorageOutCount;

      attrs.effAndFte.exStorage.eff.push({x: key, y: round(exStorageCount / groupData.exStorageFte)});
      attrs.effAndFte.exStorage.fte.push({x: key, y: groupData.exStorageFte});
      attrs.count.exStorageIn += groupData.exStorageInCount;
      attrs.count.exStorageOut += groupData.exStorageOutCount;

      var exTransactionsCount = groupData.inCompCount + coopCompCount + exStorageCount;
      var exTransactionsFte = groupData.inCompFte + groupData.coopCompFte + groupData.exStorageFte;

      attrs.effAndFte.exTransactions.eff.push({x: key, y: round(exTransactionsCount / exTransactionsFte)});
      attrs.effAndFte.exTransactions.fte.push({x: key, y: exTransactionsFte});
    },

    calcEffAndFte: function(attrs, groupData, metric)
    {
      if (attrs.effAndFte[metric] === undefined)
      {
        attrs.effAndFte[metric] = {fte: [], eff: []};
      }

      var count = groupData[metric + 'Count'];
      var fte = groupData[metric + 'Fte'];

      attrs.effAndFte[metric].eff.push({x: groupData.key, y: round(count / fte)});
      attrs.effAndFte[metric].fte.push({x: groupData.key, y: fte});
    },

    calcFifo: function(attrs, groupData, fifoTasks)
    {
      this.calcEffAndFte(attrs, groupData, 'fifo');

      _.forEach(fifoTasks, function(fifoTaskId)
      {
        /*jshint -W116*/

        var fte = groupData.compTasks[fifoTaskId];

        if (fte == undefined)
        {
          return;
        }

        if (attrs.fte.fifo[fifoTaskId] === undefined)
        {
          attrs.fte.fifo[fifoTaskId] = fte;
        }
        else
        {
          attrs.fte.fifo[fifoTaskId] += fte;
        }
      });
    },

    calcAbsence: function(attrs, groupData, compAbsenceTasks, finGoodsAbsenceTasks)
    {
      var totalFte = groupData.compTotalFte + groupData.finGoodsTotalFte;
      var totalAbsenceFte = groupData.compAbsenceFte + groupData.finGoodsAbsenceFte;

      attrs.totalAndAbsence.total.fte.push({
        x: groupData.key,
        y: totalFte
      });
      attrs.totalAndAbsence.total.absence.push({
        x: groupData.key,
        y: round(totalAbsenceFte * 100 / totalFte)
      });
      attrs.totalAndAbsence.comp.fte.push({
        x: groupData.key,
        y: groupData.compTotalFte
      });
      attrs.totalAndAbsence.comp.absence.push({
        x: groupData.key,
        y: round(groupData.compAbsenceFte * 100 / groupData.compTotalFte)
      });
      attrs.totalAndAbsence.finGoods.fte.push({
        x: groupData.key,
        y: groupData.finGoodsTotalFte
      });
      attrs.totalAndAbsence.finGoods.absence.push({
        x: groupData.key,
        y: round(groupData.finGoodsAbsenceFte * 100 / groupData.finGoodsTotalFte)
      });

      _.forEach(compAbsenceTasks, function(absenceTaskId)
      {
        /*jshint -W116*/

        if (attrs.fte.totalAbsence[absenceTaskId] === undefined)
        {
          attrs.fte.totalAbsence[absenceTaskId] = 0;
        }

        if (attrs.fte.compAbsence[absenceTaskId] === undefined)
        {
          attrs.fte.compAbsence[absenceTaskId] = 0;
        }

        var compFte = groupData.compTasks[absenceTaskId] || 0;

        attrs.fte.totalAbsence[absenceTaskId] += compFte;
        attrs.fte.compAbsence[absenceTaskId] += compFte;
      });

      _.forEach(finGoodsAbsenceTasks, function(absenceTaskId)
      {
        /*jshint -W116*/

        if (attrs.fte.totalAbsence[absenceTaskId] === undefined)
        {
          attrs.fte.totalAbsence[absenceTaskId] = 0;
        }

        if (attrs.fte.finGoodsAbsence[absenceTaskId] === undefined)
        {
          attrs.fte.finGoodsAbsence[absenceTaskId] = 0;
        }

        var finGoodsFte = groupData.finGoodsTasks[absenceTaskId] || 0;

        attrs.fte.totalAbsence[absenceTaskId] += finGoodsFte;
        attrs.fte.finGoodsAbsence[absenceTaskId] += finGoodsFte;
      });
    }

  });
});
