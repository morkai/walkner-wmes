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
      {href: '#pscs', label: t.bound('pscs', 'BREADCRUMB:base')},
      t.bound('pscs', 'BREADCRUMB:learn')
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
      var locale = window.LOCALE === 'pl' ? 'pl' : 'en';
      var src = 'https://onedrive.live.com/embed?';

      if (locale === 'pl')
      {
        src += 'cid=86FB4363CC9A31FD&resid=86FB4363CC9A31FD%21575&authkey=AEtS4OkzJLHoQTU&em=2';
      }
      else
      {
        src += 'cid=86FB4363CC9A31FD&resid=86FB4363CC9A31FD%21574&authkey=ANBJtkrXd2cWQCw&em=2';
      }

      return {
        idPrefix: this.idPrefix,
        height: this.getHeight(),
        src: src
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
      this.$('iframe')[0].height = this.getHeight();
    }

  });
});
