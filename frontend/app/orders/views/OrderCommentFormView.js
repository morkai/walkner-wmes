// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/orders/templates/commentForm'
], function(
  _,
  FormView,
  idAndLabel,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.extend({
      'change #-delayReason': function(e)
      {
        var changingDelayReason = e.target.value !== (this.model.get('delayReason') || '');

        this.$id('submit-comment').toggleClass('hidden', changingDelayReason);
        this.$id('submit-edit').toggleClass('hidden', !changingDelayReason);
        this.$id('comment')
          .prop('required', !changingDelayReason)
          .prev()
          .toggleClass('is-required', !changingDelayReason);
      }
    }, FormView.prototype.events),

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('delayReason').select2({
        allowClear: true,
        placeholder: ' ',
        data: this.delayReasons.map(idAndLabel)
      });
    },

    request: function(formData)
    {
      if (!formData.delayReason)
      {
        formData.delayReason = '';
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
    }

  });
});
