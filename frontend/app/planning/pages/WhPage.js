// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/time',
  'app/core/Model',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/delayReasons/DelayReasonCollection',
  'app/factoryLayout/productionState',
  'app/paintShop/views/PaintShopDatePickerView',
  '../Plan',
  '../PlanSettings',
  '../PlanDisplayOptions',
  '../views/PlanFilterView',
  '../views/WhMrpView',
  'app/planning/templates/whPage',
  'app/planning/templates/planLegend'
], function(
  _,
  $,
  t,
  viewport,
  time,
  Model,
  View,
  bindLoadingMessage,
  DelayReasonCollection,
  productionState,
  PaintShopDatePickerView,
  Plan,
  PlanSettings,
  PlanDisplayOptions,
  PlanFilterView,
  WhMrpView,
  pageTemplate,
  legendTemplate
) {
  'use strict';

  var reloadProdState = false;

  return View.extend({

    template: pageTemplate,

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('planning', 'BREADCRUMBS:wh')
        },
        {
          href: '#planning/wh/' + this.plan.id,
          label: this.plan.getLabel(),
          template: function(breadcrumb)
          {
            return '<span class="paintShop-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a>'
              + '<a href="' + breadcrumb.href + '" data-action="showPicker">' + breadcrumb.label + '</a>'
              + '<a class="fa fa-chevron-right" data-action="next"></a></span>';
          }
        }
      ];
    },

    actions: function()
    {
      var page = this;

      return [
        {
          label: t.bound('planning', 'PAGE_ACTION:dailyPlan'),
          icon: 'calculator',
          privileges: 'PLANNING:VIEW',
          href: '#planning/plans/' + page.plan.id
        },
        {
          label: t.bound('planning', 'PAGE_ACTION:legend'),
          icon: 'question-circle',
          callback: function()
          {
            page.toggleLegend(this.querySelector('.btn'));

            return false;
          }
        }
      ];
    },

    remoteTopics: {
      'planning.changes.created': function(planChange)
      {
        this.plan.applyChange(planChange);
      },
      'orders.synced': function()
      {
        this.reloadOrders();
      },
      'orders.updated.*': function(message)
      {
        var change = message.change;
        var newValues = change.newValues;

        var sapOrder = this.plan.sapOrders.get(message._id);

        if (!sapOrder)
        {
          return;
        }

        var attrs = _.clone(newValues);

        if (!_.isEmpty(change.comment))
        {
          attrs.comments = sapOrder.get('comments').concat({
            source: change.source,
            time: change.time,
            user: change.user,
            text: change.comment,
            delayReason: newValues.delayReason
          });
        }

        sapOrder.set(attrs);
      },
      'production.stateChanged.**': function(message)
      {
        this.plan.shiftOrders.update(message);
      },
      'paintShop.orders.updated.*': function(message)
      {
        var sapOrder = this.plan.sapOrders.get(message.order);

        if (sapOrder && message.status)
        {
          sapOrder.set('psStatus', message.status);
        }
      }
    },

    localTopics: {
      'socket.disconnected': function() { reloadProdState = true; }
    },

    events: {
      'click #-mrpSelector': 'hideMrpSelector',
      'click #-mrpSelector .btn': function(e)
      {
        this.scrollToMrp(e.currentTarget.dataset.mrp);
      }
    },

    initialize: function()
    {
      this.keysPressed = ['', '', ''];

      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    destroy: function()
    {
      $(document).off('.' + this.idPrefix);
      $(window).off('.' + this.idPrefix);

      productionState.unload();
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    defineModels: function()
    {
      var page = this;

      var plan = page.plan = new Plan({_id: page.options.date}, {
        displayOptions: PlanDisplayOptions.fromLocalStorage({
          mrps: page.options.mrps
        }),
        settings: PlanSettings.fromDate(page.options.date),
        minMaxDates: true,
        pceTimes: false
      });

      page.delayReasons = new DelayReasonCollection();

      var nlsPrefix = 'MSG:LOADING_FAILURE:';
      var nlsDomain = 'planning';

      bindLoadingMessage(plan, page, nlsPrefix + 'plan', nlsDomain);
      bindLoadingMessage(plan.settings, page, nlsPrefix + 'settings', nlsDomain);
      bindLoadingMessage(plan.sapOrders, page, nlsPrefix + 'sapOrders', nlsDomain);
      bindLoadingMessage(plan.shiftOrders, page, nlsPrefix + 'shiftOrders', nlsDomain);
      bindLoadingMessage(page.delayReasons, page, nlsPrefix + 'delayReasons', nlsDomain);
      bindLoadingMessage(productionState, page, nlsPrefix + 'productionState', nlsDomain);

      window.plan = plan;
    },

    defineViews: function()
    {
      this.filterView = new PlanFilterView({
        plan: this.plan,
        toggles: false,
        stats: false
      });

      this.setView('#-filter', this.filterView);
    },

    defineBindings: function()
    {
      var page = this;
      var plan = page.plan;

      page.listenTo(plan, 'sync', page.onPlanSynced);
      page.listenTo(plan, 'change:_id', page.onDateFilterChanged);

      page.listenTo(plan.displayOptions, 'change:mrps', page.onMrpsFilterChanged);
      page.listenTo(plan.displayOptions, 'change:wrapLists', page.onWrapListsChanged);
      page.listenTo(plan.displayOptions, 'change:useDarkerTheme', page.onDarkerThemeChanged);
      page.listenTo(plan.displayOptions, 'change:useLatestOrderData', page.updateUrl);

      page.listenTo(plan.settings, 'changed', page.onSettingsChanged);
      page.listenTo(plan.settings, 'errored', page.reload);

      page.listenTo(plan.mrps, 'reset', _.after(2, _.debounce(page.renderMrps.bind(page), 1)));

      page.listenTo(plan.sapOrders, 'sync', page.onSapOrdersSynced);

      $(document)
        .on('click.' + page.idPrefix, '.paintShop-breadcrumb', this.onBreadcrumbsClick.bind(this));

      $(window)
        .on('keydown.' + page.idPrefix, page.onWindowKeyDown.bind(page))
        .on('keyup.' + page.idPrefix, page.onWindowKeyUp.bind(page));
    },

    load: function(when)
    {
      var plan = this.plan;
      var forceReloadProdState = reloadProdState;

      reloadProdState = false;

      return when(
        productionState.load(forceReloadProdState),
        this.delayReasons.fetch({reset: true}),
        plan.settings.fetch(),
        plan.shiftOrders.fetch({reset: true}),
        plan.sapOrders.fetch({reset: true}),
        plan.fetch()
      );
    },

    afterRender: function()
    {
      productionState.load(false);

      this.renderMrps();
    },

    reload: function()
    {
      var page = this;
      var plan = page.plan;

      plan.set('loading', true);

      page.promised(plan.settings.set('_id', plan.id).fetch()).then(
        function()
        {
          var promise = $.when(
            plan.shiftOrders.fetch({reset: true, reload: true}),
            plan.sapOrders.fetch({reset: true, reload: true}),
            plan.fetch()
          );

          page.promised(promise).then(
            plan.set.bind(plan, 'loading', false),
            loadingFailed
          );
        },
        loadingFailed
      );

      function loadingFailed()
      {
        plan.set('loading', false);

        viewport.msg.loadingFailed();
      }
    },

    updateUrl: function()
    {
      var plan = this.plan;

      this.broker.publish('router.navigate', {
        url: '/planning/wh/' + plan.id + '?mrps=' + plan.displayOptions.get('mrps'),
        replace: true,
        trigger: false
      });
    },

    renderMrps: function()
    {
      var page = this;
      var loading = page.plan.isAnythingLoading();

      page.removeView('#-mrps');

      page.plan.mrps.forEach(function(mrp)
      {
        var mrpView = new WhMrpView({
          delayReasons: page.delayReasons,
          prodLineStates: productionState.prodLineStates,
          plan: page.plan,
          mrp: mrp
        });

        page.insertView('#-mrps', mrpView);

        if (!loading)
        {
          mrpView.render();
        }
      });

      this.$id('empty').toggleClass('hidden', page.plan.mrps.length > 0);
      this.$id('mrps').toggleClass('hidden', page.plan.mrps.length === 0);
    },

    reloadOrders: function()
    {
      this.promised(this.plan.sapOrders.fetch({reset: true}));
    },

    toggleLegend: function(btnEl)
    {
      if (this.$legendPopover)
      {
        this.$legendPopover.popover('destroy');
        this.$legendPopover = null;

        return;
      }

      this.$legendPopover = $(btnEl).popover({
        trigger: 'manual',
        placement: 'left',
        html: true,
        content: legendTemplate({}),
        template: '<div class="popover planning-legend-popover">'
        + '<div class="popover-content"></div>'
        + '</div>'
      });

      this.$legendPopover.one('hide.bs.popover', function()
      {
        btnEl.classList.remove('active');
      });

      this.$legendPopover.popover('show');

      btnEl.classList.add('active');
    },

    onBreadcrumbsClick: function(e)
    {
      if (e.target.tagName !== 'A')
      {
        return;
      }

      if (e.target.classList.contains('disabled'))
      {
        return false;
      }

      if (e.target.dataset.action === 'showPicker')
      {
        this.showDatePickerDialog();
      }
      else
      {
        this.selectNonEmptyDate(e.target.dataset.action);
      }

      return false;
    },

    showDatePickerDialog: function()
    {
      var dialogView = new PaintShopDatePickerView({
        model: {
          date: this.plan.id
        }
      });

      this.listenTo(dialogView, 'picked', function(newDate)
      {
        viewport.closeDialog();

        if (newDate !== this.plan.id)
        {
          this.plan.set('_id', newDate);
        }
      });

      viewport.showDialog(dialogView);
    },

    selectNonEmptyDate: function(dir)
    {
      $('.paintShop-breadcrumb').find('a').addClass('disabled');

      var page = this;
      var date = +page.plan.getMoment().valueOf();
      var month = 30 * 24 * 3600 * 1000;
      var url = '/planning/plans/?limit(1)&select(_id)&orders>()';

      if (dir === 'prev')
      {
        url += '&sort(-_id)&_id<' + date + '&_id>' + (date - month);
      }
      else
      {
        url += '&sort(_id)&_id>' + date + '&_id<' + (date + month);
      }

      var req = page.ajax({url: url});

      req.done(function(res)
      {
        if (res.totalCount)
        {
          page.plan.set('_id', time.utc.format(res.collection[0]._id, 'YYYY-MM-DD'));
        }
        else
        {
          viewport.msg.show({
            type: 'warning',
            time: 2500,
            text: t('paintShop', 'MSG:date:empty')
          });
        }
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: t('paintShop', 'MSG:date:failure')
        });
      });

      req.always(function()
      {
        if (page.layout)
        {
          page.layout.setBreadcrumbs(page.breadcrumbs, page);
        }
      });
    },

    showMrpSelector: function()
    {
      if (this.plan.mrps.length === 1)
      {
        return;
      }

      var grouped = {};

      this.plan.mrps.forEach(function(mrp)
      {
        var prefix = mrp.id.substring(0, 2);

        if (!grouped[prefix])
        {
          grouped[prefix] = [];
        }

        grouped[prefix].push(mrp.id);
      });

      var html = '';
      var i = 0;

      Object.keys(grouped).sort().forEach(function(prefix)
      {
        html += '<div class="planning-mrpSelector-row">';

        grouped[prefix].sort().forEach(function(mrp)
        {
          ++i;

          var key = i === 10 ? 0 : i < 10 ? i : -1;

          html += '<button type="button" class="btn btn-default btn-lg" '
            + 'data-mrp="' + mrp + '" data-key="' + key + '">'
            + mrp
            + (key >= 0 ? ('<kbd>' + key + '</kbd>') : '')
            + '</button>';
        });

        html += '</div>';
      });

      this.$('.planning-mrpSelector-mrps').html(html);
      this.$id('mrpSelector').removeClass('hidden');
    },

    hideMrpSelector: function()
    {
      this.$id('mrpSelector').addClass('hidden');
    },

    scrollToMrp: function(mrp)
    {
      var $mrp = this.$('.planning-mrp[data-id="' + mrp + '"]');
      var y = $mrp.prop('offsetTop');

      if (!$mrp.prev().length)
      {
        y -= 10;
      }

      $('html, body').animate({scrollTop: y}, 'fast', 'swing');
    },

    onDateFilterChanged: function()
    {
      if (this.layout)
      {
        this.layout.setBreadcrumbs(this.breadcrumbs, this);
        this.layout.setActions(this.actions, this);
      }

      this.updateUrl();

      this.plan.mrps.reset([]);
      this.plan.sapOrders.reset([]);
      this.plan.shiftOrders.reset([]);
      this.plan.orders.reset([]);
      this.plan.lines.reset([]);

      this.reload();
    },

    onMrpsFilterChanged: function()
    {
      this.updateUrl();
      this.plan.mrps.reset();
    },

    onPlanSynced: function()
    {
      if (this.layout)
      {
        this.layout.setBreadcrumbs(this.breadcrumbs, this);
        this.layout.setActions(this.actions, this);
      }
    },

    onSettingsChanged: function(changed)
    {
      if (changed.reset)
      {
        this.plan.mrps.reset();
      }
    },

    onSapOrdersSynced: function()
    {
      if (this.timers.reloadOrders)
      {
        clearTimeout(this.timers.reloadOrders);
      }

      this.timers.reloadOrders = setTimeout(this.reloadOrders.bind(this), 10 * 60 * 1000);
    },

    onWindowKeyDown: function(e)
    {
      if (e.keyCode === 32
        && e.target.tagName !== 'INPUT'
        && e.target.tagName !== 'TEXTAREA'
        && e.target.tagName !== 'BUTTON'
        && e.target.tagName !== 'A')
      {
        return false;
      }
    },

    onWindowKeyUp: function(e)
    {
      if (e.keyCode === 27)
      {
        this.broker.publish('planning.escapePressed');
        this.hideMrpSelector();
      }
      else if (e.target.tagName !== 'INPUT'
        && e.target.tagName !== 'TEXTAREA'
        && e.target.tagName !== 'BUTTON'
        && e.target.tagName !== 'A')
      {
        if (e.keyCode >= 48 && e.keyCode <= 90)
        {
          this.keysPressed.shift();
          this.keysPressed.push(e.originalEvent.key);

          var mrpId = this.keysPressed.join('').toUpperCase();

          if (this.plan.mrps.get(mrpId))
          {
            this.scrollToMrp(mrpId);
          }
        }

        if (e.keyCode === 32)
        {
          if (this.$id('mrpSelector').hasClass('hidden'))
          {
            this.showMrpSelector();
          }
          else
          {
            this.hideMrpSelector();
          }
        }
        else if (e.keyCode >= 48 && e.keyCode <= 57 && !this.$id('mrpSelector').hasClass('hidden'))
        {
          this.$('.planning-mrpSelector-row > .btn[data-key="' + (e.keyCode - 48) + '"]').click();
        }
      }
    }

  });
});
