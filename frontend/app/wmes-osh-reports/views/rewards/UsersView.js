// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/templates/userInfo',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-reports/templates/rewards/users'
], function(
  View,
  userInfoTemplate,
  dictionaries,
  template
) {
  'use strict';

  return View.extend({

    template,

    initialize: function()
    {
      this.listenTo(this.model, 'change:loading', this.render);
    },

    getTemplateData: function()
    {
      const status = (this.model.findRqlTerm('status') || {args: []}).args[1];
      let metrics;

      switch (status)
      {
        case 'paid':
          metrics = ['paid'];
          break;

        case 'unpaid':
        case 'payout':
          metrics = ['payout'];
          break;

        default:
          metrics = ['earned', 'paid', 'payout'];
          break;
      }

      return {
        metrics,
        currencyFormatter: dictionaries.currencyFormatter,
        minPayout: this.model.get('settings').minPayout || Number.MAX_SAFE_INTEGER,
        loading: this.model.get('loading'),
        rows: this.serializeRows()
      };
    },

    serializeRows: function()
    {
      const rows = this.model.get('users');

      rows.forEach(row =>
      {
        row.userInfo = userInfoTemplate(row.recipient, {noIp: true});
      });

      return rows;
    }

  });
});
