// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/wmes-ct-pces/templates/pceReport/table'
], function(
  time,
  View,
  template
) {
  'use strict';

  function zeroDuration(d)
  {
    return d < 1000 || d > 28800000 ? 0 : d;
  }

  function formatDuration(duration)
  {
    var str = '';

    if (duration === 0)
    {
      return str;
    }

    var seconds = Math.round(duration / 1000);
    var minutes = Math.floor(seconds / 60);

    if (minutes > 0)
    {
      if (minutes > 99)
      {
        minutes = 99;
      }
      else if (minutes < 10)
      {
        str += '0';
      }

      str += minutes + ':';
      seconds %= 60;
    }
    else
    {
      str += '00:';
    }

    if (seconds > 0)
    {
      if (seconds < 10)
      {
        str += '0';
      }

      str += seconds;
    }
    else
    {
      str += '00';
    }

    return str;
  }

  return View.extend({

    template: template,

    events: {

    },

    initialize: function()
    {
      this.metrics = {
        pso: null,
        order: null,
        product: null
      };
    },

    getTemplateData: function()
    {
      return {
        stationCount: this.model.getStationCount(),
        pces: this.serializePces()
      };
    },

    createEmptyMetrics: function()
    {
      var stationCount = this.model.getStationCount();
      var metrics = {
        min: new Array(stationCount),
        max: new Array(stationCount),
        sum: new Array(stationCount),
        cnt: new Array(stationCount),
        avg: new Array(stationCount),
        med: new Array(stationCount)
      };

      for (var i = 0; i < stationCount; ++i)
      {
        metrics.min[i] = Number.MAX_SAFE_INTEGER;
        metrics.max[i] = Number.MIN_SAFE_INTEGER;
        metrics.sum[i] = 0;
        metrics.cnt[i] = 0;
        metrics.avg[i] = 0;
        metrics.med[i] = [];
      }

      return metrics;
    },

    calcMetrics: function(metrics)
    {
      metrics.avg.forEach(function(unused, i)
      {
        metrics.avg[i] = metrics.cnt[i] ? (metrics.sum[i] / metrics.cnt[i]) : 0;

        var med = metrics.med[i];

        if (med.length === 0)
        {
          med = 0;
        }
        else if (med.length === 1)
        {
          med = med[0];
        }
        else if (med.length % 2 === 0)
        {
          med = (med[med.length / 2 - 1] + med[med.length / 2]) / 2;
        }
        else
        {
          med = med[(med.length + 1) / 2 - 1];
        }

        metrics.med[i] = med;
      });

      return metrics;
    },

    serializePces: function()
    {
      var view = this;

      view.metrics = {
        pso: null,
        order: null,
        product: null
      };

      var report = view.model;
      var pces = [];
      var displayedMetrics = ['min', 'max', 'avg', 'med'];
      var orderNos = Object.keys(view.product.get('orders'));
      var productMetrics = orderNos.length > 1 ? view.createEmptyMetrics() : null;

      orderNos.forEach(function(orderNo)
      {
        var order = report.orders.get(orderNo);
        var orderPces = [];
        var psoIds = Object.keys(order.get('psos'));
        var orderMetrics = psoIds.length > 1 ? view.createEmptyMetrics() : null;

        psoIds.forEach(function(psoId)
        {
          var pso = report.psos.get(psoId);
          var line = pso.get('line');
          var shift = pso.get('shift');
          var shiftDate = time.format(shift.date, 'L');
          var shiftNo = view.t('core', 'SHIFT:' + shift.no);
          var psoMetrics = view.createEmptyMetrics();
          var allMetrics = [productMetrics, orderMetrics, psoMetrics];

          pso.get('pces').forEach(function(stations, i)
          {
            var pce = {
              line: line,
              orderNo: orderNo,
              shift: {
                _id: shift._id,
                date: shiftDate,
                no: shiftNo
              },
              pso: psoId,
              startedAt: Number.MAX_SAFE_INTEGER,
              shiftPce: i + 1,
              orderPce: -1,
              stations: [],
              minStationI: -1,
              minDuration: Number.MAX_SAFE_INTEGER,
              maxStationI: -1,
              maxDuration: Number.MIN_SAFE_INTEGER
            };

            stations.forEach(function(stationPce, stationI)
            {
              if (stationPce && stationPce.t < pce.startedAt)
              {
                pce.startedAt = stationPce.t;
              }

              if (!stationPce)
              {
                pce.stations.push('');

                return;
              }

              var duration = zeroDuration(stationPce.d[1]);

              if (duration > 0)
              {
                if (duration > pce.maxDuration)
                {
                  pce.maxStationI = stationI;
                  pce.maxDuration = duration;
                }

                if (duration < pce.minDuration)
                {
                  pce.minStationI = stationI;
                  pce.minDuration = duration;
                }

                allMetrics.forEach(function(metrics)
                {
                  if (metrics === null)
                  {
                    return;
                  }

                  if (duration < metrics.min[stationI])
                  {
                    metrics.min[stationI] = duration;
                  }

                  if (duration > metrics.max[stationI])
                  {
                    metrics.max[stationI] = duration;
                  }

                  metrics.sum[stationI] += duration;
                  metrics.cnt[stationI] += 1;
                  metrics.med[stationI].push(duration);
                });
              }

              pce.stations.push(formatDuration(duration));
            });

            pce.minDuration = formatDuration(zeroDuration(pce.minDuration));
            pce.maxDuration = formatDuration(zeroDuration(pce.maxDuration));

            pces.push(pce);
            orderPces.push(pce);
          });

          view.calcMetrics(psoMetrics);

          displayedMetrics.forEach(function(metric)
          {
            pces.push(view.createMetricPce(psoMetrics[metric], {
              metric: metric,
              scope: 'pso',
              line: line,
              orderNo: orderNo,
              shift: {
                _id: shift._id,
                date: shiftDate,
                no: shiftNo
              },
              pso: psoId
            }));
          });

          view.metrics.pso = psoMetrics;
        });

        orderPces.sort(function(a, b) { return a.startedAt - b.startedAt; });

        orderPces.forEach(function(pce, i)
        {
          pce.orderPce = i + 1;
        });

        if (orderMetrics)
        {
          view.calcMetrics(orderMetrics);

          displayedMetrics.forEach(function(metric)
          {
            pces.push(view.createMetricPce(orderMetrics[metric], {
              metric: metric,
              scope: 'order',
              orderNo: orderNo
            }));
          });

          view.metrics.order = orderMetrics;
        }
      });

      if (productMetrics)
      {
        view.calcMetrics(productMetrics);

        displayedMetrics.forEach(function(metric)
        {
          pces.push(view.createMetricPce(productMetrics[metric], {
            metric: metric,
            scope: 'product'
          }));
        });

        view.metrics.product = productMetrics;
      }

      pces.push(view.createSapTaktTimePce());

      view.product.set('metrics', view.metrics);

      return pces;
    },

    createMetricPce: function(metrics, pce)
    {
      pce.stations = [];
      pce.minStationI = -1;
      pce.minDuration = Number.MAX_SAFE_INTEGER;
      pce.maxStationI = -1;
      pce.maxDuration = Number.MIN_SAFE_INTEGER;

      metrics.forEach(function(value, stationI)
      {
        value = zeroDuration(value);

        if (value > 0)
        {
          if (value > pce.maxDuration)
          {
            pce.maxStationI = stationI;
            pce.maxDuration = value;
          }

          if (value < pce.minDuration)
          {
            pce.minStationI = stationI;
            pce.minDuration = value;
          }
        }

        pce.stations.push(formatDuration(value));
      });

      pce.minDuration = formatDuration(zeroDuration(pce.minDuration));
      pce.maxDuration = formatDuration(zeroDuration(pce.maxDuration));

      return pce;
    },

    createSapTaktTimePce: function()
    {
      var stationCount = this.model.getStationCount();
      var sapTaktTime = formatDuration(this.product.get('sapTaktTime') * 1000);
      var pce = {
        metric: 'stt',
        scope: 'product',
        stations: [],
        minDuration: sapTaktTime,
        maxDuration: sapTaktTime
      };

      for (var i = 0; i < stationCount; ++i)
      {
        pce.stations.push(sapTaktTime);
      }

      return pce;
    }

  });
});
