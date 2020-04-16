// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/orgUnits/views/OrgUnitPickerView',
  'app/wmes-ct-balancing/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  FilterView,
  dateTimeRange,
  OrgUnitPickerView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    termToForm: {
      'startedAt': dateTimeRange.rqlToForm,
      'order._id': function(propertyName, term, formData)
      {
        formData.product = term.args[1];
      },
      'order.nc12': 'order._id',
      'line': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'stt': function(propertyName, term, formData)
      {
        formData[term.name === 'ge' ? 'minDuration' : 'maxDuration'] = term.args[1] + '%';
      },
      'd': function(propertyName, term, formData)
      {
        formData[term.name === 'ge' ? 'minDuration' : 'maxDuration'] = term.args[1] + 's';
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.setView('#-orgUnit', new OrgUnitPickerView({
        filterView: this,
        orgUnitTerms: {
          line: 'prodLine'
        },
        orgUnitTypes: ['prodLine']
      }));

      this.once('afterRender', function()
      {
        if (!this.$id('product').val())
        {
          this.$('.btn[type="submit"]').click();
        }
      });
    },

    serializeFormToQuery: function(selector)
    {
      var view = this;

      dateTimeRange.formToRql(view, selector);

      var product = view.$id('product').val().trim();
      var minDuration = view.$id('minDuration').val().trim();
      var maxDuration = view.$id('maxDuration').val().trim();

      if (product.length === 9)
      {
        selector.push({name: 'eq', args: ['order._id', product]});
      }
      else if (product.length === 7 || product.length === 12)
      {
        selector.push({name: 'eq', args: ['order.nc12', product.toUpperCase()]});
      }

      if (/^[0-9]+\s*[%s]?$/.test(minDuration))
      {
        selector.push({
          name: 'ge',
          args: [
            /%/.test(minDuration) ? 'stt' : 'd',
            parseInt(minDuration, 10)
          ]
        });
      }

      if (/^[0-9]+\s*[%s]?$/.test(maxDuration))
      {
        selector.push({
          name: 'le',
          args: [
            /%/.test(maxDuration) ? 'stt' : 'd',
            parseInt(maxDuration, 10)
          ]
        });
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    }

  });
});
