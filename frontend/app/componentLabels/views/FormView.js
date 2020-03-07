// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/componentLabels/templates/form'
], function(
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    handleFailure: function(jqXhr)
    {
      var code = jqXhr.responseJSON
        && jqXhr.responseJSON.error
        && jqXhr.responseJSON.error.code;

      if (code === 'DUPLICATE_KEY')
      {
        return this.showErrorMessage(this.t('FORM:ERROR:duplicate'));
      }

      return FormView.prototype.handleFailure.apply(this, arguments);
    }

  });
});
