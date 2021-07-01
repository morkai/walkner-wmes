// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-reports/templates/rewards/payout'
], function(
  viewport,
  View,
  dictionaries,
  template
) {
  'use strict';

  return View.extend({

    template,

    nlsDomain: 'wmes-osh-reports',

    events: {

      'submit': function(e)
      {
        e.preventDefault();

        this.$id('submit').prop('disabled', true);

        viewport.msg.saving();

        const payouts = [];

        this.payouts.forEach(payout =>
        {
          payouts.push({
            recipient: payout.recipient,
            entries: payout.unpaid
          });
        });

        const req = this.ajax({
          method: 'POST',
          url: '/osh/payouts',
          data: JSON.stringify({
            description: this.$id('description').val().trim(),
            options: this.model.get('options'),
            payouts
          })
        });

        req.fail(() =>
        {
          viewport.msg.savingFailed();

          this.$id('submit').prop('disabled', false);
        });

        req.done(payout =>
        {
          viewport.msg.saved();
          viewport.closeDialog();

          this.trigger('saved', payout);
        });
      }

    },

    initialize: function()
    {
      this.payouts = this.model.getPayouts();
    },

    getTemplateData: function()
    {
      return {
        currencyFormatter: dictionaries.currencyFormatter,
        payouts: this.payouts,
        options: this.serializeOptions(),
        totals: this.calcTotals()
      };
    },

    serializeOptions: function()
    {
      const companies = this.model.get('companies');
      const options = this.model.get('options');

      return {
        type: options.type,
        company: options.company.map(id => companies[id] || id)
      };
    },

    calcTotals: function()
    {
      const totals = {
        count: 0,
        amount: 0
      };

      this.payouts.forEach(p =>
      {
        totals.count += p.payout[0];
        totals.amount += p.payout[1];
      });

      return totals;
    }

  });
});
