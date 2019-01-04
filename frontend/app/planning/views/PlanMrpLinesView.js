// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/core/View',
  'app/core/views/DialogView',
  'app/data/orgUnits',
  '../util/contextMenu',
  './PlanLineSettingsDialogView',
  './PlanLinesMrpPriorityDialogView',
  './PlanLinesWorkerCountDialogView',
  './PlanLinesOrderPriorityDialogView',
  './PlanLineFreezeOrdersDialogView',
  'app/planning/templates/lines',
  'app/planning/templates/linePopover',
  'app/planning/templates/lineRemoveDialog'
], function(
  _,
  $,
  t,
  viewport,
  user,
  View,
  DialogView,
  orgUnits,
  contextMenu,
  PlanLineSettingsDialogView,
  PlanLinesMrpPriorityDialogView,
  PlanLinesWorkerCountDialogView,
  PlanLinesOrderPriorityDialogView,
  PlanLineFreezeOrdersDialogView,
  linesTemplate,
  linePopoverTemplate,
  lineRemoveDialogTemplate
) {
  'use strict';

  return View.extend({

    template: linesTemplate,

    events: {
      'contextmenu .is-line': function(e)
      {
        this.showLineMenu(e);

        return false;
      },
      'click #-edit': function(e)
      {
        this.$id('edit').blur();

        this.showLinesMenu(e);

        return false;
      }
    },

    localTopics: {
      'planning.windowResized': 'resize',
      'planning.escapePressed': 'hideMenu'
    },

    initialize: function()
    {
      this.listenTo(this.plan.settings, 'changed', this.onSettingsChanged);
      this.listenTo(this.mrp.lines, 'change:frozenOrders', this.onFrozenOrdersChanged);
    },

    destroy: function()
    {
      this.hideMenu();

      this.$el.popover('destroy');
    },

    serialize: function()
    {
      var view = this;

      return {
        idPrefix: view.idPrefix,
        showEditButton: view.plan.canEditSettings(),
        lines: view.mrp.lines.map(function(line)
        {
          return {
            _id: line.id,
            workerCount: view.serializeWorkerCount(line),
            customTimes: view.serializeActiveTime(line, false),
            frozenOrders: line.getFrozenOrderCount()
          };
        }).sort(function(a, b)
        {
          return a._id.localeCompare(b._id, undefined, {numeric: true, ignorePunctuation: true});
        })
      };
    },

    afterRender: function()
    {
      var view = this;

      view.$id('list').on('scroll', function(e)
      {
        view.$id('scrollIndicator').toggleClass('hidden', e.target.scrollLeft <= 40);
      });

      view.resize();

      view.$el.popover({
        container: this.el,
        selector: '.planning-mrp-list-item',
        trigger: 'hover',
        placement: 'top',
        html: true,
        hasContent: true,
        content: function() { return view.serializePopover(this.dataset.id); },
        template: '<div class="popover planning-mrp-popover">'
          + '<div class="arrow"></div>'
          + '<div class="popover-content"></div>'
          + '</div>'
      });
    },

    resize: function()
    {
      var $action = this.$('.planning-mrp-list-action');

      if (!$action.length)
      {
        return;
      }

      var $scrollIndicator = this.$id('scrollIndicator');
      var pos = $action.position();

      $scrollIndicator.css({
        top: (pos.top + 1) + 'px',
        left: ($action.outerWidth() + pos.left) + 'px'
      });

      contextMenu.hide(this);
    },

    $item: function(id)
    {
      return id ? this.$('.planning-mrp-list-item[data-id="' + id + '"]') : this.$('.planning-mrp-list-item');
    },

    serializePopover: function(lineId)
    {
      var line = this.mrp.lines.get(lineId);

      if (!line)
      {
        return '?';
      }

      var lineUnits = orgUnits.getAllForProdLine(lineId);
      var prodFlow = orgUnits.getByTypeAndId('prodFlow', lineUnits.prodFlow);
      var prodLine = orgUnits.getByTypeAndId('prodLine', lineUnits.prodLine);
      var lineMrpSettings = line.mrpSettings(this.mrp.id);

      prodFlow = prodFlow ? prodFlow.get('name') : '';
      prodLine = prodLine ? prodLine.get('description') : '';

      if (prodFlow.replace(/[^A-Za-z0-9]+/g, '').indexOf(prodLine.replace(/[^A-Za-z0-9]+/g, '')) !== -1)
      {
        prodLine = '';
      }

      return linePopoverTemplate({
        line: {
          _id: lineId,
          division: lineUnits.division ? lineUnits.division : '?',
          prodFlow: prodFlow,
          prodLine: prodLine,
          activeTime: this.serializeActiveTime(line, true),
          workerCount: this.serializeWorkerCount(line),
          mrpPriority: line.settings ? line.settings.get('mrpPriority').join(', ') : '?',
          orderPriority: !lineMrpSettings
            ? '?'
            : lineMrpSettings.get('orderPriority')
              .map(function(v) { return t('planning', 'orderPriority:' + v); })
              .join(', ')
        }
      });
    },

    serializeActiveTime: function(line, force)
    {
      if (!line.settings)
      {
        return '';
      }

      var activeTimes = line.settings.get('activeTime')
        .map(function(activeTime) { return activeTime.from + '-' + activeTime.to; })
        .join(', ');

      if (!activeTimes || activeTimes === '06:00-06:00')
      {
        return force ? '06:00-06:00' : '';
      }

      return activeTimes;
    },

    serializeWorkerCount: function(line)
    {
      var lineMrpSettings = line.mrpSettings(this.mrp.id);

      if (!lineMrpSettings)
      {
        return '?';
      }

      var workerCount = lineMrpSettings.get('workerCount');

      if (workerCount[0] === workerCount[1] && workerCount[0] === workerCount[2])
      {
        return workerCount[0].toString();
      }

      return workerCount.join(', ');
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showLinesMenu: function()
    {
      if (!this.plan.canEditSettings())
      {
        return;
      }

      var $edit = this.$id('edit');
      var pos = $edit.offset();

      contextMenu.show(this, pos.top + $edit.outerHeight() / 2, pos.left + $edit.outerWidth() / 2, [
        {
          icon: 'fa-check',
          label: t('planning', 'lines:menu:mrpPriority'),
          handler: this.handleMrpPriorityAction.bind(this)
        },
        {
          icon: 'fa-user',
          label: t('planning', 'lines:menu:workerCount'),
          handler: this.handleWorkerCountAction.bind(this)
        },
        {
          icon: 'fa-star-half-o',
          label: t('planning', 'lines:menu:orderPriority'),
          handler: this.handleOrderPriorityAction.bind(this)
        }
      ]);
    },

    showLineMenu: function(e)
    {
      if (!this.plan.canEditSettings())
      {
        return;
      }

      var line = this.mrp.lines.get(this.$(e.currentTarget).attr('data-id'));
      var menu = [
        {
          icon: 'fa-cogs',
          label: t('planning', 'lines:menu:settings'),
          handler: this.handleSettingsAction.bind(this, line)
        },
        {
          icon: 'fa-times',
          label: t('planning', 'lines:menu:remove'),
          handler: this.handleRemoveAction.bind(this, line)
        }
      ];

      if (this.plan.canFreezeOrders())
      {
        menu.push({
          icon: 'fa-lock',
          label: t('planning', 'lines:menu:freezeOrders'),
          handler: this.handleFreezeOrdersAction.bind(this, line)
        });
      }

      contextMenu.show(this, e.pageY, e.pageX, menu);
    },

    handleMrpPriorityAction: function()
    {
      var dialogView = new PlanLinesMrpPriorityDialogView({
        plan: this.plan,
        mrp: this.mrp
      });

      viewport.showDialog(dialogView, t('planning', 'lines:menu:mrpPriority:title'));
    },

    handleWorkerCountAction: function()
    {
      var dialogView = new PlanLinesWorkerCountDialogView({
        plan: this.plan,
        mrp: this.mrp
      });

      viewport.showDialog(dialogView, t('planning', 'lines:menu:workerCount:title'));
    },

    handleOrderPriorityAction: function()
    {
      var dialogView = new PlanLinesOrderPriorityDialogView({
        plan: this.plan,
        mrp: this.mrp
      });

      viewport.showDialog(dialogView, t('planning', 'lines:menu:orderPriority:title'));
    },

    handleSettingsAction: function(line)
    {
      var dialogView = new PlanLineSettingsDialogView({
        plan: this.plan,
        mrp: this.mrp,
        line: line
      });

      viewport.showDialog(dialogView, t('planning', 'lines:menu:settings:title'));
    },

    handleRemoveAction: function(line)
    {
      var view = this;
      var dialogView = new DialogView({
        autoHide: false,
        template: lineRemoveDialogTemplate,
        model: {
          plan: view.plan.getLabel(),
          mrp: view.mrp.getLabel(),
          line: line.getLabel()
        }
      });

      view.listenTo(dialogView, 'answered', function()
      {
        var lineSettings = view.plan.settings.lines.get(line.id);

        lineSettings.set('mrpPriority', _.without(lineSettings.get('mrpPriority'), view.mrp.id));

        var req = view.promised(view.plan.settings.save());

        req.done(dialogView.closeDialog);
        req.fail(function()
        {
          viewport.msg.show({
            type: 'error',
            time: 3000,
            text: t('planning', 'lines:menu:remove:failure')
          });

          view.plan.settings.trigger('errored');

          dialogView.enableAnswers();
        });
      });

      viewport.showDialog(dialogView, t('planning', 'lines:menu:remove:title'));
    },

    handleFreezeOrdersAction: function(line)
    {
      var dialogView = new PlanLineFreezeOrdersDialogView({
        plan: this.plan,
        mrp: this.mrp,
        line: line
      });

      viewport.showDialog(dialogView, t('planning', 'lines:menu:freezeOrders:title'));
    },

    onSettingsChanged: function(changedObjects)
    {
      if (changedObjects.lines.any && changedObjects.mrps[this.mrp.id])
      {
        this.render();
      }
    },

    onFrozenOrdersChanged: function(planLine)
    {
      var frozenOrders = planLine.getFrozenOrderCount();

      this.$('.is-line[data-id="' + planLine.id + '"]')
        .find('span[data-property="frozenOrders"]')
        .toggleClass('hidden', frozenOrders === 0)
        .find('span')
        .text(frozenOrders);
    }

  });
});
