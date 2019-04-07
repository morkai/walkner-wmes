// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/planning/Plan',
  'app/planning/PlanSettings',
  'app/planning/PlanDisplayOptions',
  'app/planning/util/contextMenu',
  '../WhOrder',
  '../WhOrderCollection',
  './WhProblemChatView',
  'app/wh/templates/problemDetails',
  'app/wh/templates/problemDetailsOrderInfo',
  'app/wh/templates/problemDetailsFuncs',
  'app/wh/templates/problemCancelOrderEditor',
  'app/wh/templates/problemSolveProblemEditor'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  userInfoTemplate,
  Plan,
  PlanSettings,
  PlanDisplayOptions,
  contextMenu,
  WhOrder,
  WhOrderCollection,
  WhProblemChatView,
  detailsTemplate,
  orderInfoTemplate,
  funcsTemplate,
  cancelOrderEditorTemplate,
  solveProblemEditorTemplate
) {
  'use strict';

  return View.extend({

    dialogClassName: 'wh-problems-dialog modal-no-keyboard',

    template: detailsTemplate,

    events: {
      'click .wh-problems-solvable': 'showProblemMenu',
      'contextmenu .wh-problems-solvable': 'showProblemMenu'
    },

    initialize: function()
    {
      var view = this;
      var planDate = time.utc.format(view.model.get('date'), 'YYYY-MM-DD');

      view.plan = new Plan({_id: planDate}, {
        displayOptions: PlanDisplayOptions.fromLocalStorage({}, {
          storageKey: 'PLANNING:DISPLAY_OPTIONS:WH'
        }),
        settings: PlanSettings.fromDate(planDate),
        minMaxDates: false,
        pceTimes: false
      });

      view.chatView = new WhProblemChatView({
        model: view.model,
        plan: view.plan
      });

      view.setView('#-chat', view.chatView);

      view.listenTo(view.model, 'remove', view.onOrderRemoved);
      view.listenTo(view.model, 'change', view.onOrderChanged);
      view.listenTo(view.model, 'change:status', view.onOrderStatusChanged);
      view.once('afterRender', view.loadPlan);

      $(window).on('keydown.' + this.idPrefix, function(e)
      {
        if (e.key === 'Escape')
        {
          if ($('.wh-problems-editor').length)
          {
            view.hideEditor();
          }
          else
          {
            viewport.closeDialog();
          }

          return false;
        }
      });
    },

    destroy: function()
    {
      $(window).off('keydown.' + this.idPrefix);

      this.hideEditor();
    },

    getTemplateData: function()
    {
      return {
        renderOrderInfo: orderInfoTemplate,
        renderFuncs: funcsTemplate,
        whOrder: this.model.serialize(this.plan, 0),
        funcs: {
          lp10: this.model.serializeProblemFunc('lp10'),
          fmx: this.model.serializeProblemFunc('fmx'),
          kitter: this.model.serializeProblemFunc('kitter'),
          packer: this.model.serializeProblemFunc('packer')
        }
      };
    },

    beforeRender: function()
    {
      this.hideEditor();
    },

    loadPlan: function()
    {
      var view = this;
      var orderNo = view.model.get('order');
      var sapOrderReq = view.ajax({url: '/planning/sapOrders/' + view.plan.id + '?orders=' + orderNo});
      var planOrderReq = view.ajax({url: '/planning/planOrders/' + view.plan.id + '?orders=' + orderNo});

      sapOrderReq.done(function(res)
      {
        if (res.totalCount)
        {
          view.plan.sapOrders.add(res.collection[0]);
        }
      });

      planOrderReq.done(function(res)
      {
        if (res.totalCount)
        {
          view.plan.orders.add(res.collection[0]);
        }
      });

      $.when(
        view.promised(view.plan.settings.fetch({})),
        sapOrderReq,
        planOrderReq
      ).done(function()
      {
        view.renderOrderInfo();
      });
    },

    showProblemMenu: function(e)
    {
      e.preventDefault();

      this.hideEditor();

      var funcId = this.$(e.target).closest('.wh-problems-func').attr('data-func');
      var options = {
        className: 'wh-problems-menu',
        menu: [
          {
            icon: 'fa-thumbs-up',
            label: this.t('problem:menu:solveProblem'),
            handler: this.solveProblem.bind(this, funcId)
          },
          {
            icon: 'fa-times',
            label: this.t('problem:menu:cancelOrder'),
            handler: this.cancelOrder.bind(this)
          }
        ]
      };

      contextMenu.show(this, e.pageY, e.pageX, options);
    },

    solveProblem: function(funcId, e)
    {
      var view = this;
      var $editor = view.renderPartial(solveProblemEditorTemplate, {
        carts: funcId !== 'lp10',
        comment: view.t('problem:editor:solveProblem:message', {
          qty: view.model.get('qty'),
          line: view.model.get('line'),
          func: funcId
        })
      });

      $editor.css({
        top: (e.pageY - (funcId === 'lp10' ? 0 : 34) - 74 - 45 / 2) + 'px',
        left: (e.pageX - 200 / 2) + 'px'
      });

      $editor.on('submit', function()
      {
        var $fields = $editor.find('input, textarea, button').prop('disabled', true);
        var carts = ($editor.find('[name="carts"]').val() || '')
          .split(/[^0-9]+/)
          .filter(function(v) { return !!v.length; })
          .map(function(v) { return +v; });
        var comment = $editor.find('[name="comment"]').val();

        viewport.msg.saving();

        var newData = JSON.parse(JSON.stringify(view.model.attributes));

        if (funcId === 'lp10')
        {
          newData.picklistDone = true;

          newData.funcs.forEach(function(func)
          {
            if (func.user)
            {
              func.status = 'picklist';
              func.startedAt = newData.startedAt;
            }
          });
        }
        else if (!carts.length)
        {
          $editor.find('[name="carts"]').select();

          return false;
        }
        else
        {
          var func = newData.funcs[WhOrder.FUNC_TO_INDEX[funcId]];

          func.status = 'finished';
          func.pickup = 'success';
          func.carts = carts;
          func.finishedAt = new Date();
        }

        WhOrder.finalizeOrder(newData);

        var req = WhOrderCollection.act(view.model.get('date'), 'updateOrder', {
          order: newData,
          events: [{
            type: 'problemResolved',
            order: newData._id,
            data: {
              func: funcId,
              carts: carts
            }
          }]
        });

        req.fail(function()
        {
          viewport.msg.savingFailed();

          $fields.prop('disabled', false);
        });

        req.done(function()
        {
          viewport.msg.saved();

          view.hideEditor();

          view.chatView.send(comment);
        });

        return false;
      });

      $editor.find('.btn-default').on('click', view.hideEditor.bind(view));

      $editor.appendTo(document.body);

      if (funcId === 'lp10')
      {
        var commentEl = $editor.find('[name="comment"]')[0];

        commentEl.setSelectionRange(commentEl.value.length, commentEl.value.length);
        commentEl.focus();
      }
      else
      {
        $editor.find('[name="carts"]').focus();
      }
    },

    cancelOrder: function(e)
    {
      var view = this;
      var $editor = view.renderPartial(cancelOrderEditorTemplate, {
        comment: view.t('problem:editor:cancelOrder:message', {
          qty: view.model.get('qty'),
          line: view.model.get('line')
        })
      });

      $editor.css({
        top: (e.pageY - 74 - 45 / 2) + 'px',
        left: (e.pageX - 200 / 2) + 'px'
      });

      $editor.find('.btn-primary').on('click', function()
      {
        var $fields = $editor.find('input, textarea, button').prop('disabled', true);
        var comment = $editor.find('textarea').val();

        viewport.msg.saving();

        var cancelReq = WhOrderCollection.act(view.model.get('date'), 'cancelOrders', {
          orders: [view.model.id]
        });

        cancelReq.done(function()
        {
          viewport.msg.saved();

          view.hideEditor();

          view.chatView.send(comment);
        });

        cancelReq.fail(function()
        {
          viewport.msg.savingFailed();

          $fields.prop('disabled', false);
        });
      });

      $editor.find('.btn-default').on('click', view.hideEditor.bind(view));

      $editor.appendTo(document.body);

      var commentEl = $editor.find('textarea')[0];

      commentEl.setSelectionRange(commentEl.value.length, commentEl.value.length);
      commentEl.focus();
    },

    hideEditor: function()
    {
      var $editor = $('.wh-problems-editor');

      if ($editor.length)
      {
        $editor.remove();

        return true;
      }

      return false;
    },

    renderOrderInfo: function()
    {
      this.$id('orderInfo').html(orderInfoTemplate(this.serialize()));
    },

    renderFuncs: function()
    {
      this.hideEditor();

      this.$id('funcs').html(funcsTemplate(this.serialize()));
    },

    onOrderRemoved: function()
    {
      this.renderFuncs();
    },

    onOrderChanged: function()
    {
      this.renderFuncs();
    },

    onOrderStatusChanged: function()
    {
      this.$id('orderInfo').toggleClass('is-cancelled', this.model.get('status') === 'cancelled');
    },

    onDialogShown: function()
    {
      this.chatView.onDialogShown();
    }

  });
});
