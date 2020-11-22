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
  'app/wh/templates/problems/details',
  'app/wh/templates/problems/detailsOrderInfo',
  'app/wh/templates/problems/detailsFuncs',
  'app/wh/templates/problems/resetOrderEditor',
  'app/wh/templates/problems/solveProblemEditor'
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
  resetOrderEditorTemplate,
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
        minMaxDates: false
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
        whOrder: this.model.serialize(this.plan, 0, this.whOrders.getFilters(this.plan)),
        funcs: this.model.serializeProblemFuncs()
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
      var menu = [];

      if (this.model.get('set')
        && (funcId === 'platformer'
        || funcId === 'packer'
        || funcId === 'painter'
        || (funcId === 'kitter' && this.model.getFunc('platformer').picklist === 'ignore')))
      {
        menu.push({
          icon: 'fa-thumbs-up',
          label: this.t('problem:menu:solveProblem'),
          handler: this.solveProblem.bind(this, funcId)
        });
      }

      menu.push(
        {
          icon: 'fa-eraser',
          label: this.t('problem:menu:resetOrder'),
          handler: this.resetOrder.bind(this, false)
        },
        {
          icon: 'fa-times',
          label: this.t('problem:menu:cancelOrder'),
          handler: this.resetOrder.bind(this, true)
        }
      );

      var options = {
        className: 'wh-problems-menu',
        menu: menu
      };

      contextMenu.show(this, e.pageY - 24, e.pageX - 24, options);
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
        var $carts = $editor.find('[name="carts"]');
        var carts = ($carts.val() || '')
          .toUpperCase()
          .split(/[^0-9A-Z]+/)
          .filter(function(v) { return !!v.length; });
        var comment = $editor.find('[name="comment"]').val().trim();

        if (funcId !== 'lp10' && !carts.length)
        {
          $fields.prop('disabled', false);
          $carts.select();

          return false;
        }

        viewport.msg.saving();

        var req = WhOrderCollection.act(view.model.get('date'), 'solveProblem', {
          whOrderId: view.model.id,
          funcId: funcId,
          carts: carts
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

    resetOrder: function(cancel, e)
    {
      var view = this;
      var mode = cancel ? 'cancel' : 'reset';
      var $editor = view.renderPartial(resetOrderEditorTemplate, {
        yes: view.t('problem:editor:' + mode + 'Order:yes'),
        no: view.t('problem:editor:' + mode + 'Order:no'),
        comment: view.t('problem:editor:' + mode + 'Order:message', {
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
        var comment = $editor.find('textarea').val().trim();

        viewport.msg.saving();

        var req = WhOrderCollection.act(view.model.get('date'), 'resetOrders', {
          cancel: cancel,
          orders: [view.model.id]
        });

        req.done(function()
        {
          viewport.msg.saved();

          view.hideEditor();

          if (comment.length)
          {
            view.chatView.send(comment);
          }
        });

        req.fail(function()
        {
          var errorCode = req.responseJSON && req.responseJSON.error && req.responseJSON.error.code || null;

          if (view.t.has('problem:msg:' + errorCode))
          {
            viewport.msg.saved();

            viewport.msg.show({
              type: 'error',
              time: 3000,
              text: view.t('problem:msg:' + errorCode)
            });
          }
          else
          {
            viewport.msg.savingFailed();
          }


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
