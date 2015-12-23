// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/data/aors',
  'app/core/views/FilterView',
  'app/core/util/idAndLabel',
  './Report7CustomTimesView',
  'app/reports/templates/7/filter'
], function(
  _,
  t,
  viewport,
  aors,
  FilterView,
  idAndLabel,
  Report7CustomTimesView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    events: _.extend({
      'click #-customTimes': function()
      {
        this.$id('customTimes').blur();
        this.showCustomTimesDialog();
      }
    }, FilterView.prototype.events),

    initialize: function()
    {
      FilterView.prototype.initialize.apply(this, arguments);

      this.listenTo(this.model, 'change:customTimes', this.toggleCustomTimes);
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('statuses');

      var aorsData = aors.map(idAndLabel);

      this.$id('specificAor').select2({
        width: '275px',
        allowClear: true,
        placeholder: ' ',
        data: aorsData
      });

      this.$id('aors').select2({
        multiple: true,
        data: aorsData
      });

      this.toggleCustomTimes();
    },

    serializeQueryToForm: function()
    {
      return {
        specificAor: this.model.get('specificAor'),
        aors: (this.model.get('aors') || []).join(','),
        statuses: this.model.get('statuses')
      };
    },

    changeFilter: function()
    {
      this.model.set(this.serializeFormToQuery(), {reset: true});
    },

    serializeFormToQuery: function()
    {
      var query = {
        statuses: this.getButtonGroupValue('statuses'),
        aors: this.$id('aors').val().split(',').filter(function(aor) { return aor.length > 0; }),
        specificAor: this.$id('specificAor').val()
      };

      if (!query.statuses.length)
      {
        this.$id('statuses').find('.btn').click();
      }

      return query;
    },

    toggleCustomTimes: function()
    {
      this.$id('customTimes').toggleClass('active', !!this.model.get('customTimes'));
    },

    showCustomTimesDialog: function()
    {
      var customTimesView = new Report7CustomTimesView({
        model: this.model
      });

      this.listenToOnce(customTimesView, 'submit', function(data)
      {
        viewport.closeDialog();

        this.model.setCustomTimes(_.extend(this.serializeFormToQuery(), data));
      });

      this.listenToOnce(customTimesView, 'reset', function()
      {
        viewport.closeDialog();

        this.model.resetCustomTimes(this.serializeFormToQuery());
      });

      viewport.showDialog(customTimesView, t('reports', '7:customTimes:title'));
    }

  });
});
