// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'js2form',
  'h5.rql/specialTerms',
  'app/i18n',
  'app/core/View',
  'app/core/util',
  'app/core/util/buttonGroup',
  'app/core/templates/filterLimit',
  'app/core/templates/filterButton',
  'select2'
], function(
  _,
  $,
  js2form,
  specialTerms,
  t,
  View,
  util,
  buttonGroup,
  filterLimitTemplate,
  filterButtonTemplate
) {
  'use strict';

  return View.extend({

    minLimit: 5,
    maxLimit: 100,
    termToForm: {},
    defaultFormData: {},
    formData: null,
    filterList: [],
    filterMap: {},

    localTopics: {
      'viewport.resized': function()
      {
        this.repositionResetButton();
      }
    },

    events: {

      'submit': function()
      {
        this.changeFilter();

        return false;
      },

      'click .filter-toggle': 'toggleExpand',

      'click a[data-filter]': function(e)
      {
        e.preventDefault();

        this.showFilter(e.currentTarget.dataset.filter);
      },

      'click #-reset': 'resetFilters',

      'keydown input, select': function(e)
      {
        if (e.key === 'Escape')
        {
          this.resetFilter(this.$(e.target));
        }
      }

    },

    collapsed: false,

    serialize: function()
    {
      var view = this;

      return _.assign(View.prototype.serialize.apply(view, arguments), {
        filterList: _.result(this, 'filterList'),
        renderLimit: function(templateData)
        {
          return view.renderPartialHtml(filterLimitTemplate, _.assign({
            min: view.minLimit,
            max: view.maxLimit,
            hidden: false
          }, templateData));
        },
        renderButton: function(templateData)
        {
          return view.renderPartialHtml(filterButtonTemplate, _.assign({
            filters: _.result(view, 'filterList'),
            reset: false
          }, templateData));
        }
      });
    },

    toggleButtonGroup: function(groupName)
    {
      return buttonGroup.toggle(this.$id(groupName));
    },

    getButtonGroupValue: function(groupName, defaultValue)
    {
      return buttonGroup.getValue(this.$id(groupName)) || defaultValue;
    },

    afterRender: function()
    {
      this.formData = this.serializeQueryToForm();

      js2form(this.el, this.formData);

      this.$resetFilter = this.$id('reset');

      if (_.result(this, 'filterList').length)
      {
        this.$id('limit').parent().attr('data-filter', 'limit');
      }

      this.$toggleFilter = $('<button class="btn btn-default btn-block filter-toggle" type="button"></button>')
        .append('<i class="fa"></i>')
        .append('<span></span>');

      this.$el.append(this.$toggleFilter);

      this.toggleExpand();
      this.toggleFilters();
    },

    toggleExpand: function()
    {
      if (window.innerWidth < 768)
      {
        this.collapsed = !this.collapsed;

        this.$el
          .toggleClass('is-collapsed', this.collapsed)
          .toggleClass('is-expanded', !this.collapsed);
      }

      this.$toggleFilter.find('span').text(t('core', 'filter:' + (this.collapsed ? 'show' : 'hide')));
      this.$toggleFilter.find('.fa')
        .removeClass('fa-caret-up fa-caret-down')
        .addClass('fa-caret-' + (this.collapsed ? 'down' : 'up'));

      this.repositionResetButton();
    },

    repositionResetButton: function()
    {
      if (!this.$resetFilter || !this.$resetFilter.length)
      {
        return;
      }

      if (window.innerWidth < 768)
      {
        this.$resetFilter.insertBefore(this.$toggleFilter).toggleClass('hidden', this.collapsed);
      }
      else
      {
        this.$resetFilter.insertAfter(this.$('.btn[type="submit"]')).removeClass('hidden');
      }
    },

    toggleFilters: function()
    {
      var view = this;

      _.result(view, 'filterList').forEach(function(filter)
      {
        view.$('.form-group[data-filter="' + filter + '"]').toggleClass('hidden', !view.filterHasValue(filter));
      });
    },

    filterHasValue: function(filter)
    {
      var $input = this.$id(filter);
      var value;

      if ($input.hasClass('btn-group'))
      {
        value = $input.find('input:checked').val();
      }
      else if ($input.find('.orgUnits-picker').length)
      {
        value = $input.find('.btn.active').length === 1;
      }
      else
      {
        value = $input.val();
      }

      if (filter === 'limit')
      {
        return +value !== _.result(this.model, 'getDefaultPageLimit', 20);
      }

      if (!value)
      {
        return false;
      }

      if (value.length)
      {
        return true;
      }

      return !!value;
    },

    showFilter: function(filter)
    {
      var $group = this.$('.form-group[data-filter="' + (this.filterMap[filter] || filter) + '"]');

      $group
        .removeClass('hidden')
        .find('input, select')
        .first()
        .focus();

      if ($group.find('.orgUnits-picker').length)
      {
        $group.find('.btn').click();
      }
    },

    serializeQueryToForm: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = _.assign({}, _.result(this, 'defaultFormData'), {
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
      if (!term || !Array.isArray(term.args))
      {
        return;
      }

      var propertyName = typeof term.args[0] === 'string' ? term.args[0] : null;
      var termToForm = this.termToForm['@' + term.name] || this.termToForm[propertyName];

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

    isValid: function()
    {
      return true;
    },

    changeFilter: function()
    {
      if (!this.isValid())
      {
        return;
      }

      var rqlQuery = this.model.rqlQuery;
      var selector = [];
      var $limit = this.$id('limit');

      this.copyPopulateTerms(selector);
      this.serializeFormToQuery(selector, rqlQuery);

      this.trigger('filtering', selector, rqlQuery);

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.skip = 0;

      if ($limit.length)
      {
        rqlQuery.limit = Math.min(Math.max(parseInt(this.$id('limit').val(), 10) || 15, this.minLimit), this.maxLimit);
      }

      this.trigger('filterChanged', rqlQuery);
      this.toggleFilters();
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

    serializeFormToQuery: function(selector, rqlQuery) // eslint-disable-line no-unused-vars
    {

    },

    serializeEqTerm: function(selector, property)
    {
      var $el = this.$id(property.replace(/\./g, '-'));
      var value = $el.val().trim();

      if (value === '-')
      {
        selector.push({name: 'eq', args: [property, null]});
      }
      else if (value.length)
      {
        selector.push({name: 'eq', args: [property, value]});
      }
    },

    serializeRegexTerm: function(selector, property, maxLength, replaceRe, ignoreCase, startAnchor)
    {
      var $el = this.$id(property.replace(/\./g, '-'));
      var value = $el.val().trim();

      if (value !== '-' && replaceRe !== null)
      {
        value = value.replace(replaceRe === undefined ? /[^0-9]+/g : replaceRe, '');
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

      args[1] = this.escapeRegExp(args[1]);

      if (value.length === maxLength)
      {
        args[1] = '^' + args[1] + '$';
      }
      else if (startAnchor)
      {
        args[1] = '^' + args[1];
      }

      selector.push({name: 'regex', args: args});
    },

    escapeRegExp: function(string)
    {
      return util.escapeRegExp(string);
    },

    unescapeRegExp: function(string)
    {
      return util.unescapeRegExp(string, true);
    },

    resetFilters: function()
    {
      var view = this;

      view.$('.form-group').each(function()
      {
        view.resetFilter($(this).find('input, select').first());
      });

      view.$('button[type="submit"]').click();
    },

    resetFilter: function($el) // eslint-disable-line no-unused-vars
    {
      if ($el.prop('name') === 'limit')
      {
        $el.val(_.result(this.model, 'getDefaultPageLimit', 20));
      }
    }

  });
});
