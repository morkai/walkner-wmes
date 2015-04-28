// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'underscore',
  'js2form',
  'app/core/View',
  'app/data/companies',
  'app/data/prodFunctions',
  'app/reports/templates/report5DisplayOptions',
  'app/core/util/ExpandableSelect'
], function(
  $,
  _,
  js2form,
  View,
  companies,
  prodFunctions,
  displayOptionsTemplate
) {
  'use strict';

  return View.extend({

    template: displayOptionsTemplate,

    events: {
      'submit form': function(e)
      {
        e.preventDefault();
      },
      'change #-series': function(e)
      {
        this.updateSelection('series', e.target);
      },
      'change #-companies': function(e)
      {
        this.updateSelection('companies', e.target, true);
      },
      'change #-prodFunctions': function(e)
      {
        this.updateSelection('prodFunctions', e.target);
      },
      'change #-prodTasks': function(e)
      {
        this.updateSelection('prodTasks', e.target);
      },
      'change #-references': function(e)
      {
        this.updateSelection('references', e.target, true);
      },
      'change [name=extremes]': function()
      {
        this.model.set('extremes', this.$('[name=extremes]:checked').val());
      },
      'click #-showFilter': function()
      {
        this.trigger('showFilter');
      }
    },

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        companies: companies.map(function(company)
        {
          return {
            id: company.id,
            label: company.getLabel()
          };
        }),
        prodFunctions: prodFunctions.map(function(prodFunction)
        {
          return {
            id: prodFunction.id,
            label: prodFunction.getLabel()
          };
        }),
        prodTasks: this.model.prodTasks.map(function(prodTask)
        {
          return {
            id: prodTask.id,
            label: prodTask.getLabel()
          };
        })
      };
    },

    beforeRender: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    afterRender: function()
    {
      js2form(this.el.querySelector('form'), this.serializeFormData());

      this.$('.is-expandable').expandableSelect();

      this.$('[name=extremes]:checked').closest('.btn').addClass('active');
    },

    serializeFormData: function()
    {
      return {
        series: Object.keys(this.model.get('series')),
        extremes: this.model.get('extremes'),
        references: Object.keys(this.model.get('references')),
        companies: Object.keys(this.model.get('companies')),
        prodTasks: Object.keys(this.model.get('prodTasks')),
        prodFunctions: Object.keys(this.model.get('prodFunctions'))
      };
    },

    updateSelection: function(property, selectEl, allowEmpty)
    {
      var selection = {};
      var i;
      var l;

      if (selectEl.selectedOptions.length === 0 && allowEmpty !== true)
      {
        for (i = 0, l = selectEl.length; i < l; ++i)
        {
          selectEl[i].selected = true;
        }
      }

      for (i = 0, l = selectEl.length; i < l; ++i)
      {
        selection[selectEl[i].value] = selectEl[i].selected;
      }

      this.model.set(property, selection);
    },

    shown: function()
    {
      this.$id('series').focus();
    }

  });
});
