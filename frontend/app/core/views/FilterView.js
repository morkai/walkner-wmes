// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'js2form',
  'h5.rql/specialTerms',
  'app/i18n',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/core/templates/filterLimit',
  'select2'
], function(
  _,
  $,
  js2form,
  specialTerms,
  t,
  View,
  buttonGroup,
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
      },
      'click .filter-toggle': 'toggle'
    },

    collapsed: false,

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
      return buttonGroup.toggle(this.$id(groupName));
    },

    getButtonGroupValue: function(groupName)
    {
      return buttonGroup.getValue(this.$id(groupName));
    },

    afterRender: function()
    {
      this.formData = this.serializeQueryToForm();

      js2form(this.el, this.formData);

      this.$toggleFilter = $('<button class="btn btn-default btn-block filter-toggle" type="button"></button>')
        .append('<i class="fa"></i>')
        .append('<span></span>');

      this.$el.append(this.$toggleFilter);

      this.toggle();
    },

    toggle: function()
    {
      if (window.innerWidth < 768)
      {
        this.collapsed = !this.collapsed;

        this.$el.toggleClass('is-collapsed', this.collapsed);
      }

      this.$toggleFilter.find('span').text(t('core', 'filter:' + (this.collapsed ? 'show' : 'hide')));
      this.$toggleFilter.find('.fa')
        .removeClass('fa-caret-up fa-caret-down')
        .addClass('fa-caret-' + (this.collapsed ? 'down' : 'up'));
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

    serializeRegexTerm: function(selector, property, maxLength, replaceRe, ignoreCase)
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

      var args = [property, value];

      if (value === null || (!ignoreCase && value.length === maxLength))
      {
        selector.push({name: 'eq', args: args});

        return;
      }

      if (value.length === 0)
      {
        return;
      }

      if (ignoreCase)
      {
        args.push('i');
      }

      args[1] = args[1].replace(/[-[\]{}()*+!<=:?.\/\\^$|#\s,]/g, '\\$&');

      if (value.length === maxLength)
      {
        args[1] = '^' + args[1] + '$';
      }

      selector.push({name: 'regex', args: args});
    }

  });
});
