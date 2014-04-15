// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/core/View',
  'app/data/orgUnits',
  'app/reports/templates/metricRefs'
], function(
  _,
  View,
  orgUnits,
  metricRefsTemplate
) {
  'use strict';

  return View.extend({

    template: metricRefsTemplate,

    localTopics: {
      'divisions.synced': 'render',
      'subdivisions.synced': 'render'
    },

    events: {
      'click .reports-metricRefs-tab > a': function(e)
      {
        var metric = this.$(e.target).closest('[data-metric]').attr('data-metric');

        this.broker.publish('router.navigate', {
          url: '#reports;metricRefs?tab=' + metric,
          trigger: false,
          replace: true
        });

        this.changeTab(metric);

        return false;
      },
      'change .form-control': 'updateRemoteMetricRef',
      'keyup .form-control': 'updateRemoteMetricRef'
    },

    initialize: function()
    {
      this.idPrefix = _.uniqueId('metricRefs');
      this.currentMetric = null;

      this.listenTo(this.metricRefs, 'add', this.updateLocalMetricRef);
      this.listenTo(this.metricRefs, 'change', this.updateLocalMetricRef);
    },

    serialize: function()
    {
      function ascByLabel(a, b)
      {
        return a.label.localeCompare(b.label);
      }

      return {
        idPrefix: this.idPrefix,
        divisions: orgUnits.getAllDivisions()
          .filter(function(division) { return division.get('type') === 'prod'; })
          .map(function(division)
          {
            return {
              _id: division.id,
              label: division.getLabel(),
              subdivisions: orgUnits.getChildren(division)
                .map(function(subdivision)
                {
                  return {
                    _id: subdivision.id,
                    label: subdivision.getLabel()
                  };
                })
                .sort(ascByLabel)
            };
          })
          .sort(ascByLabel)
      };
    },

    afterRender: function()
    {
      this.changeTab(this.currentMetric || this.options.initialTab || 'efficiency');
    },

    changeTab: function(metric)
    {
      this.currentMetric = metric;

      this.$('.reports-metricRefs-tab.active').removeClass('active');
      this.$('.reports-metricRefs-tab[data-metric=' + metric + ']').addClass('active');

      var view = this;

      this.$('.form-control').each(function()
      {
        this.value = view.metricRefs.getValue(metric, this.name);
      });
    },

    updateLocalMetricRef: function(metricRef)
    {
      var metricInfo = this.metricRefs.parseSettingId(metricRef.id);

      if (this.currentMetric === metricInfo.metric)
      {
        this.$('.form-control[name="' + metricInfo.orgUnit + '"]').val(metricRef.get('value'));
      }
    },

    updateRemoteMetricRef: _.debounce(function(e)
    {
      this.promised(this.metricRefs.updateValue(
        this.currentMetric, e.target.name, parseInt(e.target.value, 10)
      ));
    }, 300)

  });
});
