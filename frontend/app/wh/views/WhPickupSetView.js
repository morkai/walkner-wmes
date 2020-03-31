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
  'app/wh/templates/pickup/set/set',
  'app/wh/templates/pickup/set/setItem',
  'app/wh/templates/pickup/set/setPickupPopover',
  'app/wh/templates/pickup/set/cartsEditor',
  'app/wh/templates/pickup/set/problemEditor',
  'app/wh/templates/pickup/set/printLabels'
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
  setPickupPopoverTemplate,
  cartsEditorTemplate,
  problemEditorTemplate,
  printLabelsTemplate
) {
  'use strict';

  var UPDATE_MENU_ITEMS = {
    picklistDone: [
      {value: 'success', icon: 'fa-thumbs-o-up'},
      {value: 'failure', icon: 'fa-thumbs-o-down'},
      {value: 'pending', manage: true}
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

    dialogClassName: 'wh-set-dialog modal-no-keyboard',

    modelProperty: 'whOrders',

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
            funcId: view.model.user ? view.model.user.func : 'fmx'
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

      this.$el.popover('destroy');

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

    afterRender: function()
    {
      var view = this;

      view.$el.popover({
        selector: '[data-popover]',
        container: 'body',
        trigger: 'hover',
        placement: 'bottom',
        html: true,
        content: function()
        {
          var func = view.whOrders.get(view.$(this).closest('.wh-set-item')[0].dataset.id).getFunc(this.dataset.func);

          if (!func.carts.length && !func.problemArea && !func.comment)
          {
            return;
          }

          return view.renderPartial(setPickupPopoverTemplate, {
            func: func
          });
        },
        template: function(defaultTemplate)
        {
          return $(defaultTemplate).addClass('wh-set-popover');
        }
      });

      view.$el.on('show.bs.popover', function()
      {
        $('.wh-set-popover').remove();
      });
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
          label: view.t('menu:' + prop + ':' + (item.label || item.value)),
          handler: view.handleUpdate.bind(view, whOrder, func, prop, item.value)
        };
      }).filter(function(item) { return !!item; });

      contextMenu.show(view, e.pageY - 17, e.pageX - 17, {
        className: 'wh-set-menu',
        menu: menu
      });
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
          if (picklistDone === 'pending' || whOrder.get('picklistFunc') !== userFunc._id)
          {
            return;
          }
          break;

        case 'picklist':
          if (picklistDone !== 'success' || userFunc.status === 'pending' || propFunc !== userFunc._id)
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

      view.$action(whOrder.id, prop, func)
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

        var data = update(JSON.parse(JSON.stringify(whOrder.attributes)), []);
        var req = view.promised(view.whOrders.act(prop, data));

        req.fail(function()
        {
          view.onOrderChanged(whOrder);

          viewport.msg.show({
            type: 'error',
            time: 2500,
            text: view.t('update:failure')
          });
        });

        req.done(function(res)
        {
          if (res.order)
          {
            whOrder.set(res.order);
          }

          if (!view.$action(whOrder.id, prop, func).hasClass('is-clickable'))
          {
            view.onOrderChanged(whOrder);
          }
        });
      });
    },

    $order: function(id)
    {
      return this.$('.wh-set-item[data-id="' + id + '"]');
    },

    $action: function(orderId, prop, func)
    {
      return this.$order(orderId)
        .find('.wh-set-action[data-prop="' + prop + '"]' + (func ? ('[data-func="' + func + '"]') : ''));
    },

    updateHandlers: {

      picklistDone: function(newData, newValue, propFunc, done)
      {
        done(function(newData)
        {
          return {
            whOrderId: newData._id,
            newValue: newValue
          };
        });
      },

      picklist: function(newData, newValue, propFunc, done)
      {
        done(function(newData)
        {
          return {
            whOrderId: newData._id,
            funcId: propFunc,
            newValue: newValue
          };
        });
      },

      pickup: function(newData, newValue, propFunc, done)
      {
        var view = this;

        if (newValue === 'pending')
        {
          return done(function(newData)
          {
            return {
              whOrderId: newData._id,
              funcId: propFunc,
              newValue: newValue
            };
          });
        }

        if (newValue === 'success')
        {
          return view.updateHandlers.handlePickupSuccess.call(view, newData, propFunc, done);
        }

        if (newValue === 'failure')
        {
          return view.updateHandlers.handlePickupFailure.call(view, newData, propFunc, done);
        }

        throw new Error('Invalid pickup value.');
      },

      handlePickupSuccess: function(newData, propFunc, done)
      {
        var view = this;
        var $item = view.$('.wh-set-item[data-id="' + newData._id + '"]');
        var $prop = $item.find('.wh-set-action[data-prop="pickup"][data-func="' + propFunc + '"]');
        var $editor = view.renderPartial(cartsEditorTemplate, {
          carts: newData.funcs[WhOrder.FUNC_TO_INDEX[propFunc]].carts.join(' ')
        });

        $editor.find('.form-control').on('input', function(e)
        {
          e.currentTarget.setCustomValidity('');
        });

        $editor.on('submit', function()
        {
          var carts = $editor.find('.form-control')
            .val()
            .toUpperCase()
            .split(/[^0-9A-Z_-]+/)
            .filter(function(v) { return !!v.length; });

          if (carts.length === 0)
          {
            complete(carts);

            return false;
          }

          var $fields = $editor.find('input, button').prop('disabled', true);

          var req = view.ajax({
            url: '/old/wh/setCarts'
              + '?select(date,set,cart)'
              + 'status=in=(completing,completed,delivering)'
              + '&kind=' + (propFunc === 'packer' ? 'packaging' : 'components')
              + '&cart=in=(' + carts.join(',') + ')'
          });

          req.fail(function()
          {
            if (view.$editor === $editor)
            {
              complete(carts);
            }
          });

          req.done(function(res)
          {
            if (view.$editor !== $editor)
            {
              return;
            }

            var orderSet = Date.parse(newData.date) + ':' + newData.set;
            var usedCarts = (res.collection || []).filter(function(setCart)
            {
              var cartSet = Date.parse(setCart.date) + ':' + setCart.set;

              return cartSet !== orderSet;
            });

            if (!usedCarts.length)
            {
              complete(carts);

              return;
            }

            var error = view.t('set:cartsEditor:used:error', {
              count: usedCarts.length
            });

            usedCarts.forEach(function(setCart, i)
            {
              if (i > 0)
              {
                error += ', ';
              }

              error += ' ' + view.t('set:cartsEditor:used:cart', {
                cart: setCart.cart,
                date: time.utc.format(setCart.date, 'L'),
                set: setCart.set
              });
            });

            $editor.find('.form-control')[0].setCustomValidity(error);
            $fields.prop('disabled', false);
            $editor.find('.btn').click();
          });

          return false;
        });

        view.showEditor($editor, $prop[0]);

        $editor.find('input').select();

        function complete(carts)
        {
          done(function(newData)
          {
            return {
              whOrderId: newData._id,
              funcId: propFunc,
              newValue: 'success',
              carts: carts
            };
          });
        }
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
            return {
              whOrderId: newData._id,
              funcId: propFunc,
              newValue: 'failure',
              problemArea: $editor.find('input').val().trim(),
              comment: $editor.find('textarea').val().trim()
            };
          });

          return false;
        });

        view.showEditor($editor, $prop[0]);

        $editor.find('input').select();
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
