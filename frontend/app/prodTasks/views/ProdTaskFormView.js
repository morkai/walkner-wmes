// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/core/templates/colorPicker',
  'app/prodTasks/templates/form',
  'bootstrap-colorpicker',
  'select2'
], function(
  _,
  FormView,
  colorPickerTemplate,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: _.assign({}, FormView.prototype.events, {
      'change #-clipColor': function(e)
      {
        if (e.originalEvent)
        {
          this.$colorPicker.colorpicker('setValue', e.target.value);
        }
      },
      'change #-parent': 'toggleParentFields'
    }),

    $colorPicker: null,

    destroy: function()
    {
      FormView.prototype.destroy.call(this);

      if (this.$colorPicker !== null)
      {
        this.$colorPicker.colorpicker('destroy');
        this.$colorPicker = null;
      }
    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        renderColorPicker: colorPickerTemplate
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$colorPicker = this.$('.colorpicker-component').colorpicker();

      this.$id('tags').select2({
        tags: this.model.allTags || [],
        tokenSeparators: [',']
      });

      this.$id('parent').select2({
        allowClear: true,
        placeholder: ' ',
        data: this.model.allTasks.serializeToSelect2(this.model.id)
      });

      this.toggleParentFields();
    },

    serializeToForm: function()
    {
      var data = this.model.toJSON();

      data.tags = data.tags ? data.tags.join(',') : '';
      data.parent = data.parent ? data.parent._id : '';

      return data;
    },

    serializeForm: function(data)
    {
      var parent = this.$id('parent').select2('data');

      if (parent)
      {
        data.tags = parent.prodTask.get('tags');
      }
      else
      {
        data.tags = typeof data.tags === 'string' ? data.tags.split(',') : [];
        data.parent = null;
      }

      return data;
    },

    toggleParentFields: function()
    {
      var parent = this.$id('parent').select2('data');

      if (parent)
      {
        this.$id('tags').select2('enable', false).select2('val', parent.prodTask.get('tags'));
      }
      else
      {
        this.$id('tags').select2('enable', true);
      }
    }

  });
});
