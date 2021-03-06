// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'js2form',
  'app/time',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/core/util/idAndLabel',
  'app/core/util/forms/dateTimeRange',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/wmes-ct-pces/templates/resultsReport/filter'
], function(
  _,
  js2form,
  time,
  View,
  buttonGroup,
  idAndLabel,
  dateTimeRange,
  setUpMrpSelect2,
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
      var view = this;

      js2form(view.el, view.serializeFormData());

      buttonGroup.toggle(this.$id('interval'));

      view.updatePlaceholders();

      var includedMrps = view.settings.getValue('reports.results.includedMrps', []);

      setUpMrpSelect2(view.$id('includedMrps'), {
        width: '500px',
        view: view,
        own: false,
        filter: function(item)
        {
          return !includedMrps.length || includedMrps.indexOf(item.id) !== -1;
        }
      });
    },

    serializeFormData: function()
    {
      var attrs = this.model.attributes;

      return {
        'from-date': attrs.from ? time.format(attrs.from, 'YYYY-MM-DD') : '',
        'to-date': attrs.to ? time.format(attrs.to, 'YYYY-MM-DD') : '',
        interval: attrs.interval,
        includedMrps: Array.isArray(attrs.includedMrps) ? attrs.includedMrps.join(',') : '',
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
        interval: buttonGroup.getValue(view.$id('interval')),
        includedMrps: view.$id('includedMrps').val().split(',').filter(function(v) { return !!v.length; }),
        minLineWorkDuration: parseFloat(view.$id('minLineWorkDuration').val()),
        minUpphWorkDuration: parseFloat(view.$id('minUpphWorkDuration').val()),
        shiftCount: parseInt(view.$id('shiftCount').val(), 10),
        availableWorkDuration: parseFloat(view.$id('availableWorkDuration').val()),
        minMrpUnbalance: parseInt(view.$id('minMrpUnbalance').val(), 10),
        minMrpEfficiency: parseInt(view.$id('minMrpEfficiency').val(), 10)
      };

      _.forEach(query, (v, k) =>
      {
        if (typeof v !== 'string' && (v == null || (isNaN(v) && !Array.isArray(v))))
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
