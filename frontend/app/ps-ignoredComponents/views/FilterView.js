// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/ps-ignoredComponents/templates/filter'
], function(
  _,
  FilterView,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    defaultFormData: {
      _id: '',
      mrps: '',
      name: ''
    },

    termToForm: {
      'mrps': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1].join(',') : term.args[1];
      },
      '_id': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = this.unescapeRegExp(term.args[1]);
        }
      },
      'name': '_id'
    },

    serializeFormToQuery: function(selector)
    {
      var view = this;
      var mrps = this.$id('mrps').val().split(',').filter(function(v) { return !!v.length; });

      if (mrps.length)
      {
        selector.push({name: 'in', args: ['mrps', mrps]});
      }

      ['_id', 'name'].forEach(function(prop)
      {
        view.serializeRegexTerm(selector, prop, -1, null, true, false);
      });
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      setUpMrpSelect2(this.$id('mrps'), {
        view: this,
        own: false
      });
    }

  });
});
