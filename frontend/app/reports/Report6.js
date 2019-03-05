// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../core/Model'
], function(
  _,
  t,
  Model
) {
  'use strict';

  function round(num)
  {
    return isNaN(num) || !isFinite(num) ? 0 : (Math.round(num * 100) / 100);
  }

  return Model.extend({

    urlRoot: '/reports/6',

    initialize: function(data, options)
    {
      if (!options.query)
      {
        throw new Error('query option is required!');
      }

      this.query = options.query;
    },

    getCategoryData: function(type)
    {
      return this.attributes.category && this.attributes.category[type] ? this.attributes.category[type] : [];
    },

    getEffAndFteData: function(type)
    {
      var effAndFte = this.attributes.effAndFte && this.attributes.effAndFte[type]
        ? this.attributes.effAndFte[type]
        : null;

      return {
        fte: effAndFte ? effAndFte.fte : [],
        eff: effAndFte ? effAndFte.eff : []
      };
    },

    getTotalAndAbsenceData: function(type)
    {
      var totalAndAbsence = this.attributes.totalAndAbsence && this.attributes.totalAndAbsence[type]
        ? this.attributes.totalAndAbsence[type]
        : null;

      return {
        fte: totalAndAbsence ? totalAndAbsence.fte : [],
        absence: totalAndAbsence ? totalAndAbsence.absence : []
      };
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.assign(
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
          exTransactions: {fte: [], eff: []},
          inTransactions: {fte: [], eff: []}
        },
        category: {
          coopComp: [],
          exStorage: [],
          exTransactions: [],
          inTransactions: [],
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

      var interval = this.query.get('interval');
      var divideFte = interval !== 'day' && interval !== 'shift';

      for (var i = 0, l = report.data.length; i < l; ++i)
      {
        var groupData = report.data[i];
        var fteDivisor = divideFte && groupData.dayCount ? groupData.dayCount : 1;

        if (groupData.compTasks === undefined)
        {
          this.prepareEmptyGroupData(groupData);
        }

        this.calcNormalTaskFte(attrs, groupData, fteDivisor);
        this.calcExTransactions(attrs, groupData, fteDivisor);
        this.calcInTransactions(attrs, groupData, fteDivisor);
        this.calcFifo(attrs, groupData, fifoTasks, fteDivisor);
        this.calcEffAndFte(attrs, groupData, 'staging', fteDivisor);
        this.calcEffAndFte(attrs, groupData, 'sm', fteDivisor, true);
        this.calcEffAndFte(attrs, groupData, 'paint', fteDivisor);
        this.calcEffAndFte(attrs, groupData, 'fixBin', fteDivisor);
        this.calcEffAndFte(attrs, groupData, 'finGoodsIn', fteDivisor);
        this.calcEffAndFte(attrs, groupData, 'finGoodsOut', fteDivisor);
        this.calcAbsence(attrs, groupData, compAbsenceTasks, finGoodsAbsenceTasks, fteDivisor);
      }

      attrs.category.coopComp.push(
        this.createCategoryPoint('coopComp541', attrs.count.coopComp541),
        this.createCategoryPoint('coopCompProcessing', attrs.count.coopCompProcessing)
      );

      attrs.category.exStorage.push(
        this.createCategoryPoint('exStorageIn', attrs.count.exStorageIn),
        this.createCategoryPoint('exStorageOut', attrs.count.exStorageOut)
      );

      attrs.category.exTransactions.push(
        this.createCategoryPoint('inComp', attrs.count.inComp),
        this.createCategoryPoint('coopComp', attrs.count.coopComp541 + attrs.count.coopCompProcessing),
        this.createCategoryPoint('exStorage', attrs.count.exStorageIn + attrs.count.exStorageOut)
      );

      attrs.category.inTransactions.push(
        this.createCategoryPoint('staging', attrs.count.staging),
        this.createCategoryPoint('fifo', attrs.count.fifo),
        this.createCategoryPoint('paint', attrs.count.paint),
        this.createCategoryPoint('fixBin', attrs.count.fixBin)
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
      return _.assign(groupData, {
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

    calcNormalTaskFte: function(attrs, groupData, fteDivisor)
    {
      _.forEach(groupData.compTasks, function(fte, taskId)
      {
        fte /= fteDivisor;
        taskId = 'comp-' + taskId;

        if (attrs.fte[taskId] === undefined)
        {
          attrs.fte[taskId] = 0;
          attrs.effAndFte[taskId] = {eff: [], fte: []};
        }

        attrs.fte[taskId] += fte;

        attrs.effAndFte[taskId].fte.push({x: groupData.key, y: round(fte)});
      });

      _.forEach(groupData.finGoodsTasks, function(fte, taskId)
      {
        fte /= fteDivisor;
        taskId = 'finGoods-' + taskId;

        if (attrs.fte[taskId] === undefined)
        {
          attrs.fte[taskId] = 0;
          attrs.effAndFte[taskId] = {eff: [], fte: []};
        }

        attrs.fte[taskId] += fte;

        attrs.effAndFte[taskId].fte.push({x: groupData.key, y: round(fte)});
      });
    },

    calcExTransactions: function(attrs, groupData, fteDivisor)
    {
      var key = groupData.key;

      attrs.effAndFte.inComp.eff.push({x: key, y: round(groupData.inCompCount / groupData.inCompFte)});
      attrs.effAndFte.inComp.fte.push({x: key, y: groupData.inCompFte / fteDivisor});
      attrs.count.inComp += groupData.inCompCount;

      var coopCompProcessingCount = groupData.coopComp344Count + groupData.coopComp343Count;
      var coopCompCount = groupData.coopComp541Count + coopCompProcessingCount;

      attrs.effAndFte.coopComp.eff.push({x: key, y: round(coopCompCount / groupData.coopCompFte)});
      attrs.effAndFte.coopComp.fte.push({x: key, y: groupData.coopCompFte / fteDivisor});
      attrs.count.coopComp541 += groupData.coopComp541Count;
      attrs.count.coopCompProcessing += coopCompProcessingCount;

      var exStorageCount = groupData.exStorageInCount + groupData.exStorageOutCount;

      attrs.effAndFte.exStorage.eff.push({x: key, y: round(exStorageCount / groupData.exStorageFte)});
      attrs.effAndFte.exStorage.fte.push({x: key, y: groupData.exStorageFte / fteDivisor});
      attrs.count.exStorageIn += groupData.exStorageInCount;
      attrs.count.exStorageOut += groupData.exStorageOutCount;

      var exTransactionsCount = groupData.inCompCount + coopCompCount + exStorageCount;
      var exTransactionsFte = groupData.inCompFte + groupData.coopCompFte + groupData.exStorageFte;

      attrs.effAndFte.exTransactions.eff.push({x: key, y: round(exTransactionsCount / exTransactionsFte)});
      attrs.effAndFte.exTransactions.fte.push({x: key, y: exTransactionsFte / fteDivisor});
    },

    calcInTransactions: function(attrs, groupData, fteDivisor)
    {
      attrs.count.staging += groupData.stagingCount;
      attrs.count.fifo += groupData.fifoCount;
      attrs.count.paint += groupData.paintCount;
      attrs.count.fixBin += groupData.fixBinCount;

      var toCount = groupData.stagingCount + groupData.fifoCount + groupData.paintCount + groupData.fixBinCount;
      var toFte = groupData.stagingFte + groupData.fifoFte + groupData.paintFte + groupData.fixBinFte;
      var totalFte = toFte;

      attrs.effAndFte.inTransactions.eff.push({x: groupData.key, y: round(toCount / toFte)});
      attrs.effAndFte.inTransactions.fte.push({x: groupData.key, y: totalFte / fteDivisor});
    },

    calcEffAndFte: function(attrs, groupData, metric, fteDivisor, noEff)
    {
      if (attrs.effAndFte[metric] === undefined)
      {
        attrs.effAndFte[metric] = {fte: [], eff: []};
      }

      var count = groupData[metric + 'Count'];
      var fte = groupData[metric + 'Fte'];

      if (!noEff)
      {
        attrs.effAndFte[metric].eff.push({x: groupData.key, y: round(count / fte)});
      }

      attrs.effAndFte[metric].fte.push({x: groupData.key, y: fte / fteDivisor});
    },

    calcFifo: function(attrs, groupData, fifoTasks, fteDivisor)
    {
      this.calcEffAndFte(attrs, groupData, 'fifo', fteDivisor);

      _.forEach(fifoTasks, function(fifoTaskId)
      {
        var fte = groupData.compTasks[fifoTaskId];

        if (fte == null)
        {
          return;
        }

        if (attrs.fte.fifo[fifoTaskId] == null)
        {
          attrs.fte.fifo[fifoTaskId] = fte / fteDivisor;
        }
        else
        {
          attrs.fte.fifo[fifoTaskId] += fte / fteDivisor;
        }
      });
    },

    calcAbsence: function(attrs, groupData, compAbsenceTasks, finGoodsAbsenceTasks, fteDivisor)
    {
      var totalFte = groupData.compTotalFte + groupData.finGoodsTotalFte;
      var totalAbsenceFte = groupData.compAbsenceFte + groupData.finGoodsAbsenceFte;

      attrs.totalAndAbsence.total.fte.push({
        x: groupData.key,
        y: totalFte / fteDivisor
      });
      attrs.totalAndAbsence.total.absence.push({
        x: groupData.key,
        y: round(totalAbsenceFte * 100 / totalFte)
      });
      attrs.totalAndAbsence.comp.fte.push({
        x: groupData.key,
        y: groupData.compTotalFte / fteDivisor
      });
      attrs.totalAndAbsence.comp.absence.push({
        x: groupData.key,
        y: round(groupData.compAbsenceFte * 100 / groupData.compTotalFte)
      });
      attrs.totalAndAbsence.finGoods.fte.push({
        x: groupData.key,
        y: groupData.finGoodsTotalFte / fteDivisor
      });
      attrs.totalAndAbsence.finGoods.absence.push({
        x: groupData.key,
        y: round(groupData.finGoodsAbsenceFte * 100 / groupData.finGoodsTotalFte)
      });

      _.forEach(compAbsenceTasks, function(absenceTaskId)
      {
        if (attrs.fte.totalAbsence[absenceTaskId] === undefined)
        {
          attrs.fte.totalAbsence[absenceTaskId] = 0;
        }

        if (attrs.fte.compAbsence[absenceTaskId] === undefined)
        {
          attrs.fte.compAbsence[absenceTaskId] = 0;
        }

        var compFte = groupData.compTasks[absenceTaskId] || 0;

        attrs.fte.totalAbsence[absenceTaskId] += compFte / fteDivisor;
        attrs.fte.compAbsence[absenceTaskId] += compFte / fteDivisor;
      });

      _.forEach(finGoodsAbsenceTasks, function(absenceTaskId)
      {
        if (attrs.fte.totalAbsence[absenceTaskId] === undefined)
        {
          attrs.fte.totalAbsence[absenceTaskId] = 0;
        }

        if (attrs.fte.finGoodsAbsence[absenceTaskId] === undefined)
        {
          attrs.fte.finGoodsAbsence[absenceTaskId] = 0;
        }

        var finGoodsFte = groupData.finGoodsTasks[absenceTaskId] || 0;

        attrs.fte.totalAbsence[absenceTaskId] += finGoodsFte / fteDivisor;
        attrs.fte.finGoodsAbsence[absenceTaskId] += finGoodsFte / fteDivisor;
      });
    }

  });
});
