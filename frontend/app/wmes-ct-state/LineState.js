// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../user',
  '../core/Model'
], function(
  _,
  t,
  time,
  user,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/ct/state',

    clientUrlRoot: '#ct/state',

    topicPrefix: 'ct.state',

    privilegePrefix: 'PROD_DATA',

    nlsDomain: 'wmes-ct-state',

    serialize: function()
    {
      var lineState = this;
      var obj = lineState.toJSON();

      obj.stations = _.map(obj.stations, function(station)
      {
        return lineState.serializeStation(station);
      });

      return obj;
    },

    serializeStation: function(station)
    {
      var durations = {
        total: {
          short: this.formatShortDuration(station.durations.total),
          full: this.formatFullDuration(station.durations.total)
        },
        work: {
          short: this.formatShortDuration(station.durations.work),
          full: this.formatFullDuration(station.durations.work)
        },
        downtime: {
          short: this.formatShortDuration(station.durations.downtime),
          full: this.formatFullDuration(station.durations.downtime)
        },
        scheduled: {
          short: this.formatShortDuration(station.durations.scheduled),
          full: this.formatFullDuration(station.durations.scheduled)
        }
      };
      var taktTime = {
        title: '',
        order: {
          short: station.order.sapTaktTime || '-',
          full: station.order.sapTaktTime ? this.formatFullDuration(station.order.sapTaktTime * 1000) : '-'
        },
        actual: {
          short: '-',
          full: '-'
        }
      };

      if (station.durations.work && station.qtyDone)
      {
        var att = Math.ceil(station.durations.work / 1000 / station.qtyDone);

        taktTime.actual.short = att;
        taktTime.actual.full = this.formatFullDuration(att * 1000);
      }

      taktTime.title = [
        t(this.nlsDomain, 'PROPERTY:taktTime:actual'),
        '  ' + taktTime.actual.full,
        t(this.nlsDomain, 'PROPERTY:taktTime:order'),
        '  ' + taktTime.order.full
      ].join('\n');

      return {
        _id: station._id,
        lamp: station.lamp,
        order: {
          _id: station.order._id || '---------',
          nc12: station.order.nc12 || '------------',
          name: station.order.name,
          qty: station.order.qty || 0,
          workerCount: station.order.workerCount || 0
        },
        qtyTodo: station.qtyTodo,
        qtyDone: station.qtyDone,
        times: {
          orderStartedAt: {
            short: this.formatShortTime(station.orderStartedAt),
            full: this.formatFullTime(station.orderStartedAt)
          },
          pceStartedAt: {
            short: this.formatShortTime(station.pceStartedAt),
            full: this.formatFullTime(station.pceStartedAt)
          },
          pceFinishedAt: {
            short: this.formatShortTime(station.pceFinishedAt),
            full: this.formatFullTime(station.pceFinishedAt)
          }
        },
        duration: {
          value: station.durations.total ? time.toString(station.durations.total / 1000, false, false) : '-',
          title: [
            t(this.nlsDomain, 'PROPERTY:durations:total'),
            '  ' + durations.total.full,
            t(this.nlsDomain, 'PROPERTY:durations:work'),
            '  ' + durations.work.full,
            t(this.nlsDomain, 'PROPERTY:durations:downtime'),
            '  ' + durations.downtime.full,
            t(this.nlsDomain, 'PROPERTY:durations:scheduled'),
            '  ' + durations.scheduled.full
          ].join('\n')
        },
        durations: durations,
        taktTime: taktTime
      };
    },

    formatShortTime: function(date)
    {
      return date ? time.format(date, 'HH:mm:ss') : '--:--:--';
    },

    formatFullTime: function(date)
    {
      return date ? time.format(date, 'LL LTS') : '--:--:--';
    },

    formatShortDuration: function(ms)
    {
      return time.toString(ms / 1000, true, false);
    },

    formatFullDuration: function(ms)
    {
      return time.toString(ms / 1000, false, false);
    },

    update: function(message)
    {
      var lineState = this;

      if (lineState.get('updatedAt') >= message.updatedAt)
      {
        return;
      }

      var data = {
        updatedAt: message.updatedAt,
        stations: {}
      };

      if (message.reset)
      {
        data.stations = message.stations;
      }
      else
      {
        _.forEach(lineState.get('stations'), function(station)
        {
          data.stations[station._id] = _.assign({}, station, message.stations[station._id]);
        });
      }

      lineState.set(data);

      _.forEach(message.stations, function(station)
      {
        lineState.trigger('change:station', lineState.attributes.stations[station._id]);
      });
    }

  });
});
