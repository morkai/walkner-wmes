define([
  'underscore',
  'app/data/aors',
  'app/core/views/FormView',
  'app/prodTasks/templates/form',
  'i18n!app/nls/prodTasks'
], function(
  _,
  aors,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'prodTaskForm',

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$('#' + this.idPrefix + '-aors').select2();
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        aors: aors.toJSON()
      });
    }

  });
});
