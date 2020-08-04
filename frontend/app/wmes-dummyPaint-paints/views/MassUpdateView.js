// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/FormView',
  'app/wmes-dummyPaint-paints/templates/massUpdate'
], function(
  viewport,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    nlsDomain: 'wmes-dummyPaint-paints',

    events: Object.assign({

      'change #-code': 'checkRequiredFields',
      'change #-old12': 'checkRequiredFields'

    }, FormView.prototype.events),

    request: function(formData)
    {
      return this.ajax({
        method: 'POST',
        url: '/dummyPaint/paints;massUpdate',
        data: JSON.stringify(formData)
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.checkRequiredFields();
    },

    checkRequiredFields: function()
    {
      var $code = this.$id('code');
      var $old12 = this.$id('old12');

      $code[0].setCustomValidity($code.val().length || $old12.val().length ? '' : this.t('massUpdate:required'));
    },

    getFailureText: function()
    {
      return this.t('massUpdate:failure');
    },

    handleSuccess: function()
    {
      viewport.closeDialog();
    }

  });
});
