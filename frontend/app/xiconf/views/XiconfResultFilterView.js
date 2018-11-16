// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  'app/xiconf/templates/filter'
], function(
  _,
  time,
  FilterView,
  dateTimeRange,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        srcId: '',
        serviceTag: '',
        orderNo: '',
        nc12Type: 'program',
        nc12: '',
        result: ['success', 'failure']
      };
    },

    termToForm: {
      'startedAt': dateTimeRange.rqlToForm,
      'orderNo': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1].replace(/[^0-9]/g, '');
      },
      'result': function(propertyName, term, formData)
      {
        if (term.args[1] === 'success' || term.args[1] === 'failure')
        {
          formData.result = [term.args[1]];
        }
      },
      'nc12': function(propertyName, term, formData)
      {
        formData.nc12Type = 'program';
        formData.nc12 = term.args[1].replace(/[^0-9A-Z]/g, '');
      },
      'program._id': function(propertyName, term, formData)
      {
        formData.nc12Type = 'program';
        formData.nc12 = term.args[1].replace(/[^0-9A-Za-z]/g, '');
      },
      'leds.nc12': function(propertyName, term, formData)
      {
        formData.nc12Type = 'led';
        formData.nc12 = term.args[1].replace(/[^0-9A-Z]/g, '');
      },
      'srcId': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'serviceTag': 'srcId'
    },

    initialize: function()
    {
      if (this.collection)
      {
        this.listenTo(this.collection, 'change:srcIds', this.setUpSrcIdSelect2);
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      if (this.formData.result.length === 1)
      {
        this.$('.xiconf-filter-' + this.formData.result[0]).addClass('active');
      }
      else
      {
        this.$('.xiconf-filter-result > label').addClass('active');
      }

      this.setUpSrcIdSelect2();
    },

    setUpSrcIdSelect2: function()
    {
      this.$id('srcId').select2({
        width: '200px',
        allowClear: true,
        data: (this.collection.srcIds || []).map(function(srcId)
        {
          return {id: srcId, text: srcId};
        })
      });
    },

    serializeFormToQuery: function(selector)
    {
      var nc12Type = this.$('input[name="nc12Type"]:checked').val();
      var nc12 = this.$id('nc12').val().trim();
      var serviceTag = this.$id('serviceTag').val().trim();
      var srcId = this.$id('srcId').val();
      var $result = this.$('input[name="result[]"]:checked');

      dateTimeRange.formToRql(this, selector);

      if (srcId.length)
      {
        selector.push({name: 'eq', args: ['srcId', srcId]});
      }

      this.serializeRegexTerm(selector, 'orderNo', 9, null, false, true);

      if (/^[0-9A-Z]{9,}$/.test(nc12))
      {
        var property = nc12Type === 'led' ? 'leds.nc12' : /[A-Z]/.test(nc12) ? 'program._id' : 'nc12';

        if (nc12.length === 12)
        {
          selector.push({name: 'eq', args: [property, nc12]});
        }
        else
        {
          selector.push({name: 'regex', args: [property, '^' + nc12]});
        }
      }

      if (/^P[0-9]+$/.test(serviceTag))
      {
        selector.push({name: 'eq', args: ['serviceTag', serviceTag]});
      }

      if ($result.length === 1)
      {
        selector.push({name: 'eq', args: ['result', $result.val()]});
      }
    }

  });
});
