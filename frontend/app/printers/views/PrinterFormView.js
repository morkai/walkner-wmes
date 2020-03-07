// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/views/FormView',
  '../tags',
  'app/printers/templates/form'
], function(
  $,
  FormView,
  tags,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.once('afterRender', function()
      {
        this.loadSystemPrinters();
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$id('tags').select2({
        width: '100%',
        placeholder: ' ',
        allowClear: true,
        multiple: true,
        data: tags.toSelect2()
      });
    },

    loadSystemPrinters: function()
    {
      var view = this;

      view.$id('name').prop('readonly', true);

      view.ajax({url: '/printing/systemPrinters'}).done(function(res)
      {
        view.$id('name').prop('readonly', false).removeClass('form-control').select2({
          width: '100%',
          placeholder: ' ',
          allowClear: true,
          data: res.collection.map(function(printer)
          {
            return {
              id: printer.name,
              text: !printer.comment.trim() || printer.name === printer.comment
                ? printer.name
                : (printer.comment + ' (' + printer.name + ')')
            };
          })
        });
      });
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.tags = (formData.tags || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.tags = (formData.tags || '').split(',').filter(function(tag) { return tag.length > 0; });

      if (!formData.special)
      {
        formData.special = '';
      }

      if (!formData.name)
      {
        formData.name = '';
      }

      return formData;
    }

  });
});
