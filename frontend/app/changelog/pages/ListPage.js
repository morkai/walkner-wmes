// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/changelog/templates/list'
], function(
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    events: {
      'click #-showMore': function()
      {
        this.showNext(10);
        this.$id('showMore').remove();
        this.$id('showAll').removeClass('hidden');
      },
      'click #-showAll': function()
      {
        this.$hidden.removeClass('hidden');
        this.$id('showAll').remove();
      }
    },

    breadcrumbs: function()
    {
      return [t.bound('changelog', 'breadcrumbs:browse')];
    },

    initialize: function()
    {

    },

    destroy: function()
    {
      this.$hidden = null;
    },

    afterRender: function()
    {
      this.$hidden = this.$('.hidden');

      this.showNext(4);
    },

    showNext: function(count)
    {
      for (var i = 0, l = Math.min(count, this.$hidden.length); i < l; ++i)
      {
        this.$hidden[i].classList.remove('hidden');
      }

      this.$hidden = this.$('.hidden');
    }

  });
});
