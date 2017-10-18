// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/ExpandableSelect',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/invalidOrders/templates/filter'
], function(
  _,
  FilterView,
  ExpandableSelect,
  setUpMrpSelect2,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      status: [],
      _id: '',
      mrp: ''
    },

    termToForm: {
      '_id': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'mrp': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1].join(',');
      },
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      }
    },

    destroy: function()
    {
      FilterView.prototype.destroy.call(this);

      this.$('.is-expandable').expandableSelect('destroy');
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();

      setUpMrpSelect2(this.$id('mrp'), {own: true, view: this});
    },

    serializeFormToQuery: function(selector)
    {
      var _id = this.$id('_id').val();
      var mrp = this.$id('mrp').val();

      if (_id.length)
      {
        selector.push({name: 'eq', args: ['_id', _id]});
      }

      if (mrp.length)
      {
        selector.push({name: 'in', args: ['mrp', mrp.split(',')]});
      }

      var status = (this.$id('status').val() || []).filter(function(v) { return !_.isEmpty(v); });

      if (status.length === 1)
      {
        selector.push({name: 'eq', args: ['status', status[0]]});
      }
      else if (status.length)
      {
        selector.push({name: 'in', args: ['status', status]});
      }
    }

  });
});
