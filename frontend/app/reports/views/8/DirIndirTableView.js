// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/highcharts',
  'app/core/View',
  'app/data/localStorage',
  'app/reports/templates/8/dirIndirTable'
], function(
  _,
  Highcharts,
  View,
  localStorage,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .js-dirIndir': function(e)
      {
        this.toggleDirIndir(e.currentTarget.parentNode.dataset.prop);
        this.saveDirIndir();
        this.recountTotalDirIndir();
      },
      'click .js-value': function(e)
      {
        var el = e.currentTarget;

        this.toggleSeries(el.parentNode.dataset.prop, el.dataset.kind);
      }
    },

    initialize: function()
    {
      this.dirIndir = this.readDirIndir();

      this.listenTo(this.model, 'change:summary', this.render);
    },

    afterRender: function()
    {
      this.recountTotalDirIndir();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        props: this.serializeProps()
      };
    },

    serializeProp: function(props, summary, propName, dirIndir)
    {
      var dirOrIndir = this.dirIndir[propName];
      var prop = {
        plan: '',
        rawPlan: 0,
        real: '',
        rawReal: 0,
        className: dirOrIndir ? ('is-' + dirOrIndir) : '',
        dirIndir: dirIndir !== false,
        planColor: this.serializeColor(propName, 'plan'),
        realColor: this.serializeColor(propName, 'real')
      };

      if (summary)
      {
        var value = summary[propName];

        if (Array.isArray(value))
        {
          prop.plan = this.formatValue(value[0]);
          prop.rawPlan = value[0];
          prop.real = this.formatValue(value[1]);
          prop.rawReal = value[1];
        }
        else
        {
          prop.real = this.formatValue(value);
          prop.rawReal = value;
        }
      }

      props[propName] = prop;

      return prop;
    },

    serializeColor: function(propName, kind)
    {
      var seriesId = propName + ':' + kind;

      if (this.model.query.isVisibleSeries(seriesId))
      {
        return this.model.getColor('dirIndir', seriesId);
      }

      return 'transparent';
    },

    formatValue: function(value)
    {
      return Highcharts.numberFormat(value, 2);
    },

    serializeProps: function()
    {
      var summary = this.model.get('summary');
      var props = {
        totalVolumeProduced: false,
        averageRoutingTime: false,
        prodBasedPlanners: true,
        prodQualityInspection: true,
        prodOperators: true,
        prodSetters: false,
        masters: true,
        leaders: true,
        prodMaterialHandling: true,
        kitters: true,
        prodTransport: true,
        cycleCounting: true,
        otherWarehousing: true,
        materialQualityInspection: true,
        maintenance: true
      };

      _.forEach(props, function(dirIndir, propName)
      {
        this.serializeProp(props, summary, propName, dirIndir);
      }, this);

      return props;
    },

    adjustHeight: function(maxHeight)
    {
      var $footer = this.$id('footer').css('height', '0px');
      var currentHeight = this.$el.outerHeight();

      if (currentHeight >= maxHeight)
      {
        $footer.css('display', 'none');
      }
      else
      {
        $footer.css({
          display: '',
          height: (1 + maxHeight - currentHeight) + 'px'
        });
      }
    },

    toggleDirIndir: function(prop)
    {
      var $tr = this.$('tr[data-prop="' + prop + '"]');

      if ($tr.hasClass('is-dir'))
      {
        $tr.removeClass('is-dir').addClass('is-indir');
      }
      else if ($tr.hasClass('is-indir'))
      {
        $tr.removeClass('is-indir');
      }
      else
      {
        $tr.addClass('is-dir');
      }
    },

    recountTotalDirIndir: function()
    {
      var planDirTotal = 0;
      var realDirTotal = 0;
      var planIndirTotal = 0;
      var realIndirTotal = 0;
      var atLeastOne = false;

      this.$('.is-dir').each(function()
      {
        atLeastOne = true;
        planDirTotal += parseFloat(this.dataset.plan);
        realDirTotal += parseFloat(this.dataset.real);
      });

      this.$('.is-indir').each(function()
      {
        atLeastOne = true;
        planIndirTotal += parseFloat(this.dataset.plan);
        realIndirTotal += parseFloat(this.dataset.real);
      });

      this.$id('planDirTotal').text(atLeastOne ? this.format00(planDirTotal) : '');
      this.$id('realDirTotal').text(atLeastOne ? this.format00(realDirTotal) : '');
      this.$id('planIndirTotal').text(atLeastOne ? this.format00(planIndirTotal) : '');
      this.$id('realIndirTotal').text(atLeastOne ? this.format00(realIndirTotal) : '');
    },

    format00: function(value)
    {
      return (Math.round(value * 100) / 100).toLocaleString();
    },

    readDirIndir: function()
    {
      return JSON.parse(localStorage.getItem('LEAN_DIR_INDIR') || '{}');
    },

    saveDirIndir: function()
    {
      var dirIndir = {};

      this.$('.is-dir, .is-indir').each(function()
      {
        dirIndir[this.dataset.prop] = this.classList.contains('is-dir') ? 'dir' : 'indir';
      });

      localStorage.setItem('LEAN_DIR_INDIR', JSON.stringify(dirIndir));
    },

    toggleSeries: function(prop, kind)
    {
      var $tr = this.$('tr[data-prop="' + prop + '"]');
      var $span = $tr.find('td[data-kind="' + kind + '"] > span');
      var seriesId = prop + ':' + kind;

      this.model.query.toggleSeriesVisibility(seriesId);

      $span.css({
        borderBottomColor: this.serializeColor(prop, kind)
      });
    }

  });
});
