// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'h5.rql/index',
  '../time',
  '../core/Model',
  '../core/util/getShiftStartInfo'
], function(
  rql,
  time,
  Model,
  getShiftStartInfo
) {
  'use strict';

  return Model.extend({

    defaults: function()
    {
      var from = time.getMoment().weekday(0).hours(0).minutes(0).seconds(0).milliseconds(0);

      return {
        from: from.valueOf(),
        to: from.add(7, 'days').valueOf(),
        interval: 'day',
        mode: 'shift',
        masters: undefined,
        operators: undefined,
        divisions: [],
        shifts: [1, 2, 3]
      };
    },

    serializeToObject: function()
    {
      var obj = {
        from: this.get('from'),
        to: this.get('to'),
        interval: this.get('interval'),
        mode: this.get('mode'),
        divisions: this.get('divisions').join(','),
        shifts: this.get('shifts').join(',')
      };

      if (obj.mode !== 'shift')
      {
        obj[obj.mode] = this.get(obj.mode);

        if (Array.isArray(obj[obj.mode]))
        {
          obj[obj.mode] = this.serializeUsers();
        }
      }

      return obj;
    },

    serializeToString: function()
    {
      var attrs = this.attributes;
      var str = 'from=' + attrs.from + '&to=' + attrs.to + '&interval=' + attrs.interval;

      if (attrs.mode)
      {
        str += '&mode=' + attrs.mode;

        if (attrs.mode !== 'shift')
        {
          str += '&' + attrs.mode + '=';

          if (Array.isArray(attrs[attrs.mode]))
          {
            str += this.serializeUsers();
          }
        }
      }

      str += '&divisions=' + attrs.divisions.join(',') + '&shifts=' + attrs.shifts.join(',');

      return str;
    },

    serializeUsers: function()
    {
      var users = this.get(this.get('mode'));

      if (!Array.isArray(users))
      {
        return '';
      }

      return users
        .map(function(user) { return user._id ? user._id : user; })
        .join(',');
    },

    getUsersForSelect2: function()
    {
      if (this.get('mode') === 'shift')
      {
        return [];
      }

      var users = this.get(this.get('mode'));

      if (!Array.isArray(users))
      {
        return [];
      }

      return users
        .map(function(user)
        {
          if (typeof user === 'string')
          {
            return {id: user, text: user};
          }

          if (user && user._id)
          {
            return {
              id: user._id,
              text: user.lastName + ' ' + user.firstName + ' (' + user.personellId + ')'
            };
          }

          return null;
        })
        .filter(function(user)
        {
          return user !== null;
        });
    },

    updateUsers: function(users)
    {
      if (this.get('mode') === 'shift')
      {
        return;
      }

      this.set(this.get('mode'), users);
    }

  }, {

    fromQuery: function(query)
    {
      var Report4Query = this;
      var attrs = {};

      if (query.from && query.to)
      {
        attrs.from = parseInt(query.from, 10);
        attrs.to = parseInt(query.to, 10);
      }

      if (query.interval)
      {
        attrs.interval = query.interval;
      }

      if (query.mode)
      {
        attrs.mode = query.mode;

        if (query.mode === 'masters' || query.mode === 'operators')
        {
          attrs[attrs.mode] = String(query[attrs.mode]).split(',');

          if (attrs[attrs.mode].length === 0)
          {
            delete attrs.mode;
            delete attrs[attrs.mode];
          }
        }
        else if (query.mode !== 'shift')
        {
          delete attrs.mode;
        }
      }

      if (query.divisions)
      {
        attrs.divisions = query.divisions.split(',');
      }

      if (query.shifts)
      {
        attrs.shifts = query.shifts.split(',');
      }

      return new Report4Query(attrs);
    }

  });
});
