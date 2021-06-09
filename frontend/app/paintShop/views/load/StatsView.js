// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/paintShop/templates/load/stats'
], function(
  _,
  t,
  time,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    initialize: function()
    {
      this.listenTo(this.stats, 'change', this.render);
      this.listenTo(this.settings, 'change', this.render);
    },

    afterRender: function()
    {
      clearInterval(this.timers.update);
      this.timers.update = setInterval(this.update.bind(this), 1000);
    },

    update: function()
    {
      var current = this.serializeCurrent();

      this.$id('current').css('color', current.color);
      this.$id('current-duration').html(current.duration);
      this.$id('current-icon').find('.fa').removeClass().addClass('fa fa-' + current.icon);
    },

    getTemplateData: function()
    {
      return {
        current: this.serializeCurrent(),
        stats: this.serializeStats()
      };
    },

    serializeStats: function()
    {
      var view = this;
      var counter = view.stats.get('counter');

      return ['1h', 'shift', '8h', '1d', '7d', '30d'].map(function(id)
      {
        var stat = view.stats.get(id);
        var duration = Math.ceil(stat.avg / 1000);

        return _.assign({
          id: id,
          count: stat.sum,
          duration: duration
        }, view.settings.getLoadStatus(counter, duration));
      });
    },

    serializeCurrent: function()
    {
      var counter = this.stats.get('counter');
      var last = this.stats.get('last');
      var duration = last
        ? Math.max(0, Math.min(999, Math.floor((Date.now() - Date.parse(last._id.ts)) / 1000))).toString()
        : '';

      return _.assign(
        {duration: duration},
        this.settings.getLoadStatus(counter, duration)
      );
    },

    serializeLast: function()
    {
      var counter = this.stats.get('counter');
      var last = this.stats.get('last');
      var duration = last ? last.d : 0;

      return _.assign(
        {count: 1, duration: duration || '?'},
        this.settings.getLoadStatus(counter, duration)
      );
    }

  });
});
