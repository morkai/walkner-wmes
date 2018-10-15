// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/orders/templates/commentForm'
], function(
  _,
  user,
  FormView,
  idAndLabel,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    updateOnChange: false,

    events: _.assign({

      'change #-delayReason': 'handleDelayReason',
      'change input[name="m4"]': 'handleDelayReason'

    }, FormView.prototype.events),

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('delayReason').select2({
        allowClear: true,
        placeholder: ' ',
        data: this.delayReasons
          .filter(function(m) { return m.get('active'); })
          .map(idAndLabel)
      });

      var painter = user.isAllowedTo('PAINT_SHOP:PAINTER');
      var whman = user.isAllowedTo('PLANNING:WHMAN');
      var source = (painter && whman) || (!painter && !whman) ? 'other' : whman ? 'wh' : 'ps';

      this.$('input[name="source"][value="' + source + '"]').prop('checked', true);
      this.$id('comment').val('');
    },

    request: function(formData)
    {
      if (!formData.delayReason)
      {
        formData.delayReason = '';
        formData.m4 = '';
      }

      return this.ajax({
        type: 'POST',
        url: '/orders/' + this.model.id,
        data: JSON.stringify(formData)
      });
    },

    handleSuccess: function()
    {
      this.$id('comment').val('').focus();
    },

    handleDelayReason: function(e)
    {
      var delayReasonId = this.$id('delayReason').val();
      var m4 = this.$id('input[name="m4"]:checked').val() || '';
      var delayReason = this.delayReasons.get(delayReasonId);
      var hasDelayReason = !!delayReason;
      var changingDelayReason = delayReasonId !== (this.model.get('delayReason') || '');
      var changingM4 = m4 !== (this.model.get('m4') || '');
      var changing = changingDelayReason || changingM4;

      this.$('input[name="m4"]')
        .prop('required', hasDelayReason)
        .closest('.form-group')
        .find('.control-label')
        .toggleClass('is-required', hasDelayReason);

      if (e.target.name === 'delayReason')
      {
        if (delayReason)
        {
          var drm = delayReason.get('drm');
          var defaultM4 = Object.keys(drm).filter(function(m4) { return !!drm[m4]; }).shift() || 'man';

          this.$('input[name="m4"][value="' + defaultM4 + '"]').prop('checked', true);
        }
        else
        {
          this.$('input[name="m4"]:checked').prop('checked', false);
        }
      }

      this.$id('submit-comment').toggleClass('hidden', changing);
      this.$id('submit-edit').toggleClass('hidden', !changing);
      this.$id('comment')
        .prop('required', !changing)
        .prev()
        .toggleClass('is-required', !changing);
    }

  });
});
