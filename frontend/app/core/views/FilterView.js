// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'js2form',
  'h5.rql/specialTerms',
  'app/core/View',
  'app/core/templates/filterLimit',
  'select2'
], function(
  _,
  js2form,
  specialTerms,
  View,
  filterLimitTemplate
) {
  'use strict';

  return View.extend({

    minLimit: 5,
    maxLimit: 100,
    termToForm: {},
    defaultFormData: {},
    formData: null,

    events: {
      'submit': function()
      {
        this.changeFilter();

        return false;
      }
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    serialize: function()
    {
      var view = this;

      return {
        idPrefix: this.idPrefix,
        renderLimit: function()
        {
          return filterLimitTemplate({
            idPrefix: view.idPrefix,
            min: view.minLimit,
            max: view.maxLimit
          });
        }
      };
    },

    toggleButtonGroup: function(groupName)
    {
      this.$id(groupName).find('input:checked').parent().addClass('active');
    },

    afterRender: function()
    {
      this.formData = this.serializeQueryToForm();

      js2form(this.el, this.formData);
    },

    serializeQueryToForm: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = _.extend({}, _.result(this, 'defaultFormData'), {
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit)
      });

      rqlQuery.selector.args.forEach(function(term)
      {
        if (!specialTerms[term.name])
        {
          this.serializeTermToForm(term, formData);
        }
      }, this);

      return formData;
    },

    serializeTermToForm: function(term, formData)
    {
      var propertyName = typeof term.args[0] === 'string' ? term.args[0] : null;
      var termToForm = this.termToForm[propertyName];

      if (!termToForm)
      {
        return;
      }

      if (typeof termToForm === 'string')
      {
        termToForm = this.termToForm[termToForm];
      }

      if (typeof termToForm === 'function')
      {
        termToForm.call(this, propertyName, term, formData);
      }
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var selector = [];

      this.copyPopulateTerms(selector);
      this.serializeFormToQuery(selector, rqlQuery);

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.skip = 0;
      rqlQuery.limit = Math.min(Math.max(parseInt(this.$id('limit').val(), 10) || 15, this.minLimit), this.maxLimit);

      this.trigger('filterChanged', rqlQuery);
    },

    copyPopulateTerms: function(selector)
    {
      this.model.rqlQuery.selector.args.forEach(function(term)
      {
        if (term.name === 'populate')
        {
          selector.push(term);
        }
      });
    },

    serializeFormToQuery: function(selector, rqlQuery)
    {
      /*jshint unused:false*/
    },

    serializeRegexTerm: function(selector, property, maxLength, replaceRe)
    {
      var $el = this.$id(property.replace(/\./g, '-'));
      var value = $el.val().trim();

      if (value !== '-' && replaceRe !== null)
      {
        value = value.replace(replaceRe === undefined ? /[^0-9]/g : replaceRe, '');
      }

      $el.val(value);

      if (value === '-')
      {
        value = null;
      }

      if (value === null || value.length === maxLength)
      {
        selector.push({name: 'eq', args: [property, value]});
      }
      else if (value.length > 0)
      {
        selector.push({name: 'regex', args: [property, value]});
      }
    }

  });
});
