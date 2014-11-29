// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

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

    events: _.extend({}, FormView.prototype.events, {
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

      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');

      if (this.$colorPicker !== null)
      {
        this.$colorPicker.colorpicker('destroy');
        this.$colorPicker = null;
      }
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
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
        data: this.model.topLevelTasks.map(function(prodTask)
        {
          return {
            id: prodTask.id,
            text: prodTask.getLabel(),
            prodTask: prodTask
          };
        })
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
        var parentTask = parent.prodTask;

        data.tags = parentTask.get('tags');
        data.clipColor = parentTask.get('clipColor');
        data.fteDiv = parentTask.get('fteDiv');
        data.inProd = parentTask.get('inProd');
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

      if (!parent)
      {
        this.$id('tags').select2('enable', true);
        this.$id('clipColor').prop('disabled', false);
        this.$id('fteDiv').prop('disabled', false);
        this.$id('inProd').prop('disabled', false);

        return;
      }

      var parentTask = parent.prodTask;

      this.$id('tags').select2('enable', false).select2('val', parentTask.get('tags'));
      this.$id('clipColor').prop('disabled', true);
      this.$id('fteDiv').prop('disabled', true).prop('checked', parentTask.get('fteDiv'));
      this.$id('inProd').prop('disabled', true).prop('checked', parentTask.get('inProd'));

      this.$colorPicker.colorpicker('setValue', parentTask.get('clipColor'));
    }

  });
});
