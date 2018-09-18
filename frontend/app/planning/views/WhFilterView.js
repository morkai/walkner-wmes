// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/data/orgUnits',
  'app/mrpControllers/util/setUpMrpSelect2',
  'app/planning/templates/whFilter'
], function(
  _,
  $,
  t,
  time,
  View,
  idAndLabel,
  orgUnits,
  setUpMrpSelect2,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'input #-date': 'changeFilter',
      'change #-date': 'changeFilter',
      'change #-mrps': 'changeFilter',
      'change #-lines': 'changeFilter',
      'click #-useDarkerTheme': function()
      {
        this.plan.displayOptions.toggleDarkerThemeUse();
      },
      'change input[name="mrpMode"]': function()
      {
        this.toggleMrpsSelect2();
        this.changeFilter();
      }

    },

    initialize: function()
    {
      this.stats = {};

      var plan = this.plan;
      var displayOptions = plan.displayOptions;

      this.listenTo(plan, 'change:loading', this.onLoadingChanged);
      this.listenTo(plan, 'change:_id', this.onDateChanged);
      this.listenTo(displayOptions, 'change:minDate change:maxDate', this.onMinMaxDateChanged);
      this.listenTo(displayOptions, 'change:useDarkerTheme', this.updateToggles);
    },

    serialize: function()
    {
      var plan = this.plan;
      var displayOptions = plan.displayOptions;
      var mrpMode = '1';
      var mrps = [].concat(displayOptions.get('mrps'));

      switch (mrps[0])
      {
        case '1':
          mrps.shift();
          break;

        case '0':
          mrpMode = '0';
          mrps.shift();
          break;

        case 'mine':
        case 'wh':
          mrpMode = mrps[0];
          mrps = [];
          break;
      }

      return _.assign({
        idPrefix: this.idPrefix,
        date: plan.id,
        mrps: mrps,
        lines: displayOptions.get('lines'),
        mrpMode: mrpMode,
        minDate: displayOptions.get('minDate'),
        maxDate: displayOptions.get('maxDate'),
        useDarkerTheme: displayOptions.isDarkerThemeUsed()
      });
    },

    afterRender: function()
    {
      setUpMrpSelect2(this.$id('mrps'), {
        width: '600px',
        placeholder: t('planning', 'filter:mrps:placeholder'),
        sortable: true,
        own: false,
        view: this
      });

      this.$id('lines').select2({
        width: '300px',
        placeholder: ' ',
        allowClear: true,
        multiple: true,
        data: orgUnits.getAllByType('prodLine')
          .filter(function(prodLine) { return !prodLine.get('deactivatedAt'); })
          .map(idAndLabel)
      });

      this.toggleMrpsSelect2();
      this.updateStats();
    },

    updateToggles: function()
    {
      this.$id('useDarkerTheme').toggleClass('active', this.plan.displayOptions.isDarkerThemeUsed());
    },

    toggleMrpsSelect2: function()
    {
      var mrpMode = this.$('[name="mrpMode"]:checked').val();
      var enabled = mrpMode === '1' || mrpMode === '0';
      var $mrps = this.$id('mrps').select2('enable', enabled);

      if (!enabled)
      {
        $mrps.attr('placeholder', t('planning', 'filter:mrps:' + mrpMode)).select2('val', '');
      }
      else
      {
        $mrps.attr('placeholder', t('planning', 'filter:mrps:placeholder'));

        if ($mrps.val() === '')
        {
          $mrps.select2('val', '');
        }
      }
    },

    changeFilter: function()
    {
      var date = this.$id('date').val();
      var mrps = this.$id('mrps').val().split(',').filter(function(v) { return v.length > 0; });
      var lines = this.$id('lines').val().split(',').filter(function(v) { return v.length > 0; });

      switch (this.$('[name="mrpMode"]:checked').val())
      {
        case '1':
          mrps.unshift('1');
          break;

        case '0':
          mrps.unshift('0');
          break;

        case 'mine':
          mrps = ['mine'];
          break;

        case 'wh':
          mrps = ['wh'];
          break;
      }

      var displayOptions = {};

      if (!_.isEqual(mrps, this.plan.displayOptions.get('mrps')))
      {
        displayOptions.mrps = mrps;
      }

      if (!_.isEqual(lines, this.plan.displayOptions.get('lines')))
      {
        displayOptions.lines = lines;
      }

      if (!_.isEmpty(displayOptions))
      {
        this.plan.displayOptions.set(displayOptions);
      }

      if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date) && date !== this.plan.id)
      {
        this.plan.set('_id', date);
      }
    },

    onLoadingChanged: function()
    {
      var loading = this.plan.get('loading');

      this.$id('date').prop('disabled', loading);
      this.$id('mrps').select2('enable', !loading);
      this.$id('lines').select2('enable', !loading);
    },

    onDateChanged: function()
    {
      this.$id('date').val(this.plan.id);
    },

    onMinMaxDateChanged: function()
    {
      this.$id('date')
        .prop('min', this.plan.displayOptions.get('minDate'))
        .prop('max', this.plan.displayOptions.get('maxDate'));
    },

    updateStats: function(stats)
    {
      if (stats)
      {
        this.stats = stats;
      }

      var $stats = this.$id('stats');

      if (!$stats.length)
      {
        return;
      }

      _.forEach(this.stats, function(v, k)
      {
        $stats.find('.planning-wh-stats-v[data-status="' + k + '"]').text(v.toLocaleString());
      });
    },

    updateStat: function(prev, next)
    {
      if (prev === next)
      {
        return;
      }

      this.stats[prev] -= 1;
      this.stats[next] += 1;

      this.updateStats();
    }

  });
});
