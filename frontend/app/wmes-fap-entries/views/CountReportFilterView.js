// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/data/orgUnits',
  '../dictionaries',
  '../Entry',
  'app/wmes-fap-entries/templates/countReportFilter',
  'app/core/util/ExpandableSelect'
], function(
  js2form,
  time,
  View,
  buttonGroup,
  idAndLabel,
  dateTimeRange,
  setUpMrpSelect2,
  orgUnits,
  dictionaries,
  Entry,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click a[data-date-time-range]': dateTimeRange.handleRangeEvent,
      'submit': function()
      {
        this.changeFilter();

        return false;
      }
    },

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      buttonGroup.toggle(this.$id('interval'));

      this.$('.is-expandable').expandableSelect();

      this.$id('categories').select2({
        width: '350px',
        allowClear: true,
        multiple: true,
        data: dictionaries.categories.map(idAndLabel)
      });

      setUpMrpSelect2(this.$id('mrps'), {
        own: true,
        view: this,
        width: '250px'
      });
    },

    getTemplateData: function()
    {
      return {
        divisions: orgUnits.getAllByType('division')
          .filter(function(d) { return d.isActive() && d.get('type') === 'prod'; })
          .map(idAndLabel),
        subdivisionTypes: Entry.SUBDIVISION_TYPES
      };
    },

    serializeFormData: function()
    {
      var model = this.model;
      var from = +model.get('from');
      var to = +model.get('to');

      return {
        interval: model.get('interval'),
        'from-date': from ? time.format(from, 'YYYY-MM-DD') : '',
        'to-date': to ? time.format(to, 'YYYY-MM-DD') : '',
        categories: model.get('categories').join(','),
        mrps: model.get('mrps').join(','),
        subdivisionTypes: model.get('subdivisionTypes').join(','),
        divisions: model.get('divisions').join(',')
      };
    },

    changeFilter: function()
    {
      var view = this;
      var range = dateTimeRange.serialize(view);
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0,
        interval: buttonGroup.getValue(this.$id('interval'))
      };

      ['categories', 'mrps', 'subdivisionTypes', 'divisions'].forEach(function(prop)
      {
        var value = view.$id(prop).val();

        query[prop] = Array.isArray(value) ? value : value ? value.split(',') : [];
      });

      view.model.set(query);
      view.model.trigger('filtered');
    }

  });
});
