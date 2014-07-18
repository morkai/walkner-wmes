// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'highlight',
  'app/core/View',
  'app/xiconf/templates/details'
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
        if (e.target.parentNode.dataset.tab === 'feature')
        {
          this.highlightFeature();
        }
      }
    },

    initialize: function()
    {
      this.featureHighlighted = false;

      this.listenTo(this.model, 'change', _.after(2, this.render.bind(this)));
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        model: this.model.toJSON(),
        log: this.model.getDecoratedLog()
      };
    },

    beforeRender: function()
    {
      this.featureHighlighted = false;
    },

    afterRender: function()
    {
      this.$('.nav-tabs > li[data-tab="' + (this.options.tab || 'log') + '"] > a').tab('show');
    },

    highlightFeature: function()
    {
      if (this.featureHighlighted)
      {
        return;
      }

      if (this.model.hasFeatureData())
      {
        hljs.highlightBlock(this.$id('feature').find('code')[0]);
      }

      this.featureHighlighted = true;
    }

  });
});
