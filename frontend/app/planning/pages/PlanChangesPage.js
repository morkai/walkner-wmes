// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View'
], function(
  t,
  View
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('planning', 'BREADCRUMBS:base'),
          href: '#planning/plans'
        },
        {
          label: this.collection.getDate('LL'),
          href: '#planning/plans/' + this.collection.getDate('YYYY-MM-DD')
        },
        {
          label: t.bound('planning', 'BREADCRUMBS:changes')
        }
      ];
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    afterRender: function()
    {
      this.$el.html(
        '<div class="well text-mono">'
        + this.collection.map(function(change) { return JSON.stringify(change, null, 2); }).join('<hr>')
        + '</div>'
      );
    }

  });
});
