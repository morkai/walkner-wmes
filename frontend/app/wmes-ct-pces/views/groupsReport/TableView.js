// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/wmes-ct-pces/templates/groupsReport/table'
], function(
  time,
  View,
  template
) {
  'use strict';

  function zeroDuration(d)
  {
    return d < 1 || d > 28800 ? 0 : d;
  }

  function formatDuration(seconds)
  {
    var str = '';

    if (!seconds || seconds < 1)
    {
      return str;
    }

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

    getTemplateData: function()
    {
      return {
        stationCount: this.model.getStationCount(),
        rows: this.serializeRows()
      };
    },

    serializeRows: function()
    {
      var view = this;
      var rows = [];
      var stationCount = this.model.getStationCount();

      view.group.get('sapOrders').forEach(function(orderNo)
      {
        var sapOrder = view.model.sapOrders.get(orderNo);
        var target = sapOrder.get('target');
        var actual = sapOrder.get('actual');
        var row = {
          orderNo: sapOrder.id,
          nc12: sapOrder.get('nc12'),
          name: sapOrder.get('name'),
          description: sapOrder.get('description'),
          qtyTodo: sapOrder.get('qtyTodo'),
          qtyDone: sapOrder.get('qtyDone'),
          qtyMatched: sapOrder.get('qtyMatched'),
          stations: [],
          total: {
            target: formatDuration(target.avg[0]),
            med: formatDuration(actual.med[0]),
            avg: formatDuration(actual.avg[0]),
            min: formatDuration(actual.min[0]),
            max: formatDuration(actual.max[0])
          },
          minStationI: -1,
          minDuration: Number.MAX_SAFE_INTEGER,
          maxStationI: -1,
          maxDuration: Number.MIN_SAFE_INTEGER
        };

        for (var stationNo = 1; stationNo <= stationCount; ++stationNo)
        {
          var duration = actual.med[stationNo];

          if (duration > row.maxDuration)
          {
            row.maxStationI = stationNo - 1;
            row.maxDuration = duration;
          }

          if (duration < row.minDuration)
          {
            row.minStationI = stationNo - 1;
            row.minDuration = duration;
          }

          row.stations.push({
            target: formatDuration(target.avg[stationNo]),
            med: formatDuration(duration),
            avg: formatDuration(actual.avg[stationNo]),
            min: formatDuration(actual.min[stationNo]),
            max: formatDuration(actual.max[stationNo])
          });
        }

        row.minDuration = formatDuration(zeroDuration(row.minDuration));
        row.maxDuration = formatDuration(zeroDuration(row.maxDuration));

        rows.push(row);
      });

      return rows;
    }

  });
});
