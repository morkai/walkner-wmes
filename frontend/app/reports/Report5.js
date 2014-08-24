// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
        dirIndir: [],
        maxDirIndir: 0,
        byCompanyAndProdFunction: {}
      };
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
        this.query.serializeToObject(this.get('orgUnitType'), this.get('orgUnit'))
      );

      return Model.prototype.fetch.call(this, options);
    },

    parse: function(report)
    {
      /*jshint maxdepth:999*/

      var attributes = {
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
        dirIndir: [],
        maxDirIndir: 0,
        byCompanyAndProdFunction: {}
      };

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
        }

        var dayCount = report.days[x] || 1;

        if (dayCount > 1)
        {
          total /= dayCount;
          direct /= dayCount;
          indirect /= dayCount;
        }

        totalDayCount += dayCount;

        var indirectDirect = direct ? (indirect / direct) * 100 : 0;

        totals.quantityDone.push({x: x, y: quantityDone});
        totals.total.push({x: x, y: total});
        totals.direct.push({x: x, y: direct});
        totals.indirect.push({x: x, y: indirect});
        attributes.dirIndir.push({x: x, y: indirectDirect});

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
    }

  });
});
