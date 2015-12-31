// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/prodChangeRequests/templates/filter'
], function(
  _,
  time,
  FilterView,
  idAndLabel,
  orgUnits,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.extend({

      'change #-division': function()
      {
        this.$id('prodLine').select2('val', '');
      },
      'change #-prodLine': function()
      {
        this.$id('division').select2('val', '');
      }

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        division: '',
        prodLine: '',
        status: 'new'
      };
    },

    termToForm: {
      'division': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'status': function(propertyName, term, formData)
      {
        formData.status = term.name === 'eq' ? 'new' : 'old';
      },
      'prodLine': 'division'
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('status');

      this.$id('division').select2({
        width: 175,
        allowClear: true,
        placeholder: ' ',
        data: orgUnits.getAllByType('division')
          .filter(function(d) { return d.get('type') === 'prod'; })
          .map(idAndLabel)
      });

      this.$id('prodLine').select2({
        width: 175,
        allowClear: true,
        placeholder: ' ',
        data: orgUnits.getAllByType('prodLine')
          .filter(function(prodLine)
          {
            if (prodLine.get('deactivatedAt'))
            {
              return false;
            }

            var divisionId = orgUnits.getAllForProdLine(prodLine).division;
            var division = orgUnits.getByTypeAndId('division', divisionId);

            return division.get('type') === 'prod';
          })
          .map(idAndLabel)
      });
    },

    serializeFormToQuery: function(selector, rqlQuery)
    {
      var division = this.$id('division').val();
      var prodLine = this.$id('prodLine').val();
      var status = this.getButtonGroupValue('status');

      if (division)
      {
        selector.push({name: 'eq', args: ['division', division]});
      }

      if (prodLine)
      {
        selector.push({name: 'eq', args: ['prodLine', prodLine]});
      }

      if (status === 'old')
      {
        selector.push({name: 'in', args: ['status', ['accepted', 'rejected']]});

        rqlQuery.sort = {_id: -1};
      }
      else
      {
        selector.push({name: 'eq', args: ['status', 'new']});

        rqlQuery.sort = {prodLine: 1, _id: 1};
      }
    }

  });
});
