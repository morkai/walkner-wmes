define([
  'app/core/views/FormView',
  'app/prodTasks/templates/form'
], function(
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('tags').select2({
        tags: this.model.allTags || [],
        tokenSeparators: [',']
      });
    },

    serializeToForm: function()
    {
      var data = this.model.toJSON();

      data.tags = data.tags ? data.tags.join(',') : '';

      return data;
    },

    serializeForm: function(data)
    {
      data.tags = typeof data.tags === 'string' ? data.tags.split(',') : [];

      return data;
    }

  });
});
