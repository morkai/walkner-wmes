// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/planning/templates/orderLinesDialog'
], function(
  _,
  t,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      }

    },

    serialize: function()
    {
      var order = this.order;

      return {
        idPrefix: this.idPrefix,
        orderNo: order.id,
        mrp: order.get('mrp'),
        kind: order.get('kind')
      };
    },

    afterRender: function()
    {
      var kind = this.order.get('kind');
      var availableLines = [];
      var data = this.plan.settings.mrps.get(this.order.get('mrp')).lines
        .filter(function(mrpLineSettings)
        {
          return _.includes(mrpLineSettings.get('orderPriority'), kind);
        })
        .map(function(mrpLineSettings)
        {
          availableLines.push(mrpLineSettings.id);

          return {
            id: mrpLineSettings.id,
            text: mrpLineSettings.id
          };
        });

      var lines = _.intersection(this.order.get('lines') || [], availableLines).join(',');

      this.$id('lines').val(lines).select2({
        allowClear: true,
        placeholder: ' ',
        data: data
      });
    },

    submitForm: function()
    {
      var view = this;
      var $submit = view.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      var req = view.ajax({
        method: 'PATCH',
        url: '/planning/plans/' + view.plan.id + '/orders/' + view.order.id,
        data: JSON.stringify({
          lines: this.$id('lines').val().split(',').filter(function(v) { return v.length > 0; })
        })
      });

      req.done(viewport.closeDialog);
      req.fail(function()
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('planning', 'orders:menu:lines:failure')
        });

        view.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('lines').select2('focus');
    }

  });
});
