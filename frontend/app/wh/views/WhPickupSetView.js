// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/embedded',
  'app/core/util/scrollbarSize',
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
  embedded,
  scrollbarSize,
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
  var NAVIGATION_KEYS = {
    Tab: true,
    ArrowUp: true,
    ArrowDown: true,
    ArrowLeft: true,
    ArrowRight: true,
    KeyW: true,
    KeyS: true,
    KeyA: true,
    KeyD: true
  };

  return View.extend({

    template: setTemplate,

    dialogClassName: 'wh-set-dialog modal-no-keyboard',

    dialogBackdrop: function()
    {
      return embedded.isEnabled() ? 'static' : true;
    },

    modelProperty: 'whOrders',

    events: {
      'focus .fa[tabindex]': function(e)
      {
        var $action = this.$(e.target).closest('.wh-set-action');
        var $item = $action.closest('.wh-set-item');

        this.focused.whOrderId = $item[0].dataset.id;
        this.focused.func = $action[0].dataset.func;
        this.focused.prop = $action[0].dataset.prop;
      },
      'keydown [tabindex]': function(e)
      {
        if (this.$editor || contextMenu.isVisible(this))
        {
          return;
        }

        var code = e.originalEvent.code;

        if (!NAVIGATION_KEYS[code])
        {
          return;
        }

        var target = e.currentTarget;

        if (code === 'Tab')
        {
          if (e.shiftKey && target === this.el.querySelector('.fa[tabindex]'))
          {
            this.$('[tabindex]').last().focus();

            return false;
          }
          else if (!e.shiftKey && target === this.$('[tabindex]').last()[0])
          {
            this.el.querySelector('.fa[tabindex]').focus();

            return false;
          }

          return;
        }

        switch (code)
        {
          case 'ArrowUp':
          case 'KeyW':
            this.focusUp(target);
            break;

          case 'ArrowDown':
          case 'KeyS':
            this.focusDown(target);
            break;

          case 'ArrowLeft':
          case 'KeyA':
            this.focusPrev(target);
            break;

          case 'ArrowRight':
          case 'KeyD':
            this.focusNext(target);
            break;
        }
      },
      'keydown td.is-clickable': function(e)
      {
        var code = e.originalEvent.code;

        if (code === 'Enter' || code === 'Space')
        {
          clearTimeout(this.timers.showUpdateMenu);
          this.timers.showUpdateMenu = setTimeout(this.showUpdateMenuByEvent.bind(this, e), 1);

          return false;
        }
      },
      'click .is-clickable': function(e)
      {
        if (e.currentTarget.tagName === 'TH' && e.currentTarget.dataset.prop === 'func')
        {
          this.showFuncMenu(e.currentTarget.dataset.func, e.pageX, e.pageY);

          return false;
        }

        this.showUpdateMenuByEvent(e);
      },
      'touchstart .wh-set-action': 'scheduleFixUpdateMenu',
      'mousedown .wh-set-action': 'scheduleFixUpdateMenu',
      'mouseup .wh-set-action': function()
      {
        clearTimeout(this.timers.showFixUpdateMenu);
        this.timers.showFixUpdateMenu = null;
      },
      'click': function()
      {
        this.hideEditor();
        this.focus();
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
              text: view.t('printLabels:failure')
            });
          });

          req.always(function()
          {
            view.$('.wh-set-item[data-id="' + order + '"] .btn[data-action="printLabels"]')
              .prop('disabled', false)
              .find('.fa')
              .removeClass('fa-spinner fa-spin')
              .addClass('fa-print');

            view.focus();
          });

          return false;
        });

        view.showEditor($editor, view.$(e.target).closest('.wh-set-actions')[0]);

        $editor.find('input').select();

        return false;
      }
    },

    scheduleFixUpdateMenu: function(e)
    {
      if (e.currentTarget.classList.contains('is-clickable'))
      {
        return;
      }

      var whOrder = this.whOrders.get(this.$(e.target).closest('.wh-set-item').attr('data-id'));
      var func = e.currentTarget.dataset.func;
      var prop = e.currentTarget.dataset.prop;

      this.timers.showFixUpdateMenu = setTimeout(this.showFixUpdateMenu.bind(this, whOrder, func, prop, e), 500);
    },

    localTopics: {
      'planning.contextMenu.shown': 'hidePopover',
      'planning.contextMenu.hidden': 'focus'
    },

    initialize: function()
    {
      var view = this;

      view.focused = {
        whOrderId: null,
        func: null,
        prop: null
      };

      view.listenTo(view.plan.sapOrders, 'reset', view.onOrdersReset);

      view.listenTo(view.whOrders, 'reset', view.onOrdersReset);
      view.listenTo(view.whOrders, 'change', view.onOrderChanged);

      view.once('afterRender', function()
      {
        view.$el.parent().on('scroll.' + view.idPrefix, view.onScroll.bind(view));

        if (embedded.isEnabled())
        {
          view.$el.closest('.modal-content').find('.modal-header').addClass('cancel');
          view.showCancelButton();
        }
      });

      $(window)
        .on('resize.' + view.idPrefix, view.onWindowResize.bind(view))
        .on('keydown.' + view.idPrefix, view.onWindowKeyDown.bind(view));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      this.$el.closest('.modal-content').find('.modal-header').removeClass('cancel');
      this.$el.parent().off('.' + this.idPrefix);
      this.$el.popover('destroy');

      this.hideCancelButton();
      this.hideEditor();
    },

    getTemplateData: function()
    {
      return {
        renderItem: this.renderPartialHtml.bind(this, setItemTemplate),
        embedded: embedded.isEnabled(),
        hide: this.shouldHide(),
        items: this.serializeItems()
      };
    },

    serializeItems: function()
    {
      return this.whOrders.serializeSet(this.model.set, this.plan, this.model.user);
    },

    beforeRender: function()
    {
      clearTimeout(this.timers.render);
    },

    afterRender: function()
    {
      var view = this;

      view.updateSummary();

      view.$el.popover({
        selector: '[data-popover]',
        container: 'body',
        trigger: 'hover',
        placement: 'bottom',
        html: true,
        content: function()
        {
          var whOrder = view.whOrders.get(view.$(this).closest('.wh-set-item')[0].dataset.id);

          if (!whOrder)
          {
            return;
          }

          var func = whOrder.getFunc(this.dataset.func);

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

      view.focus();
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

    hidePopover: function()
    {
      $('.wh-set-popover').remove();
    },

    updateSummary: function()
    {
      var view = this;
      var qtyPlan = 0;
      var qtyTodo = 0;
      var duration = 0;
      var funcs = {};

      this.$('.wh-set-item').each(function()
      {
        var whOrder = view.whOrders.get(this.dataset.id);

        if (!whOrder
          || whOrder.get('date') !== view.model.date
          || whOrder.get('set') !== view.model.set)
        {
          return;
        }

        if (whOrder.get('status') !== 'problem')
        {
          var planOrder = view.plan.orders.get(whOrder.get('order'));

          qtyPlan += whOrder.get('qty');
          qtyTodo += planOrder ? planOrder.get('quantityTodo') : 0;
          duration += Date.parse(whOrder.get('finishTime')) - Date.parse(whOrder.get('startTime'));
        }

        whOrder.get('funcs').forEach(function(func)
        {
          if (funcs[func._id] === undefined)
          {
            funcs[func._id] = {
              _id: func._id,
              user: {id: '', label: ''}
            };
          }

          if (func.user)
          {
            funcs[func._id] = func;
          }
        });
      });

      view.$id('qty').text(qtyPlan.toLocaleString() + '/' + qtyTodo.toLocaleString());
      view.$id('time').text(time.toString(duration / 1000, true, false));

      var canManage = user.isAllowedTo('WH:MANAGE');
      var whUser = view.model.user && view.model.user._id || '';

      _.forEach(funcs, function(func)
      {
        var full = func.user.label;
        var parts = full.split(/\s+/);
        var short = parts[0];

        if (parts.length > 1)
        {
          short += ' ' + parts[1].charAt(0) + (parts[1].length > 1 ? '.' : '');
        }

        view.$id(func._id)
          .text(short)
          .attr('title', full)
          .parent()
          .toggleClass('is-clickable', !!short && (canManage || (func.user && func.user.id === whUser)));
      });
    },

    focus: function()
    {
      if (this.$editor || contextMenu.isVisible(this))
      {
        return;
      }

      var focused = this.focused;
      var $item = this.$('.wh-set-item[data-id="' + focused.whOrderId + '"]');
      var actionSelector = 'td[data-prop="' + focused.prop + '"]';

      if (focused.func)
      {
        actionSelector += '[data-func="' + focused.func + '"]';
      }

      var $action = $item.find(actionSelector);
      var $focus = $action.find('.fa[tabindex]');

      if (!$focus.length)
      {
        $action = this.$('td.is-clickable').first();

        if (!$action.length)
        {
          focused.whOrderId = null;
          focused.func = null;
          focused.prop = null;

          return;
        }

        $item = $action.closest('.wh-set-item');
        $focus = $action.find('.fa[tabindex]');

        focused.whOrderId = $item[0].dataset.id;
        focused.func = $action[0].dataset.func;
        focused.prop = $action[0].dataset.prop;
      }

      if ($action.hasClass('is-clickable'))
      {
        $focus.focus();
      }
    },

    hideMenu: function()
    {
      contextMenu.hide(this);
    },

    showUpdateMenuByEvent: function(e)
    {
      var whOrder = this.whOrders.get(this.$(e.currentTarget).closest('.wh-set-item').attr('data-id'));
      var func = e.currentTarget.dataset.func;
      var prop = e.currentTarget.dataset.prop;

      if (whOrder)
      {
        this.showUpdateMenu(whOrder, func, prop, e);
      }
    },

    showUpdateMenu: function(whOrder, funcId, prop, e)
    {
      var view = this;
      var canManage = user.isAllowedTo('WH:MANAGE');
      var menu = [];
      var $item = view.$('.wh-set-item[data-id="' + whOrder.id + '"]');
      var actionSelector = 'td.is-clickable[data-prop="' + prop + '"]';

      if (funcId)
      {
        actionSelector += '[data-func="' + funcId + '"]';
      }

      var $action = $item.find(actionSelector);

      if ($action.length)
      {
        view.focused.whOrderId = whOrder.id;
        view.focused.func = funcId;
        view.focused.prop = prop;
      }

      var picklistFunc = whOrder.getFunc(whOrder.get('picklistFunc'));
      var isPicklistUser = picklistFunc
        && view.model.user
        && picklistFunc.user
        && picklistFunc.user.id === view.model.user._id;
      var func = whOrder.getFunc(funcId);

      if (!canManage
        && prop === 'pickup'
        && func.pickup === 'success'
        && !whOrder.isDelivered()
        && user.isAllowedTo('WH:MANAGE:CARTS'))
      {
        menu.push({
          icon: 'fa-edit',
          label: view.t('menu:pickup:editCarts'),
          handler: view.handleUpdate.bind(view, whOrder, funcId, 'pickup', 'success', {
            edit: true
          })
        });
      }
      else if (funcId === 'platformer'
        && prop === 'pickup'
        && func.pickup === 'pending')
      {
        setTimeout(view.handleUpdate.bind(view), 1, whOrder, funcId, prop, 'success');
      }
      else
      {
        UPDATE_MENU_ITEMS[prop].forEach(function(item)
        {
          if (item.manage && !canManage)
          {
            return;
          }

          if (funcId === 'platformer'
            && prop === 'pickup'
            && item.value === 'failure')
          {
            return;
          }

          if ((canManage || isPicklistUser)
            && prop === 'picklist'
            && item.value === 'require'
            && !func.user)
          {
            return;
          }

          menu.push({
            icon: item.icon,
            label: view.t('menu:' + prop + ':' + (item.label || item.value)),
            handler: view.handleUpdate.bind(view, whOrder, funcId, prop, item.value)
          });
        });
      }

      if (!menu.length)
      {
        return;
      }

      var top = e.pageY;
      var left = e.pageX;
      var touches = e.originalEvent.touches;

      if (touches && touches.length)
      {
        top = touches[0].pageY;
        left = touches[0].pageX;
      }

      if (!top)
      {
        var $icon = $action.find('.fa');

        if (!$icon.length)
        {
          return;
        }

        var box = $icon[0].getBoundingClientRect();

        top = Math.round(box.y + box.height / 2) + document.scrollingElement.scrollTop;
        left = Math.round(box.x + box.width / 2);
      }
      else
      {
        top -= 17;
        left -= 17;
      }

      if (embedded.isEnabled())
      {
        menu.unshift(whOrder.get('order'));
      }

      contextMenu.show(view, top, left, {
        className: 'wh-set-menu',
        menu: menu
      });
    },

    showFixUpdateMenu: function(whOrder, propFunc, prop, e)
    {
      if (!whOrder)
      {
        return;
      }

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

          if (userFunc._id === 'platformer' && userFunc.status === 'problem')
          {
            return;
          }
          break;
      }

      this.showUpdateMenu(whOrder, propFunc, prop, e);
    },

    showFuncMenu: function(funcId, x, y)
    {
      var view = this;
      var menu = [
        {
          icon: 'fa-eraser',
          label: view.t('unassignSet:menu'),
          handler: view.handleUnassignSet.bind(view, funcId)
        }
      ];

      if (menu.length)
      {
        this.hideEditor();

        contextMenu.show(view, y - 17, x - 17, {
          className: 'wh-set-menu',
          menu: menu
        });
      }
    },

    handleUnassignSet: function(funcId)
    {
      var view = this;

      viewport.msg.saving();

      var req = view.whOrders.act('unassignSet', {
        date: view.model.date,
        set: view.model.set,
        func: funcId
      });

      req.fail(function()
      {
        viewport.msg.saved();

        var error = req.responseJSON && req.responseJSON.error && req.responseJSON.error.code || 'failure';

        if (!view.t.has('unassignSet:' + error))
        {
          error = 'failure';
        }

        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: view.t('unassignSet:' + error)
        });
      });

      req.done(function()
      {
        viewport.msg.saved();
      });
    },

    showEditor: function($editor, el)
    {
      var view = this;

      view.hideEditor();

      var $item = view.$(el).closest('.wh-set-item');

      if (!$item.length)
      {
        return;
      }

      $editor
        .data('whOrderId', $item[0].dataset.id)
        .data('anchorEl', el)
        .attr('data-func', el.dataset.func)
        .css({
          top: '0',
          left: '-1000px',
          margin: 'unset'
        })
        .appendTo('.modal-content');

      $editor.on('keydown', function(e)
      {
        if (e.key === 'Escape')
        {
          view.hideEditor();
          view.focus();

          return false;
        }
      });

      view.$editor = $editor;

      view.positionEditor();

      if (view.vkb)
      {
        view.$editor
          .on('focus', '[data-vkb]', view.showVkb.bind(view))
          .on('blur', '[data-vkb]', view.scheduleHideVkb.bind(view));
      }
    },

    positionEditor: function()
    {
      var $editor = this.$editor;

      if (!$editor || !this.$el[0].parentNode)
      {
        return;
      }

      var anchorEl = $editor.data('anchorEl').firstElementChild;

      if (!anchorEl)
      {
        return;
      }

      var position = this.$(anchorEl).position();

      if (!position)
      {
        return;
      }

      var box = anchorEl.getBoundingClientRect();
      var containerBox = this.$el[0].parentNode.getBoundingClientRect();
      var editorWidth = $editor.outerWidth();
      var editorHeight = $editor.outerHeight();
      var headerHeight = $('.modal-header').outerHeight();
      var marginTop = containerBox.top - headerHeight;
      var marginLeft = containerBox.left;
      var top = position.top + headerHeight;
      var left = position.left - editorWidth + box.width;

      if (left + containerBox.left + editorWidth + scrollbarSize.width >= window.innerWidth)
      {
        left = containerBox.width - editorWidth;
      }

      if (left < 0)
      {
        left = 0;
      }

      if (top + editorHeight + marginTop * 2 >= window.innerHeight)
      {
        top = window.innerHeight - editorHeight - marginTop * 2;
      }

      if (this.vkb && this.vkb.isVisible())
      {
        var vkbBox = this.vkb.el.getBoundingClientRect();
        var editorAbsoluteTop = top + marginTop;
        var editorAbsoluteLeft = left + marginLeft;
        var editorBox = {
          top: editorAbsoluteTop,
          bottom: editorAbsoluteTop + editorHeight,
          left: editorAbsoluteLeft,
          right: editorAbsoluteLeft + editorWidth
        };

        if (!(editorBox.right < vkbBox.left
          || editorBox.left > vkbBox.right
          || editorBox.bottom < vkbBox.top
          || editorBox.top > vkbBox.bottom))
        {
          top -= editorAbsoluteTop + editorHeight - vkbBox.top + 10;
        }
      }

      if (top < 0)
      {
        top = 0;
      }

      $editor.css({
        top: top + 'px',
        left: left + 'px'
      });
    },

    hideEditor: function()
    {
      if (this.$editor)
      {
        this.onOrderChanged(this.whOrders.get(this.$editor.data('whOrderId')));

        this.$editor.removeData('anchorEl');
        this.$editor.remove();
        this.$editor = null;

        this.hideVkb();
      }
    },

    handleUpdate: function(whOrder, func, prop, newValue, options)
    {
      var view = this;
      var newData = JSON.parse(JSON.stringify(whOrder.attributes));
      var $icon = view.$action(whOrder.id, prop, func)
        .removeClass('is-clickable')
        .find('.fa')
        .removeClass()
        .addClass('fa fa-spinner')
        .blur();

      view.updateHandlers[prop].call(view, newData, newValue, func, options || {}, function(update)
      {
        view.hideEditor();

        if (!update)
        {
          return view.onOrderChanged(whOrder);
        }

        $icon.addClass('fa-spin');

        var data = update(JSON.parse(JSON.stringify(whOrder.attributes)), []);
        var req = view.promised(view.whOrders.act(prop, data));

        req.fail(function()
        {
          view.onOrderChanged(whOrder);

          var error = req.responseJSON && req.responseJSON.error && req.responseJSON.error.code || 'failure';

          viewport.msg.show({
            type: 'error',
            time: 2500,
            text: view.t.has('update:' + error) ? view.t('update:' + error) : view.t('update:failure')
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

      picklistDone: function(newData, newValue, propFunc, options, done)
      {
        var view = this;

        if (newValue === 'pending' || newValue === 'success')
        {
          return done(function(newData)
          {
            return {
              whOrderId: newData._id,
              newValue: newValue
            };
          });
        }

        if (newValue === 'failure')
        {
          return view.updateHandlers.handlePicklistDoneFailure.call(view, newData, done);
        }

        throw new Error('Invalid pickup value.');
      },

      handlePicklistDoneFailure: function(newData, done)
      {
        var view = this;
        var $item = view.$('.wh-set-item[data-id="' + newData._id + '"]');
        var $prop = $item.find('.wh-set-action[data-prop="picklistDone"]');
        var $editor = $(problemEditorTemplate({
          func: 'lp10',
          problemArea: null,
          comment: newData.problem,
          placeholder: view.t('set:problemEditor:comment:lp10', {
            qty: newData.qty,
            line: newData.line
          })
        }));

        $editor.find('textarea').on('focus', function(e)
        {
          if (e.target.value !== '')
          {
            return;
          }

          e.target.value = view.t('set:problemEditor:comment:lp10', {
            qty: newData.qty,
            line: newData.line
          });

          e.target.setSelectionRange(e.target.value.length, e.target.value.length);
        });

        $editor.on('submit', function()
        {
          done(function(newData)
          {
            var comment = $editor.find('textarea').val().trim()
              || view.t('set:problemEditor:comment:lp10', {
                qty: newData.qty,
                line: newData.line
              });

            return {
              whOrderId: newData._id,
              newValue: 'failure',
              comment: comment
            };
          });

          return false;
        });

        view.showEditor($editor, $prop[0]);

        $editor.find('.btn').focus();
      },

      picklist: function(newData, newValue, propFunc, options, done)
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

      pickup: function(newData, newValue, propFunc, options, done)
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
          return view.updateHandlers.handlePickupSuccess.call(view, newData, propFunc, options, done);
        }

        if (newValue === 'failure')
        {
          return view.updateHandlers.handlePickupFailure.call(view, newData, propFunc, done);
        }

        throw new Error('Invalid pickup value.');
      },

      handlePickupSuccess: function(newData, propFunc, options, done)
      {
        var view = this;
        var $item = view.$('.wh-set-item[data-id="' + newData._id + '"]');
        var $prop = $item.find('.wh-set-action[data-prop="pickup"][data-func="' + propFunc + '"]');
        var templateData = {
          multiline: propFunc === 'packer',
          carts: newData.funcs[WhOrder.FUNC_TO_INDEX[propFunc]].carts.join(' '),
          otherCarts: []
        };

        if (propFunc === 'platformer')
        {
          templateData.otherCarts.push({
            _id: 'fmx',
            carts: newData.funcs[WhOrder.FUNC_TO_INDEX.fmx].carts
          });
          templateData.otherCarts.push({
            _id: 'kitter',
            carts: newData.funcs[WhOrder.FUNC_TO_INDEX.kitter].carts
          });
        }

        var allCarts = {};

        view.whOrders.getOrdersBySet(view.model.set).forEach(function(setOrder)
        {
          setOrder.order.getFunc(propFunc).carts.forEach(function(cartNo)
          {
            allCarts[cartNo] = 1;
          });
        });

        allCarts = Object.keys(allCarts);

        if (allCarts.length)
        {
          templateData.otherCarts.push({
            _id: propFunc,
            carts: allCarts
          });
        }

        var $editor = view.renderPartial(cartsEditorTemplate, templateData);

        $editor.find('.form-control')
          .on('input', function(e)
          {
            e.currentTarget.setCustomValidity('');
          })
          .on('keydown', function(e)
          {
            if (e.target.tagName === 'TEXTAREA' && e.key === 'Enter')
            {
              $editor.find('.btn').click();

              return false;
            }
          });

        $editor.on('click', 'a[data-cart]', function(e)
        {
          var func = e.currentTarget.dataset.func;
          var cart = e.currentTarget.dataset.cart;
          var $carts = $editor.find('.form-control');
          var newCarts = $carts
            .val()
            .toUpperCase()
            .split(/[,\s]+/)
            .filter(function(v) { return /^[A-Z0-9]+$/.test(v); });

          if (cart === 'all')
          {
            $editor.find('td > a[data-func="' + func + '"]').each(function()
            {
              newCarts.push(this.dataset.cart);
            });
          }
          else
          {
            newCarts.push(cart);
          }

          newCarts = _.uniq(newCarts);

          newCarts.sort(function(a, b) { return a.localeCompare(b, undefined, {numeric: true}); });

          $carts.val(newCarts.join(' ')).focus();
        });

        $editor.on('submit', function()
        {
          var $carts = $editor.find('.form-control');
          var carts = _.uniq($carts
            .val()
            .toUpperCase()
            .split(/[,\s]+/)
            .filter(function(v) { return /^[A-Z0-9]+$/.test(v); })
            .sort(function(a, b) { return a.localeCompare(b, undefined, {numeric: true}); }));

          $carts.val(carts.join(' '));

          if (carts.length === 0)
          {
            view.timers.resubmit = setTimeout(function() { $editor.find('.btn').click(); });

            return false;
          }

          var whOrder = view.whOrders.get(newData._id);

          if (whOrder)
          {
            var oldCarts = whOrder.getFunc(propFunc).carts.sort(function(a, b)
            {
              return a.localeCompare(b, undefined, {numeric: true});
            });

            if (_.isEqual(carts, oldCarts))
            {
              return done();
            }
          }

          var $fields = $editor.find('.form-control, .btn').prop('disabled', true);

          var kind = 'components';

          if (propFunc === 'packer')
          {
            kind = 'packaging';
          }
          else if (propFunc === 'painter')
          {
            kind = 'ps';
          }

          var req = view.ajax({
            url: '/old/wh/setCarts'
              + '?select(date,set,cart)'
              + 'status=in=(completing,completed,delivering)'
              + '&kind=' + kind
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

        var $carts = $editor.find('.form-control');
        $carts[0].selectionStart = 9999;
        $carts.focus();

        function complete(carts)
        {
          done(function(newData)
          {
            return {
              whOrderId: newData._id,
              funcId: propFunc,
              newValue: 'success',
              carts: carts,
              edit: !!options.edit
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
          func: propFunc,
          problemArea: func.problemArea,
          comment: func.comment,
          placeholder: view.t('set:problemEditor:comment:pickup', {
            problemArea: ' ',
            func: propFunc,
            qty: newData.qty,
            line: newData.line
          })
        }));

        $editor.find('textarea').on('focus', function(e)
        {
          if (e.target.value !== '')
          {
            return;
          }

          var problemArea = ' ' + $editor.find('input').val().trim();

          if (problemArea.length)
          {
            problemArea += ' ';
          }

          e.target.value = view.t('set:problemEditor:comment:pickup', {
            problemArea: problemArea,
            func: propFunc,
            qty: newData.qty,
            line: newData.line
          });

          e.target.setSelectionRange(e.target.value.length, e.target.value.length);
        });

        $editor.on('submit', function()
        {
          done(function(newData)
          {
            var problemArea = $editor.find('input').val().trim();
            var comment = $editor.find('textarea').val().trim();

            if (!comment.length)
            {
              comment = view.t('set:problemEditor:comment:pickup', {
                problemArea: ' ' + problemArea + ' ',
                func: propFunc,
                qty: newData.qty,
                line: newData.line
              });
            }

            return {
              whOrderId: newData._id,
              funcId: propFunc,
              newValue: 'failure',
              problemArea: problemArea,
              comment: comment
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
        this.$('.wh-set-item[data-order="' + sapOrder.id + '"] .planning-mrp-lineOrders-comment').html(
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

    onOrderChanged: function(whOrder)
    {
      if (!whOrder)
      {
        return;
      }

      var view = this;
      var $item = view.$('.wh-set-item[data-id="' + whOrder.id + '"]');

      if (!$item.length)
      {
        return;
      }

      view.updateSummary();

      if (whOrder.get('date') !== this.model.date
       || whOrder.get('set') !== this.model.set)
      {
        if (view.$('.wh-set-item').length === 1)
        {
          viewport.closeDialog();

          return;
        }

        $item.fadeOut('fast', function()
        {
          $item.remove();

          if (!view.$('.wh-set-item').length)
          {
            viewport.closeDialog();
          }
        });

        return;
      }

      var setData = {
        i: view.whOrders.indexOf(whOrder),
        delivered: view.whOrders.isSetDelivered(whOrder.get('set'))
      };

      $item.replaceWith(view.renderPartialHtml(setItemTemplate, {
        item: whOrder.serializeSet(setData, view.plan, view.model.user),
        hide: view.shouldHide(),
        embedded: embedded.isEnabled()
      }));

      if (view.focused.whOrderId === whOrder.id)
      {
        view.focus();
      }
    },

    shouldHide: function()
    {
      return window.innerWidth < 1600 && embedded.isEnabled();
    },

    onDialogShown: function()
    {
      this.focus();
    },

    focusUp: function(target)
    {
      var $action = this.$(target).parent();
      var current = $action[0];
      var selector = '';

      if (target.classList.contains('btn'))
      {
        current = target;
        selector = '.btn[data-action="' + target.dataset.action + '"]';
      }
      else
      {
        selector = 'td.is-clickable[data-prop="' + $action[0].dataset.prop + '"]';

        if ($action[0].dataset.func)
        {
          selector += '[data-func="' + $action[0].dataset.func + '"]';
        }
      }

      var $candidates = this.$(selector);
      var candidateI = -1;

      for (var i = 0; i < $candidates.length; ++i)
      {
        if ($candidates[i] === current)
        {
          candidateI = i - 1;

          break;
        }
      }

      if (!$candidates[candidateI])
      {
        candidateI = $candidates.length - 1;
      }

      var $candidate = $candidates.eq(candidateI);

      if ($candidate[0].tabIndex === -1)
      {
        $candidate.find('[tabindex]').focus();
      }
      else
      {
        $candidate.focus();
      }
    },

    focusDown: function(target)
    {
      var $action = this.$(target).parent();
      var current = $action[0];
      var selector = '';

      if (target.classList.contains('btn'))
      {
        current = target;
        selector = '.btn[data-action="' + target.dataset.action + '"]';
      }
      else
      {
        selector = 'td.is-clickable[data-prop="' + $action[0].dataset.prop + '"]';

        if ($action[0].dataset.func)
        {
          selector += '[data-func="' + $action[0].dataset.func + '"]';
        }
      }

      var $candidates = this.$(selector);
      var candidateI = -1;

      for (var i = 0; i < $candidates.length; ++i)
      {
        if ($candidates[i] === current)
        {
          candidateI = i + 1;

          break;
        }
      }

      if (!$candidates[candidateI])
      {
        candidateI = 0;
      }

      var $candidate = $candidates.eq(candidateI);

      if ($candidate[0].tabIndex === -1)
      {
        $candidate.find('[tabindex]').focus();
      }
      else
      {
        $candidate.focus();
      }
    },

    focusPrev: function(target)
    {
      var $candidates = this.$('[tabindex]');
      var candidateI = -1;

      for (var i = 0; i < $candidates.length; ++i)
      {
        if ($candidates[i] === target)
        {
          candidateI = i - 1;

          break;
        }
      }

      if (!$candidates[candidateI])
      {
        candidateI = $candidates.length - 1;
      }

      $candidates[candidateI].focus();
    },

    focusNext: function(target)
    {
      var $candidates = this.$('[tabindex]');
      var candidateI = -1;

      for (var i = 0; i < $candidates.length; ++i)
      {
        if ($candidates[i] === target)
        {
          candidateI = i + 1;

          break;
        }
      }

      if (!$candidates[candidateI])
      {
        candidateI = 0;
      }

      $candidates[candidateI].focus();
    },

    onScroll: function()
    {
      this.positionEditor();
    },

    onWindowResize: function()
    {
      this.positionEditor();
    },

    onWindowKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        if (this.$editor)
        {
          this.hideEditor();
          this.focus();
        }
        else
        {
          viewport.closeDialog();
        }

        return false;
      }
    },

    scheduleHideVkb: function()
    {
      clearTimeout(this.timers.hideVkb);

      this.timers.hideVkb = setTimeout(this.hideVkb.bind(this), 250);
    },

    hideVkb: function()
    {
      clearTimeout(this.timers.hideVkb);

      if (this.vkb)
      {
        this.vkb.hide();
        this.vkb.enableKeys();
      }
    },

    showVkb: function(e)
    {
      if (!this.vkb)
      {
        return;
      }

      clearTimeout(this.timers.hideVkb);

      this.vkb.show(e.currentTarget, {
        onKeyPress: this.onVkbKeyPress.bind(this),
        adjustOverlap: false,
        positioner: embedded.isEnabled() && window.innerHeight > ($('.modal-dialog').outerHeight(true) + 350)
          ? this.positionVkb.bind(this)
          : null
      });

      this.positionEditor();
    },

    positionVkb: function(vkbCss)
    {
      vkbCss.bottom = 'unset';
      vkbCss.top = Math.max($('.modal-dialog').outerHeight(true), 500) + 'px';

      this.vkb.$el.css(vkbCss);
    },

    onVkbKeyPress: function(key)
    {
      if (key !== 'ENTER')
      {
        return true;
      }

      this.$editor.find('.btn').click();

      return false;
    },

    showCancelButton: function()
    {
      this.$cancelButton = $('<button type="button" class="btn btn-danger wh-pickup-set-cancel">'
        + '<i class="fa fa-times"></i></button>').appendTo(document.body);

      this.$cancelButton.on('click', function()
      {
        viewport.closeDialog();
      });
    },

    hideCancelButton: function()
    {
      if (this.$cancelButton)
      {
        this.$cancelButton.remove();
        this.$cancelButton = null;
      }
    }

  });
});
