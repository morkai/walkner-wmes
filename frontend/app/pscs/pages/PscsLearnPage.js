// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/pscs/templates/learn'
], function(
  $,
  t,
  View,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'blank',

    template: template,

    breadcrumbs: [
      {href: '#pscs', label: t.bound('pscs', 'BREADCRUMBS:base')},
      t.bound('pscs', 'BREADCRUMBS:learn')
    ],

    initialize: function()
    {
      $(window).on('resize.' + this.idPrefix, this.onResize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      document.body.style.overflow = '';
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        height: this.getHeight(),
        locale: window.LOCALE === 'pl' ? 'pl' : 'en'
      };
    },

    afterRender: function()
    {
      document.body.style.overflow = 'hidden';
    },

    getHeight: function()
    {
      return window.innerHeight - 208;
    },

    onResize: function()
    {
      this.$('object')[0].height = this.getHeight();
    }

  });
});
