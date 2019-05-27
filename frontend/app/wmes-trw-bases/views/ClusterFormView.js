// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/views/FormView',
  'app/wmes-trw-bases/templates/clusterForm'
], function(
  _,
  $,
  viewport,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'click #-image-preview': function()
      {
        this.$id('image-upload').click();
      },

      'change #-image-upload': function(e)
      {
        if (e.target.files.length)
        {
          this.uploadImage(e.target.files[0]);
        }
      },

      'click #-image-clear': function()
      {
        this.$id('image-preview').prop('src', '');
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      $(window).on('paste.' + this.idPrefix, this.onPaste.bind(this));
    },

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
      formData.image = this.$id('image-preview').prop('src');

      if (!/^data:image/.test(formData.image))
      {
        formData.image = '';
      }

      this.model.set(formData);

      viewport.closeDialog();
    },

    onPaste: function(e)
    {
      var dt = e.originalEvent.clipboardData;

      if (dt && dt.files && dt.files.length)
      {
        this.uploadImage(dt.files[0]);
      }
    },

    uploadImage: function(file)
    {
      if (!/^image/.test(file.type))
      {
        return;
      }

      var $preview = this.$id('image-preview');
      var $submit = this.$id('submit').prop('disabled', true);

      var reader = new FileReader();

      reader.onload = function(e)
      {
        $preview.prop('src', e.target.result);
      };

      reader.readAsDataURL(file);

      var formData = new FormData();

      formData.append('image', file);

      var req = this.ajax({
        type: 'POST',
        url: '/trw/bases;prepare-image',
        data: formData,
        processData: false,
        contentType: false
      });

      req.fail(function()
      {
        if (req.statusText !== 'abort')
        {
          $preview.prop('src', '');
        }
      });

      req.done(function(res)
      {
        $preview.prop('src', res.src);
      });

      req.always(function()
      {
        $submit.prop('disabled', false);
      });
    }

  });
});
