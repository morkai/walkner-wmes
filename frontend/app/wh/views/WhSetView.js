// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/data/clipboard',
  'app/planning/util/contextMenu',
  'app/planning/PlanSapOrder',
  '../WhOrder',
  'app/core/templates/userInfo',
  'app/wh/templates/whSet',
  'app/wh/templates/whSetItem',
  'app/wh/templates/cartsEditor',
  'app/wh/templates/problemEditor',
  'app/wh/templates/printLabels'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  clipboard,
  contextMenu,
  PlanSapOrder,
  WhOrder,
  userInfoTemplate,
  setTemplate,
  setItemTemplate,
  cartsEditorTemplate,
  problemEditorTemplate,
  printLabelsTemplate
) {
  'use strict';

  var UPDATE_MENU_ITEMS = {
    picklistDone: [
      {label: 'true', value: true, icon: 'fa-thumbs-o-up'},
      {label: 'false', value: false, icon: 'fa-thumbs-o-down'},
      {label: 'null', value: null, manage: true}
    ],
    picklist: [
      {value: 'require', icon: 'fa-check'},
      {value: 'ignore', icon: 'fa-times'},
      {value: 'pending', manage: true}
    ],
    pickup: [
      {value: 'success', icon: 'fa-thumbs-o-up'},
      {value: 'failure', icon: 'fa-thumbs-o-down'},
      {value: 'pending', manage: true}
    ]
  };

  return View.extend({

    template: setTemplate,

    dialogClassName: 'wh-set-dialog',

    events: {
      'click .is-clickable': function(e)
      {
        var whOrder = this.whOrders.get(this.$(e.target).closest('tbody').attr('data-id'));
        var func = e.currentTarget.dataset.func;
        var prop = e.currentTarget.dataset.prop;

        this.showUpdateMenu(whOrder, func, prop, e);
      },
      'contextmenu .wh-set-action': function()
      {
        return false;
      },
      'mousedown .wh-set-action': function(e)
      {
        if (e.currentTarget.classList.contains('is-clickable'))
        {
          return;
        }

        var whOrder = this.whOrders.get(this.$(e.target).closest('tbody').attr('data-id'));
        var func = e.currentTarget.dataset.func;
        var prop = e.currentTarget.dataset.prop;

        this.timers.showFixUpdateMenu = setTimeout(this.showFixUpdateMenu.bind(this, whOrder, func, prop, e), 500);
      },
      'mouseup .wh-set-action': function()
      {
        clearTimeout(this.timers.showFixUpdateMenu);
        this.timers.showFixUpdateMenu = null;
      },
      'click': function()
      {
        this.hideEditor();
      },
      'click .btn[data-action="printLabels"]': function(e)
      {
        var view = this;
        var $editor = $(printLabelsTemplate());

        $editor.on('submit', function()
        {
          var order = $editor.data('whOrderId');
          var qty = +$editor.find('input').val();

          view.$('.wh-set-item[data-id="' + order + '"] .btn[data-action="printLabels"]')
            .prop('disabled', true)
            .find('.fa')
            .removeClass('fa-print')
            .addClass('fa-spinner fa-spin');

          view.hideEditor();

          var req = view.whOrders.act('printLabels', {
            order: order,
            qty: qty,
            func: view.model.user ? view.model.user.func : 'fmx'
          });

          req.fail(function()
          {
            viewport.msg.show({
              type: 'error',
              time: 2500,
              text: t('wh', 'printLabels:failure')
            });
          });

          req.always(function()
          {
            view.$('.wh-set-item[data-id="' + order + '"] .btn[data-action="printLabels"]')
              .prop('disabled', false)
              .find('.fa')
              .removeClass('fa-spinner fa-spin')
              .addClass('fa-print');
          });

          return false;
        });

        view.showEditor($editor, view.$(e.target).closest('.wh-set-actions')[0]);

        $editor.find('input').select();

        return false;
      }
    },

    initialize: function()
    {
      var view = this;

      view.listenTo(view.plan.sapOrders, 'reset', view.onOrdersReset);

      view.listenTo(view.whOrders, 'reset', view.onOrdersReset);
      view.listenTo(view.whOrders, 'change', view.onOrderChanged);

      $(window).on('keydown.' + this.idPrefix, function(e)
      {
        if (e.key === 'Escape')
        {
          if (view.$editor)
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

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        renderItem: setItemTemplate,
        items: this.serializeItems()
      };
    },

    serializeItems: function()
    {
      var view = this;

      return view.whOrders
        .filter(function(whOrder) { return whOrder.get('set') === view.model.set; })
        .map(function(whOrder, i) { return whOrder.serializeSet(view.plan, i, view.model.user); });
    },

    beforeRender: function()
    {
      clearTimeout(this.timers.render);
    },

    scheduleRender: function()
    {
      clearTimeout(this.timers.render);

      if (!this.plan.isAnythingLoading() && this.isRendered())
      {
        this.timers.render = setTimeout(this.renderIfNotLoading.bind(this), 1);
      }
    },

    renderIfNotLoading: function()
    {
      if (!this.plan.isAnythingLoading())
      {
        this.render();
      }
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showUpdateMenu: function(whOrder, func, prop, e)
    {
      var view = this;
      var canManage = user.isAllowedTo('WH:MANAGE');
      var menu = UPDATE_MENU_ITEMS[prop].map(function(item)
      {
        if (item.manage && !canManage)
        {
          return null;
        }

        return {
          icon: item.icon,
          label: t('wh', 'menu:' + prop + ':' + (item.label || item.value)),
          handler: view.handleUpdate.bind(view, whOrder, func, prop, item.value)
        };
      }).filter(function(item) { return !!item; });

      contextMenu.show(view, e.pageY - 17, e.pageX - 17, menu);
    },

    showFixUpdateMenu: function(whOrder, propFunc, prop, e)
    {
      var userFunc = whOrder.getUserFunc(this.model.user);

      if (!userFunc)
      {
        return;
      }

      var picklistDone = whOrder.get('picklistDone');

      switch (prop)
      {
        case 'picklistDone':
          if (picklistDone === null || whOrder.get('picklistFunc') !== userFunc._id)
          {
            return;
          }
          break;

        case 'picklist':
          if (!picklistDone || userFunc.status === 'pending' || propFunc !== userFunc._id)
          {
            return;
          }
          break;

        case 'pickup':
          if (userFunc.picklist === 'pending' || userFunc.pickup === 'ignore' || propFunc !== userFunc._id)
          {
            return;
          }
          break;
      }

      this.showUpdateMenu(whOrder, propFunc, prop, e);
    },

    showEditor: function($editor, el)
    {
      var view = this;

      view.hideEditor();

      $editor
        .data('whOrderId', view.$(el).closest('.wh-set-item')[0].dataset.id)
        .css({
          left: el.offsetLeft + 'px',
          top: el.offsetTop + 'px'
        })
        .appendTo('.modal-content');

      $editor.on('keydown', function(e)
      {
        if (e.key === 'Escape')
        {
          view.hideEditor();

          return false;
        }
      });

      view.$editor = $editor;
    },

    hideEditor: function()
    {
      if (this.$editor)
      {
        this.onOrderChanged(this.whOrders.get(this.$editor.data('whOrderId')));

        this.$editor.remove();
        this.$editor = null;
      }
    },

    handleUpdate: function(whOrder, func, prop, newValue)
    {
      var view = this;
      var newData = JSON.parse(JSON.stringify(whOrder.attributes));

      view.$('.wh-set-item[data-id="' + whOrder.id + '"]')
        .find('.wh-set-action[data-prop="' + prop + '"]' + (func ? ('[data-func="' + func + '"]') : ''))
        .removeClass('is-clickable')
        .find('.fa')
        .removeClass()
        .addClass('fa fa-spinner fa-spin');

      view.updateHandlers[prop].call(view, newData, newValue, func, function(update)
      {
        view.hideEditor();

        if (!update)
        {
          return view.onOrderChanged(whOrder);
        }

        var req = view.promised(view.whOrders.act('updateOrder', {
          order: update(JSON.parse(JSON.stringify(whOrder.attributes)))
        }));

        req.fail(function()
        {
          view.onOrderChanged(whOrder);

          viewport.msg.show({
            type: 'error',
            time: 2500,
            text: t('wh', 'update:failure')
          });
        });

        req.done(function(res)
        {
          whOrder.set(res.order);

          if (!whOrder.hasChanged())
          {
            view.onOrderChanged(whOrder);
          }
        });
      });
    },

    updateHandlers: {

      picklistDone: function(newData, newValue, propFunc, done)
      {
        done(function(newData)
        {
          newData.picklistDone = newValue;

          if (newValue === false)
          {
            newData.status = 'problem';
            newData.problem = '';
          }
          else
          {
            newData.status = 'started';
            newData.problem = '';
          }

          newData.funcs.forEach(function(func)
          {
            if (newValue)
            {
              if (newData.picklistFunc === func._id)
              {
                func.status = 'picklist';
                func.startedAt = new Date();
              }
              else if (func.user)
              {
                func.status = 'picklist';
              }
            }
            else
            {
              func.status = 'pending';
              func.startedAt = null;
            }

            func.finishedAt = null;
            func.picklist = 'pending';
            func.pickup = 'pending';
            func.carts = [];
            func.problemArea = '';
          });

          return newData;
        });
      },

      picklist: function(newData, newValue, propFunc, done)
      {
        var view = this;

        done(function(newData)
        {
          var func = newData.funcs[WhOrder.FUNC_TO_INDEX[propFunc]];

          func.picklist = newValue;
          func.carts = [];
          func.problemArea = '';

          switch (newValue)
          {
            case 'pending':
              func.status = 'picklist';
              func.pickup = 'pending';
              break;

            case 'require':
              func.status = 'pickup';
              func.pickup = 'pending';
              break;

            case 'ignore':
              func.status = 'finished';
              func.pickup = 'ignore';
              func.carts = [];
              func.problemArea = '';
              func.finishedAt = new Date();

              view.updateHandlers.finalizeOrder.call(view, newData);
              break;
          }

          return newData;
        });
      },

      pickup: function(newData, newValue, propFunc, done)
      {
        var view = this;

        switch (newValue)
        {
          case 'pending':
            done(function(newData)
            {
              var func = newData.funcs[WhOrder.FUNC_TO_INDEX[propFunc]];

              func.status = 'pickup';
              func.pickup = 'pending';
              func.carts = [];
              func.problemArea = '';
              func.finishedAt = null;

              view.updateHandlers.finalizeOrder.call(view, newData);

              return newData;
            });
            break;

          case 'success':
            view.updateHandlers.handlePickupSuccess.call(view, newData, propFunc, done);
            break;

          case 'failure':
            view.updateHandlers.handlePickupFailure.call(view, newData, propFunc, done);
            break;
        }
      },

      handlePickupSuccess: function(newData, propFunc, done)
      {
        var view = this;
        var $item = view.$('.wh-set-item[data-id="' + newData._id + '"]');
        var $prop = $item.find('.wh-set-action[data-prop="pickup"][data-func="' + propFunc + '"]');
        var $editor = $(cartsEditorTemplate({
          carts: newData.funcs[WhOrder.FUNC_TO_INDEX[propFunc]].carts.join(' ')
        }));

        $editor.on('submit', function()
        {
          done(function(newData)
          {
            var func = newData.funcs[WhOrder.FUNC_TO_INDEX[propFunc]];

            func.status = 'finished';
            func.pickup = 'success';
            func.carts = $editor.find('.form-control')
              .val()
              .split(/[^0-9]+/)
              .filter(function(v) { return !!v.length; })
              .map(function(v) { return +v; });
            func.problemArea = '';
            func.finishedAt = new Date();

            view.updateHandlers.finalizeOrder.call(view, newData);

            return newData;
          });

          return false;
        });

        view.showEditor($editor, $prop[0]);

        $editor.find('input').select();
      },

      handlePickupFailure: function(newData, propFunc, done)
      {
        var view = this;
        var func = newData.funcs[WhOrder.FUNC_TO_INDEX[propFunc]];
        var $item = view.$('.wh-set-item[data-id="' + newData._id + '"]');
        var $prop = $item.find('.wh-set-action[data-prop="pickup"][data-func="' + propFunc + '"]');
        var $editor = $(problemEditorTemplate({
          problemArea: func.problemArea,
          comment: func.comment
        }));

        $editor.on('submit', function()
        {
          done(function(newData)
          {
            var func = newData.funcs[WhOrder.FUNC_TO_INDEX[propFunc]];

            func.status = 'problem';
            func.pickup = 'failure';
            func.carts = [];
            func.problemArea = $editor.find('input').val().trim();
            func.comment = $editor.find('textarea').val().trim();
            func.finishedAt = new Date();

            view.updateHandlers.finalizeOrder.call(view, newData);

            return newData;
          });

          return false;
        });

        view.showEditor($editor, $prop[0]);

        $editor.find('input').select();
      },

      finalizeOrder: function(newData)
      {
        var anyProblem = newData.picklistDone === false;
        var allFinished = true;

        newData.funcs.forEach(function(func)
        {
          if (func.status === 'problem')
          {
            anyProblem = true;
          }

          if (func.status !== 'finished')
          {
            allFinished = false;
          }
        });

        if (anyProblem)
        {
          newData.status = 'problem';
          newData.finishedAt = new Date();
        }
        else if (allFinished)
        {
          newData.status = 'finished';
          newData.finishedAt = new Date();
        }
        else
        {
          newData.status = 'started';
          newData.finishedAt = null;
        }
      }

    },

    onCommentChange: function(sapOrder)
    {
      if (this.plan.orders.get(sapOrder.id))
      {
        this.$('tbody[data-order="' + sapOrder.id + '"] .planning-mrp-lineOrders-comment').html(
          sapOrder.getCommentWithIcon()
        );
      }
    },

    onOrdersReset: function(orders, options)
    {
      if (!options.reload)
      {
        this.scheduleRender();
      }
    },

    onPsStatusChanged: function(sapOrder)
    {
      var $item = this.$('tbody[data-order="' + sapOrder.id + '"]');

      if ($item.length)
      {
        var psStatus = this.plan.sapOrders.getPsStatus(sapOrder.id);

        $item
          .find('.planning-mrp-list-property-psStatus')
          .attr('title', t('planning', 'orders:psStatus:' + psStatus))
          .attr('data-ps-status', psStatus);
      }
    },

    onOrderChanged: function(whOrder)
    {
      var $item = this.$('tbody[data-id="' + whOrder.id + '"]');

      if (!$item.length)
      {
        return;
      }

      if (whOrder.get('set') !== this.model.set)
      {
        return $item.fadeOut('fast', function() { $item.remove(); });
      }

      $item.replaceWith(setItemTemplate({
        item: whOrder.serializeSet(
          this.plan,
          this.whOrders.indexOf(whOrder),
          this.model.user
        )
      }));
    }

  });
});
