// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/wmes-ct-pces/templates/resultsReport/filter'
], function(
  _,
  js2form,
  time,
  View,
  idAndLabel,
  dateTimeRange,
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

    initialize: function()
    {
      this.listenTo(this.model, 'mrpConfigChanged', this.onMrpConfigChanged);
      this.listenTo(this.settings, 'change', this.onSettingChange);
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      this.updatePlaceholders();
    },

    serializeFormData: function()
    {
      var attrs = this.model.attributes;

      return {
        'from-date': attrs.from ? time.format(attrs.from, 'YYYY-MM-DD') : '',
        'to-date': attrs.to ? time.format(attrs.to, 'YYYY-MM-DD') : '',
        minLineWorkDuration: attrs.minLineWorkDuration == null ? '' : attrs.minLineWorkDuration,
        minUpphWorkDuration: attrs.minUpphWorkDuration == null ? '' : attrs.minUpphWorkDuration,
        shiftCount: attrs.shiftCount == null ? '' : attrs.shiftCount,
        availableWorkDuration: attrs.availableWorkDuration == null ? '' : attrs.availableWorkDuration,
        minMrpUnbalance: attrs.minMrpUnbalance == null ? '' : attrs.minMrpUnbalance,
        minMrpEfficiency: attrs.minMrpEfficiency == null ? '' : attrs.minMrpEfficiency
      };
    },

    changeFilter: function()
    {
      var view = this;
      var range = dateTimeRange.serialize(view);
      var query = {
        from: range.from ? range.from.valueOf() : 0,
        to: range.to ? range.to.valueOf() : 0,
        minLineWorkDuration: parseFloat(view.$id('minLineWorkDuration').val()),
        minUpphWorkDuration: parseFloat(view.$id('minUpphWorkDuration').val()),
        shiftCount: parseInt(view.$id('minLineWorkDuration').val(), 10),
        availableWorkDuration: parseFloat(view.$id('availableWorkDuration').val()),
        minMrpUnbalance: parseInt(view.$id('minMrpUnbalance').val(), 10),
        minMrpEfficiency: parseInt(view.$id('minMrpEfficiency').val(), 10)
      };

      _.forEach(query, function(v, k)
      {
        if (isNaN(v) || v == null)
        {
          query[k] = null;
        }
      });

      view.model.set(query);
      view.model.trigger('filtered');
    },

    updatePlaceholders: function()
    {
      var view = this;

      view.$('input[placeholder]').each(function()
      {
        var setting = view.settings.get('ct.reports.results.' + this.name);

        if (!setting)
        {
          return;
        }

        var value = setting.getValue();

        if (typeof value === 'number')
        {
          this.placeholder = value.toLocaleString();
        }
      });
    },

    onSettingChange: function(setting)
    {
      if (/^ct.reports.results/.test(setting.id))
      {
        this.updatePlaceholders();
      }
    },

    onMrpConfigChanged: function()
    {
      this.$('.btn[type="submit"]').first().focus();
    }

  });
});
