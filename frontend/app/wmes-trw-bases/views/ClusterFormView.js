// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/FormView',
  'app/wmes-trw-bases/templates/clusterForm'
], function(
  viewport,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      if (this.model.id)
      {
        this.$id('id').prop('disabled', true);
      }
    },

    onDialogShown: function()
    {
      if (this.model.id)
      {
        this.$id('label-text').focus();
      }
      else
      {
        this.$id('id').focus();
      }
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.cols = formData.rows.length ? formData.rows[0].length : 1;
      formData.rows = formData.rows.length || 1;

      return formData;
    },

    serializeForm: function(formData)
    {
      if (!formData.label.text)
      {
        formData.label.text = '';
      }

      formData.top = parseInt(formData.top, 10) || 0;
      formData.left = parseInt(formData.left, 10) || 0;
      formData.rows = parseInt(formData.rows, 10) || 1;
      formData.cols = parseInt(formData.cols, 10) || 1;

      return formData;
    },

    submitRequest: function($submit, formData)
    {
      var oldRows = this.model.get('rows');
      var newRows = [];

      for (var r = 0; r < formData.rows; ++r)
      {
        var oldRow = oldRows[r] || [];
        var newRow = [];

        for (var c = 0; c < formData.cols; ++c)
        {
          newRow.push(oldRow[c] || {
            label: (r + 1 + c * formData.rows).toString(),
            io: [],
            endpoints: []
          });
        }

        newRows.push(newRow);
      }

      delete formData.cols;

      formData.rows = newRows;

      this.model.set(formData);

      viewport.closeDialog();
    }

  });
});
