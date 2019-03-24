// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FilterView',
  'app/core/util/forms/dateTimeRange',
  '../dictionaries',
  'app/wmes-luma2-events/templates/filter',
  'app/core/util/ExpandableSelect'
], function(
  _,
  FilterView,
  dateTimeRange,
  dictionaries,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.assign({

      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent

    }, FilterView.prototype.events),

    termToForm: {
      'time': dateTimeRange.rqlToForm,
      'order': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      },
      'type': function(propertyName, term, formData)
      {
        formData[propertyName] = term.name === 'in' ? term.args[1] : [term.args[1]];
      },
      'line': 'type',
      'station': 'order',
      'program': 'order'
    },

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.listenTo(dictionaries.lines, 'add remove change', this.updateLines);
    },

    serialize: function()
    {
      return _.assign(FilterView.prototype.serialize.call(this), {
        types: dictionaries.types,
        lines: dictionaries.lines.pluck('_id')
      });
    },

    serializeFormToQuery: function(selector)
    {
      var view = this;

      dateTimeRange.formToRql(view, selector);

      ['type', 'line'].forEach(function(prop)
      {
        var value = (view.$id(prop).val() || []).filter(function(v) { return !_.isEmpty(v); });

        if (value.length)
        {
          selector.push({name: 'in', args: [prop, value]});
        }
      });

      ['order', 'station', 'program'].forEach(function(prop)
      {
        var value = view.$id(prop).val().trim();

        if (value.length)
        {
          selector.push({name: 'eq', args: [prop, value]});
        }
      });
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
    },

    updateLines: function()
    {
      var $line = this.$id('line');
      var selected = $line.val() || [];
      var options = '';

      dictionaries.lines.forEach(function(line)
      {
        options += '<option ' + (_.includes(selected, line.id) ? 'selected' : '') + '>' + _.escape(line.id);
      });

      $line.html(options);
    }

  });
});
