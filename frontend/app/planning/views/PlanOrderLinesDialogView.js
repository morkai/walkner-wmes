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

    modelProperty: 'plan',

    events: {

      'submit': function()
      {
        this.submitForm();

        return false;
      },

      'change #-urgent': function()
      {
        this.setUpLinesSelect2();

        if (this.$id('urgent').prop('checked'))
        {
          return;
        }

        var availableLines = this.serializeLines()
          .filter(function(item) { return !item.disabled; })
          .map(function(item) { return item.id; });
        var selectedLines = this.$id('lines').select2('data');

        this.$id('lines').select2('data', selectedLines.filter(function(item)
        {
          return _.includes(availableLines, item.id);
        }));
      }

    },

    getTemplateData: function()
    {
      var order = this.order;

      return {
        orderNo: order.id,
        mrp: order.get('mrp'),
        kind: order.get('kind'),
        urgent: order.get('urgent')
      };
    },

    afterRender: function()
    {
      this.setUpLinesSelect2();

      this.$id('lines').select2('data', (this.order.get('lines') || []).map(function(id)
      {
        return {
          id: id,
          text: id
        };
      }));
    },

    setUpLinesSelect2: function()
    {
      this.$id('lines').select2({
        multiple: true,
        allowClear: true,
        placeholder: ' ',
        data: this.serializeLines()
      });
    },

    serializeLines: function()
    {
      var kind = this.order.get('kind');
      var urgent = this.$id('urgent').prop('checked');

      return this.plan.settings.mrps.get(this.order.get('mrp')).lines
        .map(function(mrpLineSettings)
        {
          return {
            id: mrpLineSettings.id,
            text: mrpLineSettings.id,
            disabled: !urgent && !_.includes(mrpLineSettings.get('orderPriority'), kind)
          };
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
          urgent: this.$id('urgent').prop('checked'),
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
          text: view.t('orders:menu:lines:failure')
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
