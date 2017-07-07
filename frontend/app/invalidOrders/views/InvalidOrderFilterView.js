// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/ExpandableSelect',
  'app/users/ownMrps',
  'app/invalidOrders/templates/filter'
], function(
  _,
  FilterView,
  ExpandableSelect,
  ownMrps,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    events: _.assign({

    }, ownMrps.events, FilterView.prototype.events),

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

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.apply(this, arguments), {
        showOwnMrps: ownMrps.hasAny()
      });
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.$('.is-expandable').expandableSelect();

      var $mrp = this.$id('mrp').select2({
        width: '300px',
        allowClear: true,
        multiple: true,
        data: [],
        formatNoMatches: null,
        minimumResultsForSearch: 1,
        dropdownCssClass: 'hidden',
        tokenizer: function(input, selection, selectCallback)
        {
          var result = input;
          var options = {};

          selection.forEach(function(item)
          {
            options[item.id] = true;
          });

          (input.match(/[A-Z0-9]{3}/ig) || []).forEach(function(mrp)
          {
            result = result.replace(mrp, '');

            mrp = mrp.toUpperCase();

            if (!options[mrp])
            {
              selectCallback({id: mrp, text: mrp});
              options[mrp] = true;
            }
          });

          return input === result ? null : result.replace(/\s+/, ' ').trim();
        }
      });

      $mrp.select2(
        'data',
        $mrp
          .val()
          .split(',')
          .filter(function(mrp) { return mrp.length; })
          .map(function(mrp) { return {id: mrp, text: mrp}; })
      );
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
