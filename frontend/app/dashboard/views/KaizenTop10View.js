// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

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

    getTemplateData: function()
    {
      return {
        state: this.state,
        month: time.getMoment().add(this.options.month || 0, 'months').month() + 1,
        top10: this.getData()
      };
    },

    getData: function()
    {
      var from = time.getMoment().startOf('month').add(this.options.month || 0, 'months');
      var to = from.clone().add(1, 'months');
      var urlTemplate = this.options.urlTemplate
        .replace('${from}', from.valueOf())
        .replace('${to}', to.valueOf());

      return (this.model.get(this.options.top10Property) || []).map(function(entry)
      {
        entry.url = urlTemplate.replace('${user}', entry._id);

        return entry;
      });
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
