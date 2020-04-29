// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/highcharts',
  'app/core/View',
  'app/core/util/median',
  'app/prodShiftOrders/templates/serialNumbers'
], function(
  time,
  Highcharts,
  View,
  median,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    remoteTopics: {},

    destroy: function()
    {
      if (this.chart)
      {
        this.chart.destroy();
        this.chart = null;
      }
    },

    getTemplateData: function()
    {
      return {
        prodShiftOrderId: this.model.id,
        serialNumbers: this.collection.toJSON()
      };
    },

    afterRender: function()
    {
      if (this.collection.length)
      {
        this.renderChart();
      }
    },

    renderChart: function()
    {
      var view = this;
      var categories = [];
      var actual = [];
      var target = [];
      var tgt = view.collection.at(0).get('sapTaktTime');
      var maxY = tgt * 2;
      var avg = view.model.getActualTaktTime();
      var min = Number.MAX_SAFE_INTEGER;
      var max = Number.MIN_SAFE_INTEGER;
      var med = [];

      view.collection.forEach(function(sn, i)
      {
        var name = '#' + sn.get('serialNo') + ' @ ' + time.format(sn.get('scannedAt'), 'L LTS');
        var tt = sn.get('taktTime') / 1000;

        min = Math.min(min, tt);
        max = Math.max(max, tt);
        med.push(tt);

        categories.push((i + 1).toString());
        actual.push({
          name: name,
          y: tt,
          color: tt > maxY ? '#000' : tt > tgt ? '#d9534f' : '#5cb85c',
          percent: Math.round(tt / tgt * 100)
        });
        target.push({
          name: name,
          y: tgt,
          percent: 100
        });
      });

      min = min < 1 ? 1 : Math.round(min);
      max = max < 1 ? 1 : Math.round(max);
      med = median(med, false);
      med = med < 1 ? 1 : Math.round(med);

      view.$id('totals').html(view.t('serialNumbers:panel:totals', {
        tgt: tgt + 's ▪ 100%',
        avg: avg + 's ▪ ' + Math.round(avg / tgt * 100) + '%',
        med: med + 's ▪ ' + Math.round(med / tgt * 100) + '%',
        min: min + 's ▪ ' + Math.round(min / tgt * 100) + '%',
        max: max + 's ▪ ' + Math.round(max / tgt * 100) + '%'
      }));

      view.chart = new Highcharts.Chart({
        chart: {
          renderTo: view.$id('chart')[0],
          plotBorderWidth: 0,
          spacing: [15, 15, 0, 15],
          type: 'column'
        },
        exporting: {
          filename: view.t('serialNumbers:chart:filename'),
          chartOptions: {
            title: {
              text: view.t('serialNumbers:chart:title')
            }
          }
        },
        title: false,
        noData: {},
        xAxis: {
          categories: categories
        },
        yAxis: [
          {
            title: false,
            min: 0,
            max: maxY,
            allowDecimals: false,
            opposite: false
          }
        ],
        tooltip: {
          shared: true,
          valueDecimals: 0,
          extraRowsProvider: function(points, rows)
          {
            rows.forEach(function(row)
            {
              row.extraColumns = '<td class="highcharts-tooltip-integer">' + row.point.options.percent + '</td>'
                + '<td class="highcharts-tooltip-suffix">%</td>';
            });
          }
        },
        legend: {
          enabled: true
        },
        plotOptions: {
          column: {
            dataLabels: {
              enabled: false
            }
          },
          line: {
            marker: {
              enabled: false
            }
          }
        },
        series: [{
          id: 'actual',
          type: 'column',
          name: view.t('serialNumbers:metrics:actual'),
          data: actual,
          tooltip: {valueSuffix: 's'}
        }, {
          id: 'target',
          type: 'line',
          color: 'orange',
          name: view.t('serialNumbers:metrics:target'),
          data: target,
          tooltip: {valueSuffix: 's'}
        }]
      });
    }

  });
});
