// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../views/FactoryLayoutView'
], function(
  $,
  t,
  View,
  bindLoadingMessage,
  FactoryLayoutView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    localTopics: {
      'socket.connected': function()
      {
        this.promised(this.model.fetch({reset: true}));
      }
    },

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('factoryLayout', 'bc:layout'),
          href: this.model.genClientUrl()
        },
        t.bound('factoryLayout', 'bc:layout:edit')
      ];
    },

    actions: function()
    {
      return [{
        label: t.bound('factoryLayout', 'pa:layout:live'),
        icon: 'save',
        callback: function()
        {
          console.log(arguments, this);
        }
      }];
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
    },

    destroy: function()
    {
      document.body.classList.remove('no-overflow');

      this.model = null;
    },

    defineModels: function()
    {
      this.model = bindLoadingMessage(this.model, this);
    },

    defineViews: function()
    {
      this.view = new FactoryLayoutView({

      });
    },

    load: function(when)
    {
      return when(this.model.fetch({reset: true}));
    },

    afterRender: function()
    {
      document.body.classList.add('no-overflow');
    }

  });
});
