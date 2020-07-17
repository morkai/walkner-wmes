// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  '../dictionaries',
  'app/wmes-dummyPaint-orders/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  FilterView,
  idAndLabel,
  dateTimeRange,
  dictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,

      'mouseup #-changed > .btn': function(e)
      {
        var labelEl = e.currentTarget;
        var radioEl = labelEl.firstElementChild;

        if (radioEl.checked)
        {
          setTimeout(function()
          {
            labelEl.classList.remove('active');
            radioEl.checked = false;
          }, 1);
        }
      }

    }, FilterView.prototype.events),

    termToForm: {
      'createdAt': dateTimeRange.rqlToForm,
      'changed': function(propertyName, term, formData)
      {
        formData.changed = !!term.args[1];
      },
      'dummyNc12': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);


    },

    getTemplateData: function()
    {
      return {

      };
    },

    serializeFormToQuery: function(selector)
    {
      var view = this;
      var changed = view.getButtonGroupValue('changed');
      var dummyNc12 = view.$id('dummyNc12').val();

      dateTimeRange.formToRql(view, selector);

      if (changed === 'true')
      {
        selector.push({name: 'eq', args: ['changed', true]});
      }
      else if (changed === 'false')
      {
        selector.push({name: 'eq', args: ['changed', false]});
      }

      if (dummyNc12)
      {
        selector.push({name: 'eq', args: ['dummyNc12', dummyNc12]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('changed');

      this.$('.is-expandable').expandableSelect();

      this.setUpDummyNc12Select2();
    },

    setUpDummyNc12Select2: function()
    {
      this.$id('dummyNc12').select2({
        width: '150px',
        allowClear: true,
        placeholder: ' ',
        data: dictionaries.codes.map(idAndLabel)
      });
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    }

  });
});
