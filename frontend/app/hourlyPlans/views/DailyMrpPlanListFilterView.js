// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/views/FilterView',
  'app/hourlyPlans/templates/dailyMrpPlans/listFilter'
], function(
  _,
  time,
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'change #-date': 'changeFilter'

    }, FilterView.prototype.events),

    defaultFormData: function()
    {
      return {
        date: ''
      };
    },

    termToForm: {
      'date': function(propertyName, term, formData)
      {
        if (term.name === 'ge')
        {
          formData.date = time.getMoment(term.args[1]).add(3, 'days').format('YYYY-MM-DD');
        }
        else if (term.name === 'le')
        {
          formData.date = time.getMoment(term.args[1]).subtract(3, 'days').format('YYYY-MM-DD');
        }
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);
    },

    isValid: function()
    {
      return time.getMoment(this.$id('date').val(), 'YYYY-MM-DD').isValid();
    },

    serializeFormToQuery: function(selector)
    {
      var moment = time.getMoment(this.$id('date').val(), 'YYYY-MM-DD');
      var from = moment.clone().subtract(3, 'days').valueOf();
      var to = moment.clone().add(3, 'days').valueOf();

      selector.push(
        {name: 'ge', args: ['date', from]},
        {name: 'le', args: ['date', to]}
      );
    }

  });
});
