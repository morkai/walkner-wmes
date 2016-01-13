// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/View',
  'app/dashboard/templates/kaizenTop10'
], function(
  _,
  time,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    top10Property: 'top10',

    initialize: function()
    {
      this.state = this.getDataState();

      if (this.state === 'empty')
      {
        this.listenToOnce(this.model, 'request', this.onLoadingStart);
        this.listenToOnce(this.model, 'error', this.onLoadingError);
        this.listenToOnce(this.model, 'sync', this.onLoaded);
      }
      else
      {
        this.listenTo(this.model, 'change:' + this.options.top10Property, this.render);
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        state: this.state,
        month: time.getMoment().add(this.options.month || 0, 'months').month() + 1,
        top10: this.getData()
      };
    },

    getData: function()
    {
      return this.model.get(this.options.top10Property);
    },

    getDataState: function()
    {
      return _.isEmpty(this.getData()) ? 'empty' : 'ready';
    },

    onLoadingStart: function()
    {
      this.state = 'loading';

      this.render();
    },

    onLoadingError: function()
    {
      this.state = this.getDataState();

      this.render();
    },

    onLoaded: function()
    {
      this.state = this.getDataState();

      this.render();
    }

  });
});
