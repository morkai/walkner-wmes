// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'highlight',
  'app/core/View',
  'app/icpo/templates/details'
], function(
  _,
  hljs,
  View,
  detailsTemplate
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    events: {
      'click .history-tabs a': function(e)
      {
        e.preventDefault();

        var tab = this.$(e.target).tab('show').parent().attr('data-tab');

        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl() + '?tab=' + tab,
          trigger: false,
          replace: true
        });
      },
      'shown.bs.tab': function(e)
      {
        var tabEl = e.target.parentNode;

        if (tabEl.dataset.highlight !== undefined)
        {
          this.highlight(tabEl.dataset.tab);
        }
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('v');
      this.highlighted = {
        driverData: false,
        gprsData: false,
        inputData: false,
        outputData: false
      };

      this.listenTo(this.model, 'change', _.after(2, this.render.bind(this)));
    },

    beforeRender: function()
    {
      this.highlighted = {
        driverData: false,
        gprsData: false,
        inputData: false,
        outputData: false
      };
    },

    afterRender: function()
    {
      this.$('.nav-tabs > li[data-tab="' + (this.options.tab || 'log') + '"] > a').tab('show');
    },

    highlight: function(what)
    {
      if (this.highlighted[what])
      {
        return;
      }

      if (this.model.get(what))
      {
        hljs.highlightBlock(this.$id(what).find('code')[0]);
      }

      this.highlighted[what] = true;
    }

  });
});
