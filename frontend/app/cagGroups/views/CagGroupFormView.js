// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  'app/core/templates/colorPicker',
  'app/cagGroups/templates/form',
  'bootstrap-colorpicker'
], function(
  _,
  FormView,
  colorPickerTemplate,
  template
) {
  'use strict';

  function cagToSelect2(cag)
  {
    if (typeof cag === 'string')
    {
      return {
        id: cag,
        text: cag
      };
    }

    return {
      id: cag._id,
      text: cag._id + ' - ' + cag.name
    };
  }

  return FormView.extend({

    template: template,

    events: _.assign({
      'change [name=color]': 'updateColorPicker'
    }, FormView.prototype.events),

    destroy: function()
    {
      this.$('.colorpicker-component').colorpicker('destroy');
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('name').focus();
      }

      this.$id('color').parent().colorpicker();

      this.$id('cags').select2({
        multiple: true,
        ajax: {
          cache: true,
          quietMillis: 300,
          url: function(term)
          {
            var url = '/cags' + '?sort(name)';

            if (term)
            {
              if (/^[0-9]+$/.test(term))
              {
                if (term.length === 6)
                {
                  url += '&_id=string:' + term;
                }
                else
                {
                  url += '&regex(_id,string:' + term + ')';
                }
              }
              else
              {
                url += '&regex(name,' + encodeURIComponent(term) + ',i)';
              }
            }

            return url;
          },
          results: function(data)
          {
            return {
              results: (data.collection || []).map(cagToSelect2)
            };
          }
        }
      }).select2('data', (this.model.get('cags') || []).map(cagToSelect2));
    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        renderColorPicker: colorPickerTemplate
      });
    },

    serializeForm: function(formData)
    {
      formData.cags = (formData.cags || '').split(',').filter(function(d) { return !!d; });

      return formData;
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.cags = (formData.cags || []).join(',');

      return formData;
    },

    updateColorPicker: function(e)
    {
      if (e.originalEvent)
      {
        this.$(e.target).closest('.colorpicker-component').colorpicker('setValue', e.target.value);
      }
    }

  });
});
