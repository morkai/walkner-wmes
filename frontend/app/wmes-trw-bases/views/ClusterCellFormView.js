// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'select2',
  'app/viewport',
  'app/core/views/FormView',
  'app/wmes-trw-bases/templates/clusterCellForm'
], function(
  select2,
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

      this.$id('io').select2({
        allowClear: true,
        multiple: true,
        data: (this.options.io || []).map(function(io)
        {
          return {
            id: io._id,
            text: io._id + ': ' + io.name + ' ' + io.device + ':' + io.channel,
            io: io
          };
        }),
        formatResult: function(item, $container, query, e)
        {
          var io = item.io;

          var html = ['<code>'];
          select2.util.markMatch(io._id, query.term, html, e);
          html.push('</code>: ');
          select2.util.markMatch(io.name, query.term, html, e);
          html.push(' [');
          select2.util.markMatch(io.device + ':' + io.channel, query.term, html, e);
          html.push(']');

          return html.join('');
        },
        formatSelection: function(item, $container, e)
        {
          return e(item.io.name);
        }
      });
    },

    onDialogShown: function()
    {
      this.$id('label').focus();
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.io = formData.io.join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      if (!formData.label)
      {
        formData.label = '';
      }

      formData.io = (formData.io || '').split(',').filter(function(v) { return !!v; });

      if (!Array.isArray(formData.endpoints))
      {
        formData.endpoints = [];
      }

      return formData;
    },

    submitRequest: function($submit, formData)
    {
      this.model.set(formData);

      viewport.closeDialog();
    }

  });
});
