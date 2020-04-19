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
  'app/wh-lines/WhLineCollection',
  'app/wh-lines/views/RedirLineDialogView',
  'app/wh-deliveredOrders/WhDeliveredOrderCollection',
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
  WhLineCollection,
  RedirLineDialogView,
  WhDeliveredOrderCollection,
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

    modelProperty: 'plan',

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
      this.listenTo(this.plan.whLines, 'add remove change:redirLine', this.onWhLineChanged);
    },

    destroy: function()
    {
      this.hideMenu();

      this.$el.popover('destroy');
    },

    getTemplateData: function()
    {
      var view = this;

      return {
        showEditButton: view.isEditable(),
        lines: view.mrp.lines.map(function(line)
        {
          return {
            _id: line.id,
            redirLine: view.serializeRedirLine(line),
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

    beforeRender: function()
    {
      this.$el.popover('destroy');
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
        className: 'planning-mrp-popover'
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
      var view = this;
      var line = view.mrp.lines.get(lineId);

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

      return this.renderPartialHtml(linePopoverTemplate, {
        line: {
          _id: lineId,
          division: lineUnits.division ? lineUnits.division : '?',
          prodFlow: prodFlow,
          prodLine: prodLine,
          activeTime: view.serializeActiveTime(line, true),
          workerCount: view.serializeWorkerCount(line),
          mrpPriority: line.settings ? line.settings.get('mrpPriority').join(', ') : '?',
          orderPriority: !lineMrpSettings
            ? '?'
            : lineMrpSettings.get('orderPriority')
              .map(function(v) { return view.t('orderPriority:' + v); })
              .join(', '),
          redirLine: view.serializeRedirLine(line),
          whLine: view.serializeWhLine(line)
        }
      });
    },

    serializeActiveTime: function(line, force)
    {
      if (!line.settings)
      {
        return '';
      }

      var activeTimes = (line.settings.get('activeTime') || [])
        .map(function(activeTime) { return activeTime.from + '-' + activeTime.to; })
        .join(', ');

      if (!activeTimes || activeTimes === '06:00-06:00')
      {
        return force ? '06:00-06:00' : '';
      }

      return activeTimes;
    },

    serializeRedirLine: function(line)
    {
      var whLine = this.plan.whLines.get(line.id);

      return whLine && whLine.get('redirLine') || null;
    },

    serializeWhLine: function(line)
    {
      var whLine = this.plan.whLines.get(line.id);

      if (!whLine)
      {
        return null;
      }

      var redirLine = this.plan.whLines.get(whLine.get('redirLine'));

      if (redirLine)
      {
        return redirLine.attributes;
      }

      return whLine ? whLine.attributes : null;
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
        return workerCount[0].toLocaleString();
      }

      return workerCount.map(function(v) { return v.toLocaleString(); }).join('; ');
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
          label: this.t('lines:menu:mrpPriority'),
          handler: this.handleMrpPriorityAction.bind(this)
        },
        {
          icon: 'fa-user',
          label: this.t('lines:menu:workerCount'),
          handler: this.handleWorkerCountAction.bind(this)
        },
        {
          icon: 'fa-star-half-o',
          label: this.t('lines:menu:orderPriority'),
          handler: this.handleOrderPriorityAction.bind(this)
        }
      ]);
    },

    isEditable: function()
    {
      if (window.ENV === 'development' && user.isAllowedTo('SUPER'))
      {
        return true;
      }

      return this.plan.canEditSettings() && !this.plan.settings.isMrpLocked(this.mrp.id);
    },

    showLineMenu: function(e)
    {
      var line = this.mrp.lines.get(this.$(e.currentTarget).attr('data-id'));
      var menu = [];

      if (this.isEditable())
      {
        menu.push({
          icon: 'fa-cogs',
          label: this.t('lines:menu:settings'),
          handler: this.handleSettingsAction.bind(this, line)
        }, {
          icon: 'fa-times',
          label: this.t('lines:menu:remove'),
          handler: this.handleRemoveAction.bind(this, line)
        });

        if (this.plan.canFreezeOrders())
        {
          menu.push({
            icon: 'fa-lock',
            label: this.t('lines:menu:freezeOrders'),
            handler: this.handleFreezeOrdersAction.bind(this, line)
          });
        }
      }

      var whLine = this.plan.whLines.get(line.id);

      if (whLine)
      {
        if (WhDeliveredOrderCollection.can.view())
        {
          menu.push({
            icon: 'fa-cubes',
            label: this.t('lines:menu:deliveredOrders'),
            handler: this.handleDeliveredOrders.bind(this, line)
          });
        }

        if (WhLineCollection.can.redir())
        {
          menu.push({
            icon: 'fa-arrow-right',
            label: this.t('lines:menu:redirLine:' + (whLine.get('redirLine') ? 'stop' : 'start')),
            handler: this.handleRedirLine.bind(this, line)
          });
        }
      }

      if (menu.length)
      {
        contextMenu.show(this, e.pageY, e.pageX, menu);
      }
    },

    handleMrpPriorityAction: function()
    {
      var dialogView = new PlanLinesMrpPriorityDialogView({
        plan: this.plan,
        mrp: this.mrp
      });

      viewport.showDialog(dialogView, this.t('lines:menu:mrpPriority:title'));
    },

    handleWorkerCountAction: function()
    {
      var dialogView = new PlanLinesWorkerCountDialogView({
        plan: this.plan,
        mrp: this.mrp
      });

      viewport.showDialog(dialogView, this.t('lines:menu:workerCount:title'));
    },

    handleOrderPriorityAction: function()
    {
      var dialogView = new PlanLinesOrderPriorityDialogView({
        plan: this.plan,
        mrp: this.mrp
      });

      viewport.showDialog(dialogView, this.t('lines:menu:orderPriority:title'));
    },

    handleSettingsAction: function(line)
    {
      var dialogView = new PlanLineSettingsDialogView({
        plan: this.plan,
        mrp: this.mrp,
        line: line
      });

      viewport.showDialog(dialogView, this.t('lines:menu:settings:title'));
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
            text: view.t('lines:menu:remove:failure')
          });

          view.plan.settings.trigger('errored');

          dialogView.enableAnswers();
        });
      });

      viewport.showDialog(dialogView, view.t('lines:menu:remove:title'));
    },

    handleFreezeOrdersAction: function(line)
    {
      var dialogView = new PlanLineFreezeOrdersDialogView({
        plan: this.plan,
        mrp: this.mrp,
        line: line
      });

      viewport.showDialog(dialogView, this.t('lines:menu:freezeOrders:title'));
    },

    handleDeliveredOrders: function(line)
    {
      var whLine = this.plan.whLines.get(line.id);

      if (!whLine)
      {
        return;
      }

      var redirLine = this.plan.whLines.get(whLine.get('redirLine'));

      var lineId = encodeURIComponent(redirLine ? redirLine.id : whLine.id);

      window.open('/#wh/deliveredOrders?sort(date,set,startTime)&limit(-1337)&status=in=(todo,blocked)&line=' + lineId);
    },

    handleRedirLine: function(line)
    {
      var sourceLine = this.plan.whLines.get(line.id);

      if (!sourceLine)
      {
        return;
      }

      var dialogView = new RedirLineDialogView({
        model: sourceLine
      });

      viewport.showDialog(
        dialogView,
        dialogView.t('redirLine:title:' + (sourceLine.get('redirLine') ? 'stop' : 'start'))
      );
    },

    onSettingsChanged: function(changes)
    {
      if ((changes.lines.any && changes.mrps[this.mrp.id])
        || changes.locked)
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
    },

    onWhLineChanged: function(whLine)
    {
      if (!this.mrp.lines.get(whLine.id))
      {
        return;
      }

      var redirLine = whLine.get('redirLine') || null;

      this.$('.is-line[data-id="' + whLine.id + '"]')
        .find('span[data-property="redirLine"]')
        .toggleClass('hidden', !redirLine)
        .find('span')
        .text(redirLine || '');
    }

  });
});
