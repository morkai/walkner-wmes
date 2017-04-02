// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../util/autoDowntimeCache',
  '../settings',
  '../DailyMrpPlanLine',
  '../views/DailyMrpPlanFilterView',
  '../views/DailyMrpPlanView',
  '../views/DailyMrpPlanImportView',
  'app/hourlyPlans/templates/dailyMrpPlans/page'
], function(
  _,
  $,
  t,
  time,
  viewport,
  View,
  bindLoadingMessage,
  autoDowntimeCache,
  settings,
  DailyMrpPlanLine,
  DailyMrpPlanFilterView,
  DailyMrpPlanView,
  DailyMrpPlanImportView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      var breadcrumbs = [
        {
          href: '#dailyMrpPlans;list',
          label: t.bound('hourlyPlans', 'BREADCRUMBS:dailyMrpPlans')
        },
        time.getMoment(this.model.getCurrentFilter().date, 'YYYY-MM-DD').format('L')
      ];

      return breadcrumbs;
    },

    actions: function()
    {
      return [
        {
          label: t.bound('hourlyPlans', 'PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'PROD_DATA:MANAGE',
          href: '#hourlyPlans;settings?tab='
        }
      ];
    },

    events: {

      'click .dailyMrpPlan-message-mrp': function(e)
      {
        var mrp = e.currentTarget.textContent;
        var plan = this.model.find(function(plan) { return plan.mrp.id === mrp; });

        if (plan)
        {
          plan.trigger('scrollIntoView');
        }
      }

    },

    initialize: function()
    {
      var page = this;
      var plans = page.model;
      var idPrefix = page.idPrefix;
      var handleDragEvent = page.handleDragEvent.bind(page);

      page.model = bindLoadingMessage(plans.subscribe(page.pubsub), page);

      page.filterView = new DailyMrpPlanFilterView({model: plans});

      page.setView('#' + idPrefix + '-filter', page.filterView);

      page.listenTo(plans, 'import', page.onImport);
      page.listenTo(plans, 'reset', _.after(2, page.onReset));
      page.listenTo(plans, 'sync', page.onSync);
      page.listenTo(
        this.model,
        'checkOverlappingLinesRequested',
        _.debounce(page.checkOverlappingLines, 50)
      );
      page.listenTo(plans.options, 'change:wrap', page.onWrapChange);
      page.listenTo(plans.settings, 'change', page.onSettingsChange);

      $('body')
        .on('paste.' + idPrefix, page.onBodyPaste.bind(page))
        .on('keydown.' + idPrefix, page.onBodyKeyDown.bind(page));

      $(document)
        .on('dragstart.' + idPrefix, handleDragEvent)
        .on('dragenter.' + idPrefix, handleDragEvent)
        .on('dragleave.' + idPrefix, handleDragEvent)
        .on('dragover.' + idPrefix, handleDragEvent)
        .on('drop.' + idPrefix, page.onDrop.bind(page));
    },

    destroy: function()
    {
      $('body').off('.' + this.idPrefix).css('overflow-x', '');
      $(document).off('.' + this.idPrefix);

      settings.release();
    },

    load: function(when)
    {
      this.readCurrentFilterIfNeeded();

      if (this.model.hasRequiredFilters())
      {
        return when(
          this.loadStyles(),
          this.model.settings.fetchIfEmpty(),
          this.model.fetch({reset: true})
        );
      }

      return when(
        this.loadStyles(),
        this.model.settings.fetchIfEmpty()
      );
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        wrap: !!this.model.options.get('wrap')
      };
    },

    loadStyles: function()
    {
      var deferred = $.Deferred();
      var $head = $('head');

      if ($head.find('link[href$="planning.css"]').length)
      {
        deferred.resolve();
      }
      else
      {
        $('<link rel="stylesheet" href="/app/hourlyPlans/assets/planning.css">')
          .on('load', function() { deferred.resolve(); })
          .appendTo($head);
      }

      return deferred.promise();
    },

    afterRender: function()
    {
      settings.acquire();

      $('body').css('overflow-x', 'hidden');

      this.renderPlans();
      this.toggleMessages();
      this.checkOverlappingLines();
    },

    toggleMessages: function()
    {
      var hasRequiredFilters = this.model.hasRequiredFilters();

      this.$id('msg-filter').toggleClass('hidden', hasRequiredFilters);
      this.$id('msg-empty').toggleClass('hidden', this.model.length > 0);
    },

    renderPlans: function()
    {
      var view = this;
      var selector = '#' + view.idPrefix + '-plans';

      view.removeView(selector);

      view.model.forEach(function(dailyMrpPlan)
      {
        var planView = new DailyMrpPlanView({model: dailyMrpPlan});

        view.insertView(selector, planView);

        planView.render();
      });
    },

    onImport: function(data)
    {
      this.model.setCurrentFilter(data);
      this.storeCurrentFilter();
      this.filterView.render();
    },

    onReset: function()
    {
      this.storeCurrentFilter();
      this.updateClientUrl();
      this.renderPlans();
      this.toggleMessages();
    },

    onSync: function()
    {
      if (this.layout)
      {
        this.layout.setBreadcrumbs(this.breadcrumbs, this);
      }
    },

    storeCurrentFilter: function()
    {
      localStorage.setItem('PLANNING:FILTER', JSON.stringify(this.model.getCurrentFilter()));
    },

    readCurrentFilterIfNeeded: function()
    {
      var storedFilter = JSON.parse(localStorage.getItem('PLANNING:FILTER') || '{}');
      var currentFilter = this.model.getCurrentFilter();
      var changed = false;

      if (!currentFilter.date && storedFilter.date)
      {
        currentFilter.date = storedFilter.date;
        changed = true;
      }

      if (_.isEmpty(currentFilter.mrp) && !_.isEmpty(storedFilter.mrp))
      {
        currentFilter.mrp = storedFilter.mrp;
        changed = true;
      }

      if (changed)
      {
        this.model.setCurrentFilter(currentFilter);
      }
    },

    onWrapChange: function()
    {
      this.$el.toggleClass('wrap', !!this.model.options.get('wrap'));
    },

    onSettingsChange: function(setting)
    {
      if (setting.id === 'production.lineAutoDowntimes')
      {
        autoDowntimeCache.clear();
      }
    },

    updateClientUrl: function()
    {
      this.broker.publish('router.navigate', {
        url: '/dailyMrpPlans?' + this.model.rqlQuery,
        trigger: false,
        replace: true
      });
    },

    handleDragEvent: function(e)
    {
      if (e.type === 'dragstart')
      {
        this.sortableDragged = e.target.classList.contains('select2-search-choice');

        return;
      }

      e.preventDefault();
      e.stopPropagation();
    },

    onDrop: function(e)
    {
      if (this.sortableDragged)
      {
        this.sortableDragged = false;

        return;
      }

      e = e.originalEvent;

      e.preventDefault();
      e.stopPropagation();

      if (!e.dataTransfer.files.length)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('hourlyPlans', 'planning:msg:filesOnly')
        });
      }

      var file = _.find(e.dataTransfer.files, function(file)
      {
        return /vnd.ms-excel.sheet|spreadsheetml.sheet/.test(file.type) && /\.xls(x|m)$/.test(file.name);
      });

      if (!file)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('hourlyPlans', 'planning:msg:invalidFile')
        });
      }

      viewport.msg.loading();

      var formData = new FormData();

      formData.append('plan', file);

      var view = this;
      var req = view.ajax({
        type: 'POST',
        url: '/dailyMrpPlans;parse',
        data: formData,
        processData: false,
        contentType: false
      });

      req.fail(function()
      {
        viewport.msg.loadingFailed();
      });

      req.done(function(mrpToOrdersMap)
      {
        viewport.msg.loaded();

        view.showImportDialog(mrpToOrdersMap);
      });
    },

    onBodyKeyDown: function(e)
    {
      if (e.keyCode === 27)
      {
        this.$('.is-selected').click();
      }
      else if (e.keyCode === 13)
      {
        var $popover = this.$('.dailyMrpPlan-popover-editable');

        if ($popover.length)
        {
          this.saveChanges($popover);
        }
      }
    },

    onBodyPaste: function(e)
    {
      if (e.target.tagName === 'INPUT')
      {
        return;
      }

      var input = e.originalEvent.clipboardData.getData('text/plain') || '';
      var mrpToOrdersMap = this.parseInput(input);

      this.showImportDialog(mrpToOrdersMap);
    },

    parseInput: function(input)
    {
      var mrpToOrdersMap = {
        __DATE__: this.filterView.$id('date').val() || null
      };
      var currentMrp = null;
      var orderProps = ['_id', 'nc12', 'name', 'qty', 'rbh', 'operators', 'shifts'];
      var date = null;

      input.split('\n').forEach(function(line)
      {
        if (!date)
        {
          var dateMatches = line.match(/([0-9]{1,2}[^0-9][0-9]{1,2}[^0-9][0-9]{4})/);

          if (dateMatches)
          {
            date = dateMatches[1];

            return;
          }
        }

        line = ' ' + line + ' ';

        if (/\s+[0-9]{9}\s+/.test(line))
        {
          var order = {};
          var propI = 0;

          line.trim().split('\t').forEach(function(part)
          {
            if (propI === orderProps.length)
            {
              return;
            }

            part = part.trim();

            if (propI === 0)
            {
              if (/^[0-9]{9}$/.test(part))
              {
                order._id = part;
                propI += 1;
              }

              return;
            }

            if (/^[0-9]+(,[0-9]+)?$/.test(part))
            {
              part = parseFloat(part.replace(',', '.'));
            }

            order[orderProps[propI]] = part;
            propI += 1;
          });

          if (!mrpToOrdersMap[currentMrp])
          {
            mrpToOrdersMap[currentMrp] = [];
          }

          mrpToOrdersMap[currentMrp].push(order);

          return;
        }

        var mrpMatches = line.match(/\s+([A-Z][A-Z0-9]{2})\s+/);

        if (mrpMatches)
        {
          currentMrp = mrpMatches[1];

          if (!mrpToOrdersMap[currentMrp])
          {
            mrpToOrdersMap[currentMrp] = [];
          }

          return;
        }
      });

      var moment = time.getMoment(date, 'DD.MM.YYYY');

      if (moment.isValid())
      {
        mrpToOrdersMap.__DATE__ = moment.format('YYYY-MM-DD');
      }

      return mrpToOrdersMap;
    },

    showImportDialog: function(mrpToOrdersMap)
    {
      if (viewport.currentDialog)
      {
        return;
      }

      var date = mrpToOrdersMap.__DATE__;

      delete mrpToOrdersMap.__DATE__;

      if (_.isEmpty(mrpToOrdersMap))
      {
        return;
      }

      var importDialog = new DailyMrpPlanImportView({
        model: {
          dailyMrpPlans: this.model,
          date: date,
          mrpToOrdersMap: mrpToOrdersMap
        }
      });

      this.listenToOnce(importDialog, 'imported', function()
      {
        viewport.closeDialog();
      });

      viewport.showDialog(importDialog, t('hourlyPlans', 'planning:import:title'));
    },

    saveChanges: function($popover)
    {
      var plan = this.model.get($popover.attr('data-plan'));

      if (!plan)
      {
        return;
      }

      var itemType = $popover.attr('data-item-type');

      if (itemType === 'order')
      {
        plan.orders.trigger('saveChangesRequested');
      }
      else if (itemType === 'line')
      {
        plan.lines.trigger('saveChangesRequested');
      }
    },

    checkOverlappingLines: function()
    {
      var page = this;

      if (!this.model.length)
      {
        return;
      }

      var date = page.model.at(0).date.getTime();
      var url = '/dailyMrpPlans'
        + '?select(lines._id,lines.activeFrom,lines.activeTo)'
        + '&date=' + date;

      page.ajax({url: url}).done(function(res)
      {
        page.model.trigger('checkingOverlappingLines');

        var planToLines = {};
        var lineToPlans = {};

        _.forEach(res.collection, function(plan)
        {
          if (_.isEmpty(plan.lines))
          {
            return;
          }

          planToLines[plan._id] = {};

          plan.lines.forEach(function(line)
          {
            if (!lineToPlans[line._id])
            {
              lineToPlans[line._id] = [];
            }

            lineToPlans[line._id].push(plan._id);

            planToLines[plan._id][line._id] = {
              activeFrom: DailyMrpPlanLine.getActiveFromMoment(date, line.activeFrom).toDate(),
              activeTo: DailyMrpPlanLine.getActiveToMoment(date, line.activeTo).toDate(),
            };
          });
        });

        _.forEach(lineToPlans, function(plans, line)
        {
          if (plans.length === 1)
          {
            return;
          }

          page.checkLineOverlapping(line, plans.map(function(plan)
          {
            return {
              line: line,
              plan: plan,
              from: planToLines[plan][line].activeFrom,
              to: planToLines[plan][line].activeTo,
            };
          }));
        });
      });
    },

    checkLineOverlapping: function(line, plans)
    {
      for (var i = 0; i < plans.length; ++i)
      {
        var a = plans[i];

        for (var ii = i + 1; ii < plans.length; ++ii)
        {
          var b = plans[ii];

          if (a.from >= b.to || a.to <= b.from)
          {
            continue;
          }

          var aPlan = this.model.get(a.plan);

          if (aPlan)
          {
            aPlan.trigger('overlappingLine', {
              line: line,
              plan: b.plan,
              mrp: b.plan.split('-')[1],
              from1: time.format(a.from, 'HH:mm'),
              from2: time.format(b.from, 'HH:mm'),
              to1: time.format(a.to, 'HH:mm'),
              to2: time.format(b.to, 'HH:mm')
            });
          }

          var bPlan = this.model.get(b.plan);

          if (bPlan)
          {
            bPlan.trigger('overlappingLine', {
              line: line,
              plan: a.plan,
              mrp: a.plan.split('-')[1],
              from1: time.format(b.from, 'HH:mm'),
              from2: time.format(a.from, 'HH:mm'),
              to1: time.format(b.to, 'HH:mm'),
              to2: time.format(a.to, 'HH:mm')
            });
          }
        }
      }
    }

  });
});
