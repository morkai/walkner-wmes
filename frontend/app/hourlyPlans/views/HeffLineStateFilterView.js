// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/user',
  'app/data/orgUnits',
  'app/core/util/idAndLabel',
  'app/core/views/FilterView',
  'app/hourlyPlans/templates/heffLineStateFilter'
], function(
  _,
  user,
  orgUnits,
  idAndLabel,
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'change #-division': 'updateProdFlows'

    }, FilterView.prototype.events),

    defaultFormData: {
      division: '',
      prodFlows: []
    },

    termToForm: {
      'division': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$id('division').select2({
        width: '150px',
        allowClear: true,
        placeholder: ' ',
        data: orgUnits
          .getAllByType('division')
          .filter(function(d) { return !d.get('deactivatedAt') && d.get('type') === 'prod'; })
          .map(idAndLabel)
      });

      this.updateProdFlows();
    },

    serializeFormToQuery: function(selector)
    {
      var division = this.$id('division').val();
      var prodFlows = this.$id('prodFlows').val();

      if (division.length)
      {
        selector.push({name: 'eq', args: ['division', division]});
      }

      if (prodFlows.length)
      {
        selector.push({name: 'in', args: ['prodFlows', prodFlows.split(',')]});
      }
    },

    updateProdFlows: function()
    {
      var division = this.$id('division').val();
      var prodFlows = [];

      orgUnits.getAllByType('subdivision').forEach(function(subdivision)
      {
        if (subdivision.get('type') !== 'assembly' || (division && subdivision.get('division') !== division))
        {
          return;
        }

        var subdivisionFlows = orgUnits
          .getProdFlowsForSubdivision(subdivision)
          .filter(function(prodFlow) { return !prodFlow.get('deactivatedAt'); })
          .map(idAndLabel);

        prodFlows = prodFlows.concat(subdivisionFlows);
      });

      this.$id('prodFlows').select2('data', null).select2({
        width: '800px',
        allowClear: true,
        placeholder: ' ',
        multiple: true,
        data: prodFlows
      });
    }

  });
});
