define([
  'underscore',
  'app/data/divisions',
  'app/core/views/FormView',
  'app/subdivisions/templates/form',
  'i18n!app/nls/divisions'
], function(
  _,
  divisions,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'subdivisionForm',

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        divisions: divisions.toJSON()
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('division').select2();
    }

  });
});
