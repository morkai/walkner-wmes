// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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
