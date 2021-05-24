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

        const selected = new Set();

        this.$('input[name="users[]"]:checked').each((i, el) => selected.add(el.value));

        if (!selected.size)
        {
          viewport.closeDialog();

          return;
        }

        viewport.msg.saving();

        const payouts = [];

        this.model.payouts.forEach(payout =>
        {
          if (selected.has(payout.recipient.id))
          {
            payouts.push({
              recipient: payout.recipient.id,
              entries: payout.unpaid
            });
          }
        });

        const req = this.ajax({
          method: 'POST',
          url: '/osh/rewards;payout',
          data: JSON.stringify({
            payouts
          })
        });

        req.fail(() =>
        {
          viewport.msg.savingFailed();

          this.$id('submit').prop('disabled', false);
        });

        req.done(() =>
        {
          viewport.msg.saved();
          viewport.closeDialog();

          this.trigger('saved');
        });
      },

      'change input[name="users[]"]': function()
      {
        this.updateTotals();
      },

      'change #-toggle': function(e)
      {
        this.$('tbody').find('input').prop('checked', e.target.checked);

        this.updateTotals();
      }

    },

    getTemplateData: function()
    {
      return {
        currencyFormatter: dictionaries.currencyFormatter,
        payouts: this.model.payouts,
        totals: this.calcTotals(false)
      };
    },

    getSelected: function()
    {
      const selected = new Set();

      this.$('input[name="users[]"]:checked').each((i, el) => selected.add(el.value));

      return selected;
    },

    calcTotals: function(selectedOnly)
    {
      const totals = {
        count: 0,
        amount: 0
      };
      const selected = selectedOnly ? this.getSelected() : null;

      this.model.payouts.forEach(p =>
      {
        if (selected && !selected.has(p.recipient.id))
        {
          return;
        }

        totals.count += p.payout[0];
        totals.amount += p.payout[1];
      });

      return totals;
    },

    updateTotals: function()
    {
      const totals = this.calcTotals(true);

      this.$id('totalCount').text(totals.count.toLocaleString());
      this.$id('totalAmount').text(dictionaries.currencyFormatter.format(totals.amount));
    }

  });
});
