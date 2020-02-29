// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/users/util/setUpUserSelect2',
  'app/data/downtimeReasons',
  'app/wh-downtimes/templates/filter'
], function(
  _,
  FilterView,
  idAndLabel,
  dateTimeRange,
  setUpUserSelect2,
  downtimeReasons,
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
      'user.id': function(propertyName, term, formData)
      {
        formData.user = term.args[1];
      },
      'reason': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      setUpUserSelect2(this.$id('user'), {
        width: '275x',
        view: this
      });

      this.$id('reason').select2({
        width: '300px',
        multiple: true,
        data: downtimeReasons.findBySubdivisionType(['wh-pickup', 'wh-dist']).map(idAndLabel)
      });
    },

    serializeFormToQuery: function(selector)
    {
      var user = this.$id('user').val();
      var reason = this.$id('reason').select2('val');

      dateTimeRange.formToRql(this, selector);

      if (user)
      {
        selector.push({name: 'eq', args: ['user.id', user]});
      }

      if (reason.length)
      {
        selector.push({name: 'in', args: ['reason', reason]});
      }
    }

  });
});
