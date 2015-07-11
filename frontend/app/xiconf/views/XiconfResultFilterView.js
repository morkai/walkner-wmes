// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/time',
  'app/core/views/FilterView',
  'app/xiconf/templates/filter'
], function(
  time,
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: function()
    {
      return {
        from: '',
        to: '',
        srcId: '',
        serviceTag: '',
        orderNo: '',
        nc12Type: 'program',
        nc12: '',
        result: ['success', 'failure']
      };
    },

    termToForm: {
      'startedAt': function(propertyName, term, formData)
      {
        var datetimeFormat = this.$id('from').prop('type') === 'datetime-local'
          ? 'YYYY-MM-DDTHH:mm:ss'
          : 'YYYY-MM-DD HH:mm';

        formData[term.name === 'ge' ? 'from' : 'to'] = time.format(term.args[1], datetimeFormat);
      },
      'orderNo': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
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
        formData.nc12 = term.args[1];
      },
      'program._id': 'nc12',
      'leds.nc12': function(propertyName, term, formData)
      {
        formData.nc12Type = 'led';
        formData.nc12 = term.args[1];
      },
      'srcId': 'orderNo',
      'serviceTag': 'orderNo'
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
      var fromMoment = time.getMoment(this.$id('from').val());
      var toMoment = time.getMoment(this.$id('to').val());
      var orderNo = this.$id('orderNo').val().trim();
      var nc12Type = this.$('input[name="nc12Type"]:checked').val();
      var nc12 = this.$id('nc12').val().trim();
      var serviceTag = this.$id('serviceTag').val().trim();
      var srcId = this.$id('srcId').val();
      var $result = this.$('input[name="result[]"]:checked');

      if (srcId.length)
      {
        selector.push({name: 'eq', args: ['srcId', srcId]});
      }

      if (/^[0-9]{9}$/.test(orderNo))
      {
        selector.push({name: 'eq', args: ['orderNo', orderNo]});
      }

      if (/^[0-9A-Z]{9,}$/.test(nc12))
      {
        var property = nc12Type === 'led' ? 'leds.nc12' : /[A-Z]/.test(nc12) ? 'program._id' : 'nc12';

        selector.push({name: 'eq', args: [property, nc12]});
      }

      if (/^P[0-9]+$/.test(serviceTag))
      {
        selector.push({name: 'eq', args: ['serviceTag', serviceTag]});
      }

      if (fromMoment.isValid())
      {
        selector.push({name: 'ge', args: ['startedAt', fromMoment.valueOf()]});
      }

      if (toMoment.isValid())
      {
        selector.push({name: 'lt', args: ['startedAt', toMoment.valueOf()]});
      }

      if ($result.length === 1)
      {
        selector.push({name: 'eq', args: ['result', $result.val()]});
      }
    }

  });
});
