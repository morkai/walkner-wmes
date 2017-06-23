// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'backbone'
], function(
  _,
  Backbone
) {
  'use strict';

  return Backbone.Model.extend({

    defaults: {
      totalCount: -1,
      urlTemplate: '?page=${page}&limit=${limit}',
      page: 1,
      skip: 0,
      limit: 10
    },

    initialize: function()
    {
      this.on('change', this.recalcAttrs, this);

      var attrs = this.attributes;

      if (attrs.page < 1)
      {
        attrs.page = 1;
      }

      if (attrs.skip < 0)
      {
        attrs.skip = 0;
      }

      if (attrs.limit < 1)
      {
        attrs.limit = 1;
      }

      if (attrs.skip !== 0)
      {
        this.recalcPage();
      }
      else if (attrs.page !== 1)
      {
        this.recalcSkip();
      }
      else
      {
        this.adjustSkipToLimit();
      }
    },

    sync: function()
    {
      throw new Error('Not supported!');
    },

    recalcAttrs: function()
    {
      var attrs = this.changedAttributes();

      if (_.has(attrs, 'total') || _.has(attrs, 'skip') || _.has(attrs, 'limit'))
      {
        this.recalcPage();
      }
      else if (_.has(attrs, 'page'))
      {
        this.recalcSkip();
      }
    },

    recalcPage: function()
    {
      this.adjustSkipToLimit();

      var attrs = this.attributes;

      attrs.page = (attrs.skip / attrs.limit) + 1;
    },

    recalcSkip: function()
    {
      var attrs = this.attributes;

      attrs.skip = (attrs.page - 1) * attrs.limit;
    },

    adjustSkipToLimit: function()
    {
      var attrs = this.attributes;

      if (attrs.skip >= attrs.total)
      {
        attrs.skip = attrs.total < 2 ? 1 : attrs.total - 1;
      }

      var r = attrs.skip % attrs.limit;

      if (r !== 0)
      {
        attrs.skip -= r;
      }
    }

  });
});
