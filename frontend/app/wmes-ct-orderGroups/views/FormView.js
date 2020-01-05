// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/core/views/FormView',
  'app/wmes-ct-orderGroups/templates/form'
], function(
  _,
  $,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({



    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);


    },

    afterRender: function()
    {
      var view = this;

      FormView.prototype.afterRender.apply(view, arguments);
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      ['nameInclude', 'nameExclude', 'bomInclude', 'bomExclude'].forEach(function(prop)
      {
        formData[prop] = (formData[prop] || [])
          .map(function(words) { return words.join('; '); })
          .join('\n');
      });

      ['nc12Include', 'nc12Exclude'].forEach(function(prop)
      {
        formData[prop] = (formData[prop] || []).join('; ');
      });

      return formData;
    },

    serializeForm: function(formData)
    {
      ['nameInclude', 'nameExclude', 'bomInclude', 'bomExclude'].forEach(function(prop)
      {
        formData[prop] = (formData[prop] || '')
          .split('\n')
          .map(function(line)
          {
            return line.split(/; ?/).filter(function(word) { return word.trim().length > 0; });
          })
          .filter(function(words)
          {
            return words.length > 0;
          });
      });

      ['nc12Include', 'nc12Exclude'].forEach(function(prop)
      {
        formData[prop] = (formData[prop] || '')
          .split(/[\s,;]+/)
          .filter(function(word)
          {
            return word.length === 7 || word.length === 12;
          });
      });

      return formData;
    }

  });
});
