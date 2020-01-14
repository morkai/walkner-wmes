// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/core/View',
  '../VisNodePositionCollection',
  '../views/StructureVisView'
], function(
  $,
  t,
  View,
  VisNodePositionCollection,
  StructureVisView
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: [
      t.bound('vis', 'BREADCRUMB:structure')
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
      this.model = {
        nodePositions: new VisNodePositionCollection(null, {paginate: false})
      };
      this.view = new StructureVisView({model: this.model});

      this.model.nodePositions.subscribe(this.pubsub);
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
        return when(this.model.nodePositions.fetch({reset: true}));
      }

      var deferred = $.Deferred(); // eslint-disable-line new-cap

      require(['d3'], function()
      {
        deferred.resolve();
      });

      return when(deferred, this.model.nodePositions.fetch({reset: true}));
    }

  });
});
