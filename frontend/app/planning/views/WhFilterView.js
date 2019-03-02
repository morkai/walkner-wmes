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
  'app/planning/templates/whFilter',
  'app/core/util/ExpandableSelect'
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
      'change #-whStatuses': 'changeFilter',
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

    destroy: function()
    {
      this.$('.is-expandable').expandableSelect('destroy');
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
        whStatuses: displayOptions.get('whStatuses'),
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

      this.$('.is-expandable').expandableSelect();

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
      var view = this;
      var date = view.$id('date').val();
      var data = {
        mrps: view.$id('mrps').val().split(',').filter(function(v) { return v.length > 0; }),
        lines: view.$id('lines').val().split(',').filter(function(v) { return v.length > 0; }),
        whStatuses: view.$id('whStatuses').val()
      };

      if (!data.whStatuses || data.whStatuses.length === 4)
      {
        data.whStatuses = [];
      }

      switch (view.$('[name="mrpMode"]:checked').val())
      {
        case '1':
          data.mrps.unshift('1');
          break;

        case '0':
          data.mrps.unshift('0');
          break;

        case 'mine':
          data.mrps = ['mine'];
          break;

        case 'wh':
          data.mrps = ['wh'];
          break;
      }

      var displayOptions = {};

      ['mrps', 'lines', 'whStatuses'].forEach(function(prop)
      {
        if (!_.isEqual(data[prop], view.plan.displayOptions.get(prop)))
        {
          displayOptions[prop] = data[prop];
        }
      });

      if (!_.isEmpty(displayOptions))
      {
        view.plan.displayOptions.set(displayOptions);
      }

      if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date) && date !== view.plan.id)
      {
        view.plan.set('_id', date);
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
