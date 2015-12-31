// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  '../views/StructureVisView'
], function(
  $,
  t,
  View,
  StructureVisView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: [
      t.bound('vis', 'BREADCRUMBS:structure')
    ],

    actions: function()
    {
      var page = this;

      return [{
        label: t.bound('vis', 'PAGE_ACTION:toggleDeactivated'),
        icon: 'toggle-on',
        className: 'active',
        callback: function()
        {
          var btnEl = this.querySelector('.btn');

          if (btnEl.classList.contains('active'))
          {
            page.view.showDeactivated();
          }
          else
          {
            page.view.hideDeactivated();
          }

          btnEl.classList.toggle('active');

          return false;
        }
      }];
    },

    initialize: function()
    {
      this.view = new StructureVisView();
    },

    destroy: function()
    {
      document.body.classList.remove('no-overflow');
    },

    afterRender: function()
    {
      document.body.classList.add('no-overflow');
    },

    load: function(when)
    {
      if (typeof window.d3 !== 'undefined')
      {
        return when();
      }

      var deferred = $.Deferred();

      require(['d3'], function()
      {
        deferred.resolve();
      });

      return when(deferred);
    }

  });
});
