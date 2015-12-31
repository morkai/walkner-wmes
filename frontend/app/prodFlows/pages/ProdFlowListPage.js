// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/pages/ListPage',
  '../views/ProdFlowListView'
], function(
  t,
  ListPage,
  ProdFlowListView
) {
  'use strict';

  return ListPage.extend({

    ListView: ProdFlowListView,

    actions: function()
    {
      var page = this;

      return [{
        label: t.bound('prodFlows', 'PAGE_ACTION:toggleDeactivated'),
        icon: 'toggle-on',
        className: 'active',
        callback: function()
        {
          var btnEl = this.querySelector('.btn');

          btnEl.classList.toggle('active');
          page.view.toggleDeactivated(!btnEl.classList.contains('active'));

          return false;
        }
      }].concat(ListPage.prototype.actions.call(this));
    }

  });
});
