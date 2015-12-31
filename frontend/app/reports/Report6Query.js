// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../core/Model'
], function(
  _,
  time,
  Model
) {
  'use strict';

  return Model.extend({

    defaults: {
      from: null,
      to: null,
      interval: 'shift',
      parent: null
    },

    reset: function(query)
    {
      this.set(_.defaults(this.constructor.prepareAttrsFromQuery(query), this.defaults), {reset: true});
    },

    serializeToObject: function()
    {
      return {
        from: this.get('from'),
        to: this.get('to'),
        interval: this.get('interval'),
        parent: this.get('parent')
      };
    },

    serializeToString: function(parent)
    {
      var queryString = '';
      var attrs = this.attributes;

      if (attrs.interval)
      {
        queryString += '&interval=' + attrs.interval;
      }

      if (attrs.from && attrs.to)
      {
        queryString += '&from=' + encodeURIComponent(attrs.from);
        queryString += '&to=' + encodeURIComponent(attrs.to);
      }

      if (parent)
      {
        queryString += '&parent=' + parent;
      }
      else if (parent === undefined && attrs.parent)
      {
        queryString += '&parent=' + attrs.parent;
      }

      return queryString.substr(1);
    }

  }, {

    prepareAttrsFromQuery: function(query)
    {
      var attrs = {};

      if (query.from && query.to)
      {
        attrs.from = +query.from;
        attrs.to = +query.to;
      }
      else
      {
        attrs.from = time.getMoment().subtract(1, 'days').hours(0).startOf('hour').valueOf();
        attrs.to = time.getMoment().hours(0).startOf('hour').valueOf();
      }

      if (query.interval)
      {
        attrs.interval = query.interval;
      }

      if (query.parent)
      {
        attrs.parent = query.parent;
      }

      return attrs;
    },

    fromQuery: function(query)
    {
      return new this(this.prepareAttrsFromQuery(query));
    }

  });
});
