// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/core/views/FormView',
  'app/printers/templates/form'
], function(
  $,
  FormView,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$id('name').attr('readonly', true);
        this.$id('label').focus();
      }
      else
      {
        this.loadSystemPrinters();
      }
    },

    loadSystemPrinters: function()
    {
      var view = this;

      view.ajax({url: '/printing/systemPrinters'}).done(function(res)
      {
        view.$id('name').removeClass('form-control').select2({
          width: '100%',
          placeholder: ' ',
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
    }

  });
});
