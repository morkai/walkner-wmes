define([
  'underscore',
  'moment',
  'js2form',
  'reltime',
  'app/i18n',
  'app/user',
  'app/data/prodLines',
  'app/core/View',
  'app/core/util/fixTimeRange',
  'app/prodShiftOrders/templates/filter',
  'select2'
], function(
  _,
  moment,
  js2form,
  reltime,
  t,
  user,
  prodLines,
  View,
  fixTimeRange,
  filterTemplate
) {
  'use strict';

  return View.extend({

    template: filterTemplate,

    events: {
      'submit .filter-form': function(e)
      {
        e.preventDefault();

        this.changeFilter();
      }
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('prodShiftOrderFilter');
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    },

    afterRender: function()
    {
      var formData = this.serializeRqlQuery();

      js2form(this.el.querySelector('.filter-form'), formData);

      this.$id('prodLine').select2({
        width: '275px',
        allowClear: !user.getDivision(),
        data: this.getApplicableProdLines()
      });
    },

    getApplicableProdLines: function()
    {
      return prodLines.getForCurrentUser().map(function(prodLine)
      {
        return {
          id: prodLine.id,
          text: prodLine.getLabel()
        };
      });
    },

    serializeRqlQuery: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var formData = {
        createdAt: '',
        prodLine: null,
        type: null,
        shift: 0,
        orderId: '',
        operationNo: '',
        limit: rqlQuery.limit < 5 ? 5 : (rqlQuery.limit > 100 ? 100 : rqlQuery.limit)
      };

      rqlQuery.selector.args.forEach(function(term)
      {
        /*jshint -W015*/

        var property = term.args[0];

        switch (property)
        {
          case 'date':
            fixTimeRange.toFormData(formData, term, 'date');
            break;

          case 'prodLine':
          case 'shift':
          case 'orderId':
          case 'operationNo':
            if (term.name === 'eq')
            {
              formData[property] = term.args[1];
            }
            break;
        }
      });

      return formData;
    },

    changeFilter: function()
    {
      var rqlQuery = this.model.rqlQuery;
      var timeRange = fixTimeRange.fromView(this, {defaultTime: '06:00'});
      var selector = [];
      var prodLine = this.$id('prodLine').val();
      var shift = parseInt(this.$('input[name=shift]:checked').val(), 10);
      var orderId = this.$id('orderId').val();
      var operationNo = this.fixOperationNo();

      if (orderId && orderId.length)
      {
        selector.push({name: 'eq', args: ['orderId', orderId]});
      }

      if (prodLine && prodLine.length)
      {
        selector.push({name: 'eq', args: ['prodLine', prodLine]});
      }

      if (shift)
      {
        selector.push({name: 'eq', args: ['shift', shift]});
      }

      if (operationNo && operationNo.length)
      {
        selector.push({name: 'eq', args: ['operationNo', operationNo]});
      }

      if (timeRange.from)
      {
        selector.push({name: 'ge', args: ['date', timeRange.from]});
      }

      if (timeRange.to)
      {
        selector.push({name: 'le', args: ['date', timeRange.to]});
      }

      rqlQuery.selector = {name: 'and', args: selector};
      rqlQuery.limit = parseInt(this.$id('limit').val(), 10) || 15;
      rqlQuery.skip = 0;

      this.trigger('filterChanged', rqlQuery);
    },

    fixOperationNo: function()
    {
      var $operationNo = this.$id('operationNo');
      var operationNo = $operationNo.val().trim();

      if (operationNo.length > 0)
      {
        while (operationNo.length < 4)
        {
          operationNo = '0' + operationNo;
        }
      }

      $operationNo.val(operationNo);

      return operationNo;
    }

  });
});
