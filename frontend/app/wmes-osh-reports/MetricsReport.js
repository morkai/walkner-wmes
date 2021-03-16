// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'h5.rql/index',
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/core/templates/userInfo',
  'app/data/colorFactory',
  'app/wmes-osh-common/dictionaries',
  './util/createDefaultFilter'
], function(
  _,
  rql,
  t,
  time,
  Model,
  userInfoTemplate,
  colorFactory,
  dictionaries,
  createDefaultFilter
) {
  'use strict';

  return Model.extend({

    urlRoot: `/osh/reports/metrics`,

    nlsDomain: 'wmes-osh-reports',

    defaults: function()
    {
      return {};
    },

    initialize: function(attrs, options)
    {
      this.rqlQuery = options.rqlQuery && !options.rqlQuery.isEmpty() ? options.rqlQuery : createDefaultFilter({
        orgUnitProperty: null,
        dateProperty: 'month'
      });
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = this.rqlQuery.toString();

      return Model.prototype.fetch.call(this, options);
    },

    genClientUrl: function()
    {
      return `/osh/reports/metrics?${this.rqlQuery.toString()}`;
    },

    parse: function(report)
    {
      const attrs = {
        interval: report.options.interval
      };

      this.parseYearlyAccidents(attrs, report);
      this.parseTrc(attrs, report);
      this.parseIpr(attrs, report);
      this.parseIpp(attrs, report);
      this.parseObsPlan(attrs, report);
      this.parseContact(attrs, report);
      this.parseRiskyObs(attrs, report);
      this.parseObservers(attrs, report);

      return attrs;
    },

    parseYearlyAccidents: function(attrs, report)
    {
      attrs.yearlyAccidents = {
        categories: [],
        series: [{
          id: 'total',
          name: t(this.nlsDomain, 'metrics:yearlyAccidents:total'),
          data: []
        }]
      };

      if (report.options.orgUnitId)
      {
        attrs.yearlyAccidents.series.push({
          id: 'orgUnit',
          name: dictionaries.getLabel(report.options.orgUnitType, report.options.orgUnitId),
          data: []
        });
      }

      report.yearlyAccidents.forEach(d =>
      {
        attrs.yearlyAccidents.categories.push(d.year);
        attrs.yearlyAccidents.series[0].data.push(d.total);

        if (report.options.orgUnitId)
        {
          attrs.yearlyAccidents.series[1].data.push(d.orgUnit);
        }
      });
    },

    parseTrc: function(attrs, report)
    {
      attrs.trc = {
        months: [],
        fte: [],
        series: {
          itm: {
            name: t(this.nlsDomain, 'metrics:trc:itm'),
            data: [],
            type: 'column',
            color: '#d9534f',
            tooltip: {
              valueDecimals: 0
            },
            zIndex: 1
          },
          target: {
            name: t(this.nlsDomain, 'metrics:trc:target'),
            data: [],
            color: '#ec971f',
            yAxis: 1,
            marker: {
              enabled: false
            },
            zIndex: 2
          },
          mat: {
            name: t(this.nlsDomain, 'metrics:trc:mat'),
            data: [],
            color: '#5cb85c',
            yAxis: 1,
            zIndex: 3
          }
        }
      };

      report.groups.forEach(g =>
      {
        attrs.trc.months.push(g.key);
        attrs.trc.fte.push(g.fte.itm);
        attrs.trc.series.itm.data.push({x: g.key, y: g.trc.itm});
        attrs.trc.series.target.data.push({x: g.key, y: g.trc.target});
        attrs.trc.series.mat.data.push({x: g.key, y: g.trc.mat});
      });

      attrs.trc.series.target.marker.enabled = attrs.trc.months.length === 1;
    },

    parseIpr: function(attrs, report)
    {
      attrs.ipr = {
        months: [],
        fte: [],
        nearMisses: [],
        kaizens: [],
        actions: [],
        observations: [],
        series: {
          target: {
            name: t(this.nlsDomain, 'metrics:ipr:target'),
            data: [],
            color: '#ec971f',
            marker: {
              enabled: false
            },
            zIndex: 2
          },
          itm: {
            name: t(this.nlsDomain, 'metrics:ipr:itm'),
            data: [],
            type: 'column',
            color: '#31b0d5',
            zIndex: 1
          },
          mat: {
            name: t(this.nlsDomain, 'metrics:ipr:mat'),
            data: [],
            color: '#5cb85c',
            zIndex: 3
          }
        }
      };

      report.groups.forEach(g =>
      {
        attrs.ipr.months.push(g.key);
        attrs.ipr.fte.push(g.fte.itm);
        attrs.ipr.nearMisses.push(g.nearMissCount);
        attrs.ipr.kaizens.push(g.kaizenCount);
        attrs.ipr.actions.push(g.actionCount);
        attrs.ipr.observations.push(g.obs.cards);
        attrs.ipr.series.target.data.push({x: g.key, y: g.ipr.target});
        attrs.ipr.series.itm.data.push({x: g.key, y: g.ipr.itm});
        attrs.ipr.series.mat.data.push({x: g.key, y: g.ipr.mat});
      });

      attrs.ipr.series.target.marker.enabled = attrs.ipr.months.length === 1;
    },

    parseIpp: function(attrs, report)
    {
      attrs.ipp = {
        months: [],
        totalFte: [],
        activeFte: [],
        totalObservers: [],
        activeObservers: [],
        series: {
          observers: {
            name: t(this.nlsDomain, 'metrics:ipp:observers'),
            data: [],
            type: 'column',
            color: '#31b0d5'
          },
          observersTarget: {
            name: t(this.nlsDomain, 'metrics:ipp:observersTarget'),
            data: [],
            color: '#31b0d5',
            marker: {
              enabled: false
            },
            zIndex: 1
          },
          itm: {
            name: t(this.nlsDomain, 'metrics:ipp:itm'),
            data: [],
            type: 'column',
            color: '#5cb85c'
          },
          target: {
            name: t(this.nlsDomain, 'metrics:ipp:target'),
            data: [],
            color: '#5cb85c',
            marker: {
              enabled: false
            },
            zIndex: 1
          }
        }
      };

      report.groups.forEach(g =>
      {
        attrs.ipp.months.push(g.key);
        attrs.ipp.totalFte.push(g.fte.itm);
        attrs.ipp.activeFte.push(g.userCount);
        attrs.ipp.totalObservers.push(g.fte.observers);
        attrs.ipp.activeObservers.push(g.obs.observerCount);
        attrs.ipp.series.itm.data.push({x: g.key, y: g.ipp.itm});
        attrs.ipp.series.target.data.push({x: g.key, y: g.ipp.target});
        attrs.ipp.series.observers.data.push({x: g.key, y: g.ipp.observers});
        attrs.ipp.series.observersTarget.data.push({x: g.key, y: g.ipp.observersTarget});
      });

      attrs.ipp.series.target.marker.enabled = attrs.ipp.months.length === 1;
      attrs.ipp.series.observersTarget.marker.enabled = attrs.ipp.months.length === 1;
    },

    parseObsPlan: function(attrs, report)
    {
      attrs.obsPlan = {
        months: [],
        series: {
          plan: {
            name: t(this.nlsDomain, 'metrics:obsPlan:plan'),
            data: [],
            type: 'column',
            color: '#ec971f',
            tooltip: {
              valueDecimals: 0
            }
          },
          done: {
            name: t(this.nlsDomain, 'metrics:obsPlan:done'),
            data: [],
            type: 'column',
            color: '#d9534f',
            tooltip: {
              valueDecimals: 0
            }
          },
          percent: {
            name: t(this.nlsDomain, 'metrics:obsPlan:percent'),
            data: [],
            color: '#31b0d5',
            yAxis: 1,
            tooltip: {
              valueDecimals: 1,
              valueSuffix: '%'
            }
          }
        }
      };

      report.groups.forEach(g =>
      {
        attrs.obsPlan.months.push(g.key);
        attrs.obsPlan.series.plan.data.push({x: g.key, y: g.obs.plan});
        attrs.obsPlan.series.done.data.push({
          x: g.key,
          y: g.obs.cards,
          color: g.obs.cards >= g.obs.plan ? '#5cb85c' : '#d9534f'
        });
        attrs.obsPlan.series.percent.data.push({x: g.key, y: g.obs.cardsPercent});
      });
    },

    parseContact: function(attrs, report)
    {
      attrs.contact = {
        months: [],
        fte: [],
        cards: [],
        series: {
          itm: {
            name: t(this.nlsDomain, 'metrics:contact:itm'),
            data: [],
            type: 'column',
            color: '#31b0d5',
            tooltip: {
              valueDecimals: 3
            }
          },
          trend: {
            name: t(this.nlsDomain, 'metrics:contact:trend'),
            data: [],
            color: '#2f7ed8',
            tooltip: {
              valueDecimals: 3
            },
            marker: {
              enabled: false
            },
            states: {
              hover: {
                lineWidth: 0
              }
            },
            enableMouseTracking: false
          },
          target: {
            name: t(this.nlsDomain, 'metrics:contact:target'),
            data: [],
            color: '#ec971f',
            tooltip: {
              valueDecimals: 3
            },
            marker: {
              enabled: false
            }
          }
        }
      };

      if (report.groups.length > 1)
      {
        const first = report.groups[0];
        const last = report.groups[report.groups.length - 1];

        attrs.contact.series.trend.data.push(
          {x: first.key, y: first.contact.itm},
          {x: last.key, y: last.contact.itm}
        );
      }

      report.groups.forEach(g =>
      {
        attrs.contact.months.push(g.key);
        attrs.contact.fte.push(g.fte.itm);
        attrs.contact.cards.push(g.obs.cards);
        attrs.contact.series.itm.data.push({
          x: g.key,
          y: g.contact.itm,
          color: g.contact.itm >= g.contact.target ? '#5cb85c' : '#d9534f'
        });
        attrs.contact.series.target.data.push({x: g.key, y: g.contact.target});
      });

      attrs.contact.series.target.marker.enabled = attrs.contact.months.length === 1;
    },

    parseRiskyObs: function(attrs, report)
    {
      attrs.riskyObs = {
        months: [],
        fte: [],
        cards: [],
        behaviors: [],
        workConditions: [],
        risky: [],
        series: {
          itm: {
            name: t(this.nlsDomain, 'metrics:riskyObs:itm'),
            data: [],
            type: 'column',
            color: '#31b0d5',
            tooltip: {
              valueDecimals: 1,
              valueSuffix: '%'
            }
          },
          min: {
            name: t(this.nlsDomain, 'metrics:riskyObs:min'),
            data: [],
            color: '#ec971f',
            tooltip: {
              valueDecimals: 0,
              valueSuffix: '%'
            },
            marker: {
              enabled: false
            }
          },
          max: {
            name: t(this.nlsDomain, 'metrics:riskyObs:max'),
            data: [],
            color: '#ec971f',
            tooltip: {
              valueDecimals: 0,
              valueSuffix: '%'
            },
            marker: {
              enabled: false
            }
          }
        }
      };

      report.groups.forEach(g =>
      {
        attrs.riskyObs.months.push(g.key);
        attrs.riskyObs.cards.push(g.obs.cards);
        attrs.riskyObs.behaviors.push(g.obs.behaviors);
        attrs.riskyObs.workConditions.push(g.obs.workConditions);
        attrs.riskyObs.risky.push(g.obs.risky);
        attrs.riskyObs.series.itm.data.push({
          x: g.key,
          y: g.obs.riskyPercent,
          color: g.obs.riskyPercent >= g.obs.minRisky && g.obs.riskyPercent <= g.obs.maxRisky ? '#5cb85c' : '#d9534f'
        });
        attrs.riskyObs.series.min.data.push({x: g.key, y: g.obs.minRisky});
        attrs.riskyObs.series.max.data.push({x: g.key, y: g.obs.maxRisky});
      });

      attrs.riskyObs.series.min.marker.enabled = attrs.riskyObs.months.length === 1;
      attrs.riskyObs.series.max.marker.enabled = attrs.riskyObs.months.length === 1;
    },

    parseObservers: function(attrs, report)
    {
      attrs.observers = {
        users: [],
        categories: [],
        series: {
          count: {
            name: t(this.nlsDomain, 'metrics:observers:count'),
            data: [],
            type: 'column',
            color: '#31b0d5'
          },
          target: {
            name: t(this.nlsDomain, 'metrics:observers:target'),
            data: [],
            color: '#ec971f',
            marker: {
              enabled: false
            }
          }
        }
      };

      if (!report.groups.length)
      {
        return;
      }

      const g = report.groups[report.groups.length - 1];

      Object.keys(g.obs.observers).forEach(userId =>
      {
        attrs.observers.users.push({
          label: report.users[userId],
          userInfo: userInfoTemplate({id: userId, label: report.users[userId]}),
          count: g.obs.observers[userId]
        });
      });

      attrs.observers.users.sort((a, b) =>
      {
        let cmp = a.count - b.count;

        if (!cmp)
        {
          cmp = a.label.localeCompare(b.label);
        }

        return cmp;
      });

      attrs.observers.users.forEach(user =>
      {
        attrs.observers.categories.push(user.label);
        attrs.observers.series.count.data.push({
          y: user.count,
          color: user.count >= g.obs.minCardsPerObservers ? '#5cb85c' : '#d9534f'
        });
        attrs.observers.series.target.data.push(g.obs.minCardsPerObservers);
      });

      attrs.observers.series.target.marker.enabled = attrs.observers.categories.length === 1;
    }

  });
});
