// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'highlight',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/xiconf/views/ProgramStepsView',
  'app/xiconf/templates/details'
], function(
  _,
  hljs,
  t,
  Highcharts,
  View,
  ProgramStepsView,
  detailsTemplate
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    events: {
      'click .xiconf-tabs a': function(e)
      {
        e.preventDefault();

        var tab = this.$(e.target).tab('show').parent().attr('data-tab');

        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl() + '?tab=' + tab,
          trigger: false,
          replace: true
        });
      },
      'shown.bs.tab': function(e)
      {
        var tab = e.target.parentNode.dataset.tab;

        if (tab === 'feature')
        {
          this.highlightFeature();
        }
        else if (tab === 'program')
        {
          this.renderMetrics();
        }
      }
    },

    initialize: function()
    {
      this.featureHighlighted = false;
      this.metricsChart = null;

      this.setView('.xiconf-details-steps', new ProgramStepsView({model: this.model}));
    },

    destroy: function()
    {
      if (this.metricsChart !== null)
      {
        this.metricsChart.destroy();
        this.metricsChart = null;
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        model: this.model.toJSON(),
        log: this.model.getDecoratedLog()
      };
    },

    beforeRender: function()
    {
      this.featureHighlighted = false;

      if (this.metricsChart !== null)
      {
        this.metricsChart.destroy();
        this.metricsChart = null;
      }

      this.stopListening(this.model, 'change', this.render);
    },

    afterRender: function()
    {
      this.listenTo(this.model, 'change', this.render);

      this.activateTab(this.options.tab || 'log');
    },

    activateTab: function(tab)
    {
      this.$('.nav-tabs > li[data-tab="' + tab + '"] > a').tab('show');
    },

    highlightFeature: function()
    {
      if (this.featureHighlighted)
      {
        return;
      }

      if (this.model.hasFeatureData())
      {
        hljs.highlightBlock(this.$id('feature').find('code')[0]);
      }

      this.featureHighlighted = true;
    },

    renderMetrics: function()
    {
      if (this.metricsChart !== null)
      {
        this.metricsChart.reflow();

        return;
      }

      var metrics = this.model.get('metrics') || {
          uSet: [],
          uGet: [],
          i: []
        };
      var chartData = {
        uSet: metrics.uSet,
        uGet: metrics.uGet,
        i: metrics.i,
        r: metrics.uGet.map(function(U, i)
        {
          return metrics.i[i] ? U / metrics.i[i] : 0;
        }),
        p: metrics.uGet.map(function(U, i)
        {
          return metrics.i[i] ? U * metrics.i[i] : 0;
        })
      };

      this.metricsChart = new Highcharts.Chart({
        chart: {
          renderTo: this.el.querySelector('.xiconf-details-metrics'),
          zoomType: 'x',
          height: 400
        },
        title: {
          text: t('xiconf', 'metrics:title')
        },
        noData: {},
        xAxis: {
          type: 'category'
        },
        yAxis: [
          {
            title: {
              text: t('xiconf', 'metrics:u')
            },
            tickAmount: 6
          },
          {
            title: {
              text: t('xiconf', 'metrics:i')
            },
            tickAmount: 6
          },
          {
            title: {
              text: t('xiconf', 'metrics:r')
            },
            opposite: true,
            tickAmount: 6
          },
          {
            title: {
              text: t('xiconf', 'metrics:p')
            },
            opposite: true,
            tickAmount: 6
          }
        ],
        tooltip: {
          shared: true,
          valueDecimals: 2
        },
        legend: {
          enabled: true
        },
        plotOptions: {
          line: {
            lineWidth: 1.5,
            pointInterval: 1,
            pointStart: 0,
            marker: {
              radius: 0,
              symbol: 'circle',
              lineWidth: 0,
              states: {
                hover: {
                  radius: 4
                }
              }
            }
          }
        },
        series: [
          {
            id: 'uSet',
            name: t.bound('xiconf', 'metrics:uSet'),
            type: 'line',
            yAxis: 0,
            data: chartData.uSet,
            min: 0,
            tooltip: {
              valueSuffix: 'V'
            },
            zIndex: 1
          },
          {
            id: 'uGet',
            name: t.bound('xiconf', 'metrics:uGet'),
            type: 'line',
            yAxis: 0,
            data: chartData.uGet,
            min: 0,
            tooltip: {
              valueSuffix: 'V'
            },
            zIndex: 2
          },
          {
            id: 'i',
            name: t.bound('xiconf', 'metrics:i'),
            type: 'line',
            yAxis: 1,
            data: chartData.i,
            min: 0,
            tooltip: {
              valueSuffix: 'A'
            },
            zIndex: 3
          },
          {
            id: 'r',
            name: t.bound('xiconf', 'metrics:r'),
            type: 'line',
            yAxis: 2,
            data: chartData.r,
            min: 0,
            tooltip: {
              valueSuffix: 'Ω'
            },
            zIndex: 4
          },
          {
            id: 'p',
            name: t.bound('xiconf', 'metrics:p'),
            type: 'line',
            yAxis: 3,
            data: chartData.p,
            min: 0,
            tooltip: {
              valueSuffix: 'W'
            },
            zIndex: 5
          }
        ]
      });
    }

  });
});
