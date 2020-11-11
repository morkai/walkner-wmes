// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/core/util/formatResultWithDescription',
  'app/data/orgUnits',
  'app/wh/templates/pickup/forceLine'
], function(
  _,
  View,
  formatResultWithDescription,
  orgUnits,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    nlsDomain: 'wh',

    events: {
      'submit': function()
      {
        this.trigger('picked', {
          forceLine: this.$id('forceLine').val(),
          redirLine: this.$id('redirLine').val(),
          forceDelivery: this.$id('forceDelivery').prop('checked'),
          card: this.$id('card').val().trim()
        });

        return false;
      }
    },

    getTemplateData: function()
    {
      return {
        card: this.model.personnelId
      };
    },

    afterRender: function()
    {
      this.$id('forceLine').select2({
        width: '100%',
        data: this.model.whLines
          .map(function(whLine)
          {
            var prodLine = orgUnits.getByTypeAndId('prodLine', whLine.id);

            return {
              id: whLine.id,
              text: whLine.id,
              description: prodLine ? prodLine.get('description') : ''
            };
          })
          .sort(function(a, b)
          {
            return a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true});
          }),
        formatResult: formatResultWithDescription.bind(null, 'text', 'description')
      });

      this.$id('redirLine').select2({
        width: '100%',
        allowClear: true,
        data: orgUnits.getActiveByType('prodLine')
          .filter(function(prodLine)
          {
            var subdivision = orgUnits.getSubdivisionFor(prodLine);

            return !!subdivision && subdivision.get('type') === 'assembly';
          })
          .map(function(prodLine)
          {
            return {
              id: prodLine.id,
              text: prodLine.id,
              description: prodLine.get('description')
            };
          })
          .sort(function(a, b)
          {
            return a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true});
          }),
        formatResult: formatResultWithDescription.bind(null, 'text', 'description')
      });
    },

    getCard: function()
    {
      return this.$id('card').val().trim();
    },

    setCard: function(card)
    {
      if (this.getCard() === card)
      {
        this.$id('submit').click();
      }
      else
      {
        this.$id('card').val(card);
      }
    }

  });
});
