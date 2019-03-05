// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../data/companies',
  '../data/prodFunctions',
  '../core/Model'
], function(
  _,
  companies,
  prodFunctions,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/reports/5',

    defaults: function()
    {
      return {
        orgUnitType: null,
        orgUnit: null,
        prodTasks: {},
        totals: {
          quantityDone: [],
          total: [],
          direct: [],
          indirect: [],
          byCompany: {}
        },
        maxTotals: {
          quantityDone: 0,
          total: 0,
          direct: 0,
          indirect: 0
        },
        directByCompany: {},
        indirectBycompany: {},
        indirDir: [],
        maxDirIndir: 0,
        byCompanyAndProdFunction: {},
        dirIndir: {
          quantityDone: 0,
          efficiencyNum: 0,
          laborSetupTime: 0,
          productivity: 0,
          productivityNoWh: 0,
          direct: 0,
          indirect: 0,
          indirectProdFlow: 0,
          directByProdFunction: {},
          indirectByProdFunction: {},
          production: 0,
          storage: 0,
          storageByProdTasks: {}
        },
        effIneff: {
          value: 0,
          efficiency: 0,
          dirIndir: 0,
          prodFlow: 0,
          prodTasks: {}
        },
        attendance: {}
      };
    },

    initialize: function(data, options)
    {
      if (!options.query)
      {
        throw new Error('query option is required!');
      }

      this.query = options.query;
    },

    getDirectRef: function(coeff)
    {
      if (!coeff)
      {
        return null;
      }

      var dirIndir = this.get('dirIndir');

      return (dirIndir.efficiencyNum * coeff + dirIndir.laborSetupTime) || null;
    },

    getIndirectRef: function(absenceProdTaskId, coeff)
    {
      if (!absenceProdTaskId || !coeff)
      {
        return null;
      }

      var totalProductionCount = this.get('dirIndir').production;
      var productionByProdTasks = this.get('effIneff').prodTasks;
      var absenceCount = productionByProdTasks[absenceProdTaskId] || 0;

      return ((totalProductionCount - absenceCount) * coeff) || null;
    },

    getWarehouseRef: function(coeff)
    {
      if (!coeff)
      {
        return null;
      }

      var directCount = this.get('dirIndir').direct;

      return (directCount * coeff) || null;
    },

    getDirIndirRef: function(coeff)
    {
      if (!coeff)
      {
        return null;
      }

      var effIneff = this.get('effIneff');

      return (effIneff.prodFlow * coeff) || null;
    },

    getAbsenceRef: function(coeff)
    {
      if (!coeff)
      {
        return null;
      }

      var dirIndir = this.get('dirIndir');

      return ((dirIndir.production + dirIndir.storage) * coeff) || null;
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = _.assign(
        options.data || {},
        this.query.serializeToObject(this.get('orgUnitType'), this.get('orgUnit'))
      );

      return Model.prototype.fetch.call(this, options);
    },

    parse: function(report)
    {
      var attributes = {
        prodTasks: report.options.prodTasks,
        raw: report.data,
        totals: {
          quantityDone: [],
          total: [],
          direct: [],
          indirect: [],
          byCompany: {}
        },
        maxTotals: {
          quantityDone: 0,
          total: 0,
          direct: 0,
          indirect: 0
        },
        directByCompany: {},
        indirectByCompany: {},
        indirDir: [],
        maxDirIndir: 0,
        byCompanyAndProdFunction: {},
        dirIndir: null,
        effIneff: null,
        totalAttendance: report.attendance,
        attendance: []
      };

      this.parseDirIndir(report.dirIndir, attributes);
      this.parseEffIneff(report.effIneff, attributes);

      var totals = attributes.totals;
      var maxTotals = attributes.maxTotals;
      var companyIds = companies.map(function(company)
      {
        totals.byCompany[company.id] = [];
        attributes.directByCompany[company.id] = [];
        attributes.indirectByCompany[company.id] = [];
        attributes.byCompanyAndProdFunction[company.id] = {};

        return company.id;
      });
      var companyCount = companyIds.length;
      var prodFunctionIds = prodFunctions.map(function(prodFunction)
      {
        companyIds.forEach(function(companyId)
        {
          attributes.byCompanyAndProdFunction[companyId][prodFunction.id] = 0;
        });

        return prodFunction.id;
      });
      var prodFunctionCount = prodFunctionIds.length;
      var companyId;
      var totalDayCount = 0;
      var emptyAttendance = {};

      companyIds.forEach(function(companyId)
      {
        if (report.attendance[companyId])
        {
          emptyAttendance[companyId] = {
            demand: 0,
            supply: 0,
            shortage: 0,
            absence: 0
          };
        }
      });

      for (var i = 0, l = report.data.length; i < l; ++i)
      {
        var dataEntry = report.data[i];
        var quantityDone = 0;
        var total = 0;
        var direct = 0;
        var indirect = 0;
        var byCompany = {};
        var directByCompany = {};
        var indirectByCompany = {};
        var attendance = emptyAttendance;
        var x;

        if (typeof dataEntry === 'number')
        {
          x = dataEntry;
        }
        else
        {
          var dirIndirByProdFunction = dataEntry.dni;

          for (var ii = 0; ii < prodFunctionCount; ++ii)
          {
            var prodFunctionId = prodFunctionIds[ii];
            var dirIndirByCompany = dirIndirByProdFunction[prodFunctionId];

            if (dirIndirByCompany === undefined)
            {
              continue;
            }

            for (var iii = 0; iii < companyCount; ++iii)
            {
              companyId = companyIds[iii];

              var dirIndir = dirIndirByCompany[companyId];

              if (dirIndir === undefined)
              {
                continue;
              }

              var directCount = dirIndir[0];
              var indirectCount = dirIndir[1];
              var totalCount = directCount + indirectCount;

              total += totalCount;
              direct += directCount;
              indirect += indirectCount;

              if (byCompany[companyId] === undefined)
              {
                byCompany[companyId] = totalCount;
                directByCompany[companyId] = directCount;
                indirectByCompany[companyId] = indirectCount;
              }
              else
              {
                byCompany[companyId] += totalCount;
                directByCompany[companyId] += directCount;
                indirectByCompany[companyId] += indirectCount;
              }

              attributes.byCompanyAndProdFunction[companyId][prodFunctionId] += totalCount;
            }
          }

          quantityDone = dataEntry.qty;
          x = dataEntry.key;
          attendance = dataEntry.attendance;
        }

        var dayCount = report.days[x] || 1;

        if (dayCount > 1)
        {
          total /= dayCount;
          direct /= dayCount;
          indirect /= dayCount;
        }

        totalDayCount += dayCount;

        var indirectDirect = total ? (indirect / total) * 100 : 0;

        totals.quantityDone.push({x: x, y: quantityDone});
        totals.total.push({x: x, y: total});
        totals.direct.push({x: x, y: direct});
        totals.indirect.push({x: x, y: indirect});
        attributes.indirDir.push({x: x, y: indirectDirect});
        attributes.attendance.push({x: x, y: attendance});

        for (var j = 0; j < companyCount; ++j)
        {
          companyId = companyIds[j];

          totals.byCompany[companyId].push({x: x, y: (byCompany[companyId] || 0) / dayCount});
          attributes.directByCompany[companyId].push({x: x, y: (directByCompany[companyId] || 0) / dayCount});
          attributes.indirectByCompany[companyId].push({x: x, y: (indirectByCompany[companyId] || 0) / dayCount});
        }

        if (quantityDone > maxTotals.quantityDone)
        {
          maxTotals.quantityDone = quantityDone;
        }

        if (total > maxTotals.total)
        {
          maxTotals.total = total;
        }

        if (direct > maxTotals.direct)
        {
          maxTotals.direct = direct;
        }

        if (indirect > maxTotals.indirect)
        {
          maxTotals.indirect = indirect;
        }

        if (indirectDirect > attributes.maxDirIndir)
        {
          attributes.maxDirIndir = indirectDirect;
        }
      }

      if (totalDayCount > 1)
      {
        companyIds.forEach(function(companyId)
        {
          prodFunctionIds.forEach(function(prodFunctionId)
          {
            attributes.byCompanyAndProdFunction[companyId][prodFunctionId] /= totalDayCount;
          });
        });
      }

      return attributes;
    },

    parseDirIndir: function(dirIndir, attributes)
    {
      dirIndir.productivity = Math.round(dirIndir.productivity * 100);
      dirIndir.productivityNoWh = Math.round(dirIndir.productivityNoWh * 100);
      dirIndir.direct = Math.round(dirIndir.direct * 10) / 10;
      dirIndir.indirect = Math.round(dirIndir.indirect * 10) / 10;

      attributes.dirIndir = dirIndir;
    },

    parseEffIneff: function(effIneff, attributes)
    {
      effIneff.value = Math.round(effIneff.value * 10) / 10;
      effIneff.dirIndir = Math.round(effIneff.dirIndir * 10) / 10;

      Object.keys(effIneff.prodTasks).forEach(function(taskId)
      {
        effIneff.prodTasks[taskId] = Math.round(effIneff.prodTasks[taskId] * 10) / 10;
      });

      attributes.effIneff = effIneff;
    },

    getMaxEffIneffProdTaskFte: function(visibleProdTasks)
    {
      var prodTasksFte = this.get('effIneff').prodTasks;
      var maxFte = 0;

      Object.keys(prodTasksFte).forEach(function(prodTaskId)
      {
        var fte = prodTasksFte[prodTaskId];

        if (fte > maxFte && visibleProdTasks[prodTaskId])
        {
          maxFte = fte;
        }
      });

      return maxFte;
    },

    getMaxCompanyFte: function(visibleCompanies, byCompany)
    {
      var maxFte = 0;

      Object.keys(byCompany).forEach(function(companyId)
      {
        var companyFte = byCompany[companyId];

        if (visibleCompanies[companyId] && companyFte > maxFte)
        {
          maxFte = companyFte;
        }
      });

      return maxFte;
    },

    getMaxTotalCompanyFte: function(visibleCompanies)
    {
      return this.getMaxCompanyFte(visibleCompanies, this.get('totals').byCompany);
    },

    getMaxDirectCompanyFte: function(visibleCompanies)
    {
      return this.getMaxCompanyFte(visibleCompanies, this.get('directByCompany'));
    },

    getMaxIndirectCompanyFte: function(visibleCompanies)
    {
      return this.getMaxCompanyFte(visibleCompanies, this.get('indirectByCompany'));
    },

    getMaxFteByCompanyAndProdFunction: function(visibleCompanies, visibleProdFunctions)
    {
      var maxFte = 0;
      var byCompanyAndProdFunction = this.get('byCompanyAndProdFunction');

      Object.keys(byCompanyAndProdFunction).forEach(function(companyId)
      {
        if (!visibleCompanies[companyId])
        {
          return;
        }

        var byProdFunction = byCompanyAndProdFunction[companyId];

        Object.keys(byProdFunction).forEach(function(prodFunctionId)
        {
          var fte = byProdFunction[prodFunctionId];

          if (visibleProdFunctions[prodFunctionId] && fte > maxFte)
          {
            maxFte = fte;
          }
        });
      });

      return maxFte;
    },

    getMaxAttendance: function(visibleCompanies)
    {
      var max = 0;

      _.forEach(this.get('attendance'), function(attendance, companyId)
      {
        if (!visibleCompanies[companyId])
        {
          return;
        }

        max = Math.max(
          max,
          attendance.demand,
          attendance.absence
        );
      });

      return max;
    }

  });
});
