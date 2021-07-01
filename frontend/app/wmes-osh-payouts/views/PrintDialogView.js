// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/time',
  'app/core/View',
  'app/core/util/html2pdf',
  'app/wmes-osh-common/dictionaries',
  'app/wmes-osh-payouts/templates/printDialog',
  'app/wmes-osh-payouts/templates/printPage'
], function(
  viewport,
  time,
  View,
  html2pdf,
  dictionaries,
  template,
  printPageTemplate
) {
  'use strict';

  return View.extend({

    template,

    events: {
      'change input[name="period"]': function(e)
      {
        this.$id('period').attr('max', e.target.value === 'month' ? 12 : 4);
      },
      'submit': function()
      {
        const $submit = this.$('.btn[type="submit"]').prop('disabled', true);

        const payout = {
          types: this.model.get('types').map(t => this.t(`type:${t}`)).join(', '),
          companies: this.model.get('companies').map(c => c.label).join(', '),
          period: '',
          pages: []
        };

        const period = this.$id('period').val();
        const year = this.$id('year').val();

        if (this.$('input[name="periodType"]:checked').val() === 'quarter')
        {
          payout.period = this.t('printDialog:period:quarter', {
            quarter: this.t('core', `QUARTER:${period}`),
            year
          });
        }
        else
        {
          payout.period = this.t('printDialog:period:month', {
            month: time.getMoment(`${year}-${period.padStart(2, '0')}-01`, 'YYYY-MM-DD').format('MMMM'),
            year
          });
        }

        const recipients = this.model.get('recipients').map((recipient, i) =>
        {
          return {
            no: i + 1,
            personnelId: recipient.personnelId,
            label: recipient.label,
            department: recipient.department,
            amount: dictionaries.currencyFormatter.format(recipient.amount.total)
          };
        });

        while (recipients.length)
        {
          payout.pages.push({
            no: payout.pages.length + 1,
            recipients: recipients.splice(0, payout.pages.length === 0 ? 51 : 54)
          });
        }

        const html = this.renderPartialHtml(printPageTemplate, {
          dateCreated: time.getMoment().format('L'),
          payout
        });

        html2pdf(html, {
          done: () =>
          {
            $submit.prop('disabled', false);

            viewport.closeDialog();
          }
        });

        return false;
      }
    },

    getTemplateData: function()
    {
      return {
        year: time.format(this.model.get('createdAt'), 'YYYY')
      };
    },

    serializeDescription: function()
    {
      const types = this.model.get('types');

      if (types.length === 1)
      {
        return this.t(`printDialog:description:${types[0]}`);
      }

      return this.t(`printDialog:description:default`);
    },

    afterRender: function()
    {
      this.selectDefaultPeriod();
    },

    selectDefaultPeriod: function()
    {
      const types = this.model.get('types');
      const moment = time.getMoment(this.model.get('createdAt'));

      if (types.length === 1 && types[0] === 'kaizen')
      {
        this.$('input[value="quarter"]').prop('checked', true);
        this.$id('period').val(moment.format('Q')).attr('max', '4');
      }
      else
      {
        this.$('input[value="month"]').prop('checked', true);
        this.$id('period').val(moment.format('M')).attr('max', '12');
      }
    }

  });
});
