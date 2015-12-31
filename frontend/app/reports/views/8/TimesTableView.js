// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/highcharts',
  'app/core/View',
  'app/data/aors',
  'app/reports/templates/8/timesTable'
], function(
  _,
  t,
  Highcharts,
  View,
  aors,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .js-value': function(e)
      {
        this.toggleSeries(e.currentTarget.parentNode.dataset.prop, e.currentTarget.dataset.kind);
      }
    },

    initialize: function()
    {
      this.listenTo(this.model, 'change:summary', this.render);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        props: this.serializeProps()
      };
    },

    serializeProp: function(props, summary, propName, decimals, unit)
    {
      var prop = {
        plan: '',
        real: '',
        unit: unit,
        className: '',
        planColor: this.serializeColor(propName, 'plan'),
        realColor: this.serializeColor(propName, 'real')
      };
      var value = summary[propName];

      if (Array.isArray(value))
      {
        prop.plan = this.formatValue(value[0], decimals);
        prop.real = this.formatValue(value[1], decimals);
      }
      else
      {
        prop[propName === 'heijunkaTimeForLine' ? 'plan' : 'real'] = this.formatValue(value, decimals);
      }

      props[propName] = prop;

      return prop;
    },

    serializeColor: function(propName, kind)
    {
      var seriesId = propName + ':' + kind;

      if (this.model.query.isVisibleSeries(seriesId))
      {
        return this.model.getColor('times', seriesId);
      }

      return 'transparent';
    },

    formatValue: function(value, decimals)
    {
      return Highcharts.numberFormat(value, decimals);
    },

    serializeProps: function()
    {
      var unit = this.model.query.get('unit');
      var timeUnit = t('reports', '8:times:unit:' + unit);
      var timeDecimals = unit === 'h' ? 2 : 2;
      var summary = this.model.get('summary');
      var props = {};
      var view = this;

      [
        'timeAvailablePerShift',
        'routingTimeForLine',
        'routingTimeForLabour',
        'heijunkaTimeForLine',
        'breaks',
        'fap0',
        'startup',
        'shutdown',
        'meetings',
        'sixS',
        'tpm',
        'trainings',
        'coTime',
        'downtime'
      ].forEach(function(prop)
      {
        view.serializeProp(props, summary, prop, timeDecimals, timeUnit);
      });

      _.forEach(summary.downtimeByAor, function(duration, aorId)
      {
        var aor = aors.get(aorId);

        props[aorId] = {
          name: aor ? aor.getLabel() : aorId,
          plan: '',
          real: view.formatValue(duration, timeDecimals),
          unit: timeUnit,
          className: '',
          planColor: 'transparent',
          realColor: view.serializeColor(aorId, 'real')
        };
      });

      this.serializeProp(props, summary, 'plan', 0, t('reports', '8:times:unit:pcs'));
      this.serializeProp(props, summary, 'efficiency', 0, t('reports', '8:times:unit:%'));

      return props;
    },

    toggleSeries: function(prop, kind)
    {
      var $tr = this.$('tr[data-prop="' + prop + '"]');
      var $span = $tr.find('td[data-kind="' + kind + '"] > span');

      this.model.query.toggleSeriesVisibility(prop + ':' + kind);

      $span.css({
        borderBottomColor: this.serializeColor(prop, kind)
      });
    }

  });
});
