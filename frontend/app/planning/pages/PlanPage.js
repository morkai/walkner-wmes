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
  'app/wh-lines/WhLineCollection',
  'app/planning-orderGroups/OrderGroupCollection',
  '../Plan',
  '../PlanSettings',
  '../PlanDisplayOptions',
  '../WhProblemCollection',
  '../views/PlanFilterView',
  '../views/PlanMrpView',
  '../views/CopySettingsDialogView',
  'app/planning/templates/planPage',
  'app/planning/templates/planLegend',
  'app/planning/templates/planSettingsPageAction',
  'app/planning/templates/whPageAction'
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
  WhLineCollection,
  OrderGroupCollection,
  Plan,
  PlanSettings,
  PlanDisplayOptions,
  WhProblemCollection,
  PlanFilterView,
  PlanMrpView,
  CopySettingsDialogView,
  pageTemplate,
  legendTemplate,
  planSettingsPageActionTemplate,
  whPageActionTemplate
) {
  'use strict';

  var reloadProdState = false;

  return View.extend({

    template: pageTemplate,

    layoutName: 'page',

    modelProperty: 'plan',

    breadcrumbs: function()
    {
      return [
        {
          href: '#planning/plans',
          label: this.t('BREADCRUMB:base')
        },
        {
          href: '#planning/plans/' + this.plan.id,
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
      var firstShiftMoment = time.getMoment(page.plan.id, 'YYYY-MM-DD').hours(6);

      return [
        {
          label: page.t('PAGE_ACTION:hourlyPlans'),
          icon: 'calendar',
          privileges: 'HOURLY_PLANS:VIEW',
          href: '#hourlyPlans?sort(-date)&limit(-1337)'
            + '&date=ge=' + firstShiftMoment.valueOf()
            + '&date=lt=' + firstShiftMoment.add(1, 'days').valueOf()
        },
        {
          label: page.t('PAGE_ACTION:paintShop'),
          icon: 'paint-brush',
          privileges: 'PAINT_SHOP:VIEW',
          href: '#paintShop/' + page.plan.id
        },
        {
          privileges: 'WH:VIEW',
          template: function() { return whPageActionTemplate({id: page.plan.id}); }
        },
        {
          label: page.t('PAGE_ACTION:changes'),
          icon: 'list-ol',
          href: '#planning/changes?sort(date)&plan=' + page.plan.id
        },
        {
          template: function()
          {
            return page.renderPartialHtml(planSettingsPageActionTemplate, {
              id: page.plan.id,
              editable: page.plan.isEditable()
            });
          },
          afterRender: function($action)
          {
            $action.find('[data-action="openSettings"]').on('click', function(e)
            {
              if (e.button === 0 && !e.ctrlKey && page.plan.isEditable())
              {
                page.broker.publish('router.navigate', {
                  url: '/planning/settings/' + page.plan.id + '?back=1',
                  trigger: true,
                  replace: false
                });

                return false;
              }
            });

            $action.find('[data-action="copySettings"]').on('click', function()
            {
              if (this.parentNode.classList.contains('disabled'))
              {
                return;
              }

              var dialogView = new CopySettingsDialogView({
                model: page.plan
              });

              viewport.showDialog(dialogView, page.t('copySettings:title'));

              return false;
            });
          }
        },
        {
          label: page.t('PAGE_ACTION:legend'),
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
      'planning.generator.started': function(message)
      {
        if (message.date === this.plan.id && !this.$msg)
        {
          this.$msg = viewport.msg.show({
            type: 'info',
            text: this.t('MSG:GENERATING')
          });
        }
      },
      'planning.generator.finished': function(message)
      {
        var $msg = this.$msg;

        if ($msg && message.date === this.plan.id)
        {
          viewport.msg.hide($msg);

          this.$msg = null;
        }
      },
      'orders.synced': function()
      {
        this.reloadOrders();
        this.reloadWorkingLines();
      },
      'orders.updated.*': function(message)
      {
        var lateOrder = this.plan.lateOrders.get(message._id);
        var change = message.change;
        var newValues = change.newValues;

        if (lateOrder && typeof newValues.delayReason !== 'undefined')
        {
          lateOrder.set('delayReason', newValues.delayReason);
        }

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
      'shiftChanged': function(newShift)
      {
        this.plan.set('active', time.format(newShift.date, 'YYYY-MM-DD') === this.plan.id);
      },
      'production.stateChanged.**': function(message)
      {
        this.plan.shiftOrders.update(message);
      },
      'old.wh.lines.updated': function(message)
      {
        if (this.plan.whLines.length)
        {
          this.plan.whLines.handleUpdate(message);
        }
      },
      'old.wh.problems.*.*': function(change)
      {
        this.plan.whProblems.handleChange(change);
      }
    },

    localTopics: {
      'socket.connected': function() { this.reload(true); },
      'socket.disconnected': function() { reloadProdState = true; },
      'planning.mrpStatsRecounted': 'scheduleStatRecount'
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
      this.$msg = null;
      this.keysPressed = ['', '', ''];
      this.lastKeyPressAt = 0;

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
          division: page.options.division,
          mrps: page.options.mrps
        }),
        settings: PlanSettings.fromDate(page.options.date),
        minMaxDates: true,
        activeMrps: true
      });

      plan.whLines = new WhLineCollection(null, {
        paginate: false
      });

      plan.whProblems = new WhProblemCollection();

      page.delayReasons = new DelayReasonCollection(null, {
        rqlQuery: 'sort(name)&limit(0)',
        paginate: false
      });

      page.orderGroups = new OrderGroupCollection(null, {
        rqlQuery: 'select(name,mrp)&sort(name)&limit(0)&target=plan',
        paginate: false,
        sortByName: true
      });

      bindLoadingMessage(productionState, page);
      bindLoadingMessage(page.delayReasons, page);
      bindLoadingMessage(page.orderGroups, page);
      bindLoadingMessage(plan, page);
      bindLoadingMessage(plan.settings, page);
      bindLoadingMessage(plan.whLines, page);
      bindLoadingMessage(plan.whProblems, page);
      bindLoadingMessage(plan.workingLines, page);
      bindLoadingMessage(plan.lateOrders, page);
      bindLoadingMessage(plan.sapOrders, page);
      bindLoadingMessage(plan.shiftOrders, page);

      window.plan = plan;
    },

    defineViews: function()
    {
      this.filterView = new PlanFilterView({plan: this.plan});

      this.setView('#-filter', this.filterView);
    },

    defineBindings: function()
    {
      var page = this;
      var plan = page.plan;
      var dispOpts = plan.displayOptions;

      page.listenTo(plan, 'sync', page.onPlanSynced);
      page.listenTo(plan, 'change:_id', page.onDateFilterChanged);

      page.listenTo(plan.settings, 'changed', page.onSettingsChanged);
      page.listenTo(plan.settings, 'errored', function() { page.reload(true); });

      page.listenTo(plan.orders, 'added', page.reloadOrders.bind(page, true));

      page.listenTo(plan.sapOrders, 'sync', page.onSapOrdersSynced);

      page.once('afterRender', function()
      {
        page.listenTo(dispOpts, 'change:mrps change:division', _.debounce(page.onMrpsFilterChanged.bind(page), 1));
        page.listenTo(dispOpts, 'change:wrapLists', page.onWrapListsChanged);
        page.listenTo(dispOpts, 'change:useDarkerTheme', page.onDarkerThemeChanged);
        page.listenTo(dispOpts, 'change:useLatestOrderData', page.updateUrl);

        page.listenTo(plan.mrps, 'reset', _.debounce(page.renderMrps.bind(page), 1));

        if (page.options.order)
        {
          page.focusOrder(page.options.order);
        }
      });

      $(document)
        .on('click.' + page.idPrefix, '.paintShop-breadcrumb', page.onBreadcrumbsClick.bind(page));

      $(window)
        .on('keydown.' + page.idPrefix, page.onWindowKeyDown.bind(page))
        .on('keyup.' + page.idPrefix, page.onWindowKeyUp.bind(page));
    },

    load: function(when)
    {
      var page = this;
      var plan = page.plan;
      var forceReloadProdState = reloadProdState;
      var deferred = $.Deferred();

      reloadProdState = false;

      var load1 = $.when(
        page.promised(productionState.load(forceReloadProdState)),
        page.promised(page.delayReasons.fetch({reset: true})),
        page.promised(page.orderGroups.fetch({reset: true})),
        page.promised(plan.settings.fetch()),
        page.promised(plan.workingLines.fetch({reset: true})),
        page.promised(plan.shiftOrders.fetch({reset: true})),
        page.promised(plan.sapOrders.fetch({reset: true})),
        plan.settings.getVersion() === 1 ? page.promised(plan.lateOrders.fetch({reset: true})) : null,
        page.promised(plan.whLines.fetch({reset: true})),
        page.promised(plan.whProblems.fetch())
      );

      load1.fail(function() { deferred.reject.apply(deferred, arguments); });

      load1.done(function()
      {
        var load2 = page.promised(plan.fetch());

        load2.fail(function() { deferred.reject.apply(deferred, arguments); });

        load2.done(function() { deferred.resolve(); });
      });

      return when(deferred.promise());
    },

    getTemplateData: function()
    {
      return {
        wrap: this.plan.displayOptions.isListWrappingEnabled(),
        darker: this.plan.displayOptions.isDarkerThemeUsed()
      };
    },

    afterRender: function()
    {
      productionState.load(false);

      this.renderMrps();
    },

    reload: function(all)
    {
      var page = this;
      var plan = page.plan;

      plan.set('loading', true);

      page.promised(plan.settings.set('_id', plan.id).fetch()).then(
        function()
        {
          var fetchOptions = {reset: true, reload: true};
          var forceReloadProdState = reloadProdState;

          reloadProdState = false;

          var promise = $.when(
            productionState.load(forceReloadProdState),
            all ? page.delayReasons.fetch(fetchOptions) : null,
            all ? page.orderGroups.fetch(fetchOptions) : null,
            all ? plan.whLines.fetch(fetchOptions) : null,
            all ? plan.whProblems.fetch({reload: true}) : null,
            plan.workingLines.fetch(fetchOptions),
            plan.shiftOrders.fetch(fetchOptions),
            plan.sapOrders.fetch(fetchOptions),
            plan.settings.getVersion() === 1 ? plan.lateOrders.fetch(fetchOptions) : null,
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
        url: '/planning/plans/' + plan.id
          + '?division=' + (plan.displayOptions.get('division') || '')
          + '&mrps=' + plan.displayOptions.get('mrps').join(',')
          + '&sapOrders=' + (plan.displayOptions.isLatestOrderDataUsed() ? 1 : 0),
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
        var mrpView = new PlanMrpView({
          delayReasons: page.delayReasons,
          orderGroups: page.orderGroups,
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

      clearTimeout(this.timers.recountStats);

      this.recountStats();
    },

    reloadOrders: function(onlySap)
    {
      if (this.timers.reloadOrders)
      {
        clearTimeout(this.timers.reloadOrders);
        this.timers.reloadOrders = null;
      }

      if (!onlySap && this.plan.settings.getVersion() === 1)
      {
        this.promised(this.plan.lateOrders.fetch({reset: true}));
      }

      this.promised(this.plan.sapOrders.fetch({reset: true}));
    },

    reloadWorkingLines: function()
    {
      this.promised(this.plan.workingLines.fetch({reset: true}));
    },

    scheduleStatRecount: function()
    {
      if (this.timers.recountStats)
      {
        clearTimeout(this.timers.recountStats);
      }

      this.timers.recountStats = setTimeout(this.recountStats.bind(this), 10);
    },

    recountStats: function()
    {
      this.filterView.recountStats();
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

    toggleLineOrdersList: function()
    {
      var $mrps = this.$('.planning-mrp');
      var oldScrollY = window.scrollY;
      var scrollToMrpEl = null;

      if ($mrps.length > 1 && oldScrollY > $mrps[0].offsetTop)
      {
        scrollToMrpEl = $mrps[$mrps.length - 1];

        if (oldScrollY + window.innerHeight < document.scrollingElement.scrollHeight)
        {
          for (var i = 0; i < $mrps.length; ++i)
          {
            scrollToMrpEl = $mrps[i];

            if (oldScrollY < scrollToMrpEl.offsetTop + 125)
            {
              break;
            }
          }
        }
      }

      this.plan.displayOptions.toggleLineOrdersList();

      if (scrollToMrpEl)
      {
        window.scrollTo(0, scrollToMrpEl.offsetTop - ($mrps[0] === scrollToMrpEl ? 10 : -1));
      }
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
      this.plan.lateOrders.reset([]);
      this.plan.orders.reset([]);
      this.plan.lines.reset([]);

      this.reload();
    },

    onMrpsFilterChanged: function()
    {
      this.updateUrl();
      this.plan.mrps.reset();
    },

    onWrapListsChanged: function()
    {
      this.$el.toggleClass('wrap', this.plan.displayOptions.isListWrappingEnabled());
    },

    onDarkerThemeChanged: function()
    {
      this.$el.toggleClass('planning-darker', this.plan.displayOptions.isDarkerThemeUsed());
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
        var skipToggleList = false;

        if (e.keyCode >= 48 && e.keyCode <= 90)
        {
          this.keysPressed.shift();
          this.keysPressed.push(e.originalEvent.key);

          var mrpId = this.keysPressed.join('').toUpperCase();

          if (this.plan.mrps.get(mrpId))
          {
            this.scrollToMrp(mrpId);

            skipToggleList = true;
          }
          else
          {
            skipToggleList = e.timeStamp - this.lastKeyPressAt <= 500;
          }
        }

        if (!skipToggleList && (e.keyCode === 79 || e.keyCode === 90))
        {
          this.toggleLineOrdersList();
        }
        else if (e.keyCode === 32)
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

      this.lastKeyPressAt = e.timeStamp;
    },

    focusOrder: function(orderNo)
    {
      var planOrder = this.plan.orders.get(orderNo);

      if (!planOrder)
      {
        return;
      }

      var planMrp = this.plan.mrps.get(planOrder.get('mrp'));

      if (!planMrp)
      {
        return;
      }

      planMrp.orders.trigger('preview', {
        source: 'page',
        orderNo: planOrder.id
      });
    }

  });
});
