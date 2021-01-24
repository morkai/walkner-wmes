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
          .filter(item => !item.disabled)
          .map(item => item.id);
        var selectedLines = this.$id('lines').select2('data');

        this.$id('lines').select2('data', selectedLines.filter(item => _.includes(availableLines, item.id)));
      }

    },

    getTemplateData: function()
    {
      var order = this.order;

      return {
        version: this.plan.settings.getVersion(),
        orderNo: order.id,
        mrp: order.get('mrp'),
        kind: order.get('kind'),
        urgent: order.get('urgent')
      };
    },

    afterRender: function()
    {
      this.setUpLinesSelect2();

      this.$id('lines').select2('data', (this.order.get('lines') || []).map(id =>
      {
        return {
          id,
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
      var urgent = !!this.$id('urgent').prop('checked');

      if (this.plan.settings.getVersion() > 1)
      {
        urgent = true;
      }

      return this.plan.settings.mrps.get(this.order.get('mrp')).lines
        .map(mrpLineSettings =>
        {
          return {
            id: mrpLineSettings.id,
            text: mrpLineSettings.id,
            disabled: !urgent && !_.includes(mrpLineSettings.get('orderPriority'), kind)
          };
        })
        .sort((a, b) => a.text.localeCompare(b.text, undefined, {numeric: true, ignorePunctuation: true}));
    },

    submitForm: function()
    {
      var $submit = this.$id('submit').prop('disabled', true);
      var $spinner = $submit.find('.fa-spinner').removeClass('hidden');

      viewport.msg.saving();

      var req = this.ajax({
        method: 'PATCH',
        url: '/planning/plans/' + this.plan.id + '/orders/' + this.order.id,
        data: JSON.stringify({
          urgent: !!this.$id('urgent').prop('checked'),
          lines: this.$id('lines').val().split(',').filter(v => !!v.length)
        })
      });

      req.done(() =>
      {
        viewport.msg.saved();
        viewport.closeDialog();
      });

      req.fail(() =>
      {
        $spinner.addClass('hidden');
        $submit.prop('disabled', false);

        viewport.msg.savingFailed();

        this.plan.settings.trigger('errored');
      });
    },

    onDialogShown: function()
    {
      this.$id('lines').select2('focus');
    }

  });
});
