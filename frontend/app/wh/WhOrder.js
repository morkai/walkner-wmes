// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/planning/util/shift',
  'app/planning/templates/orderStatusIcons'
], function(
  t,
  time,
  user,
  Model,
  shiftUtil,
  orderStatusIconsTemplate
) {
  'use strict';

  var STATUS_TO_CLASS_NAME = {
    pending: 'default',
    started: 'info',
    finished: 'success',
    problem: 'danger',
    cancelled: 'warning'
  };
  var FUNC_STATUS_TO_ICON = {
    pending: 'fa-question',
    picklist: 'fa-file-text-o',
    pickup: 'fa-shopping-cart',
    problem: 'fa-thumbs-down',
    finished: 'fa-thumbs-up'
  };
  var FUNC_TO_INDEX = {
    fmx: 0,
    kitter: 1,
    packer: 2
  };

  return Model.extend({

    urlRoot: '/wh/orders',

    topicPrefix: 'wh.orders',

    privilegePrefix: 'WH',

    nlsDomain: 'wh',

    serialize: function(plan, i)
    {
      var obj = this.toJSON();

      var planOrder = plan.orders.get(obj.order);
      var sapOrder = plan.sapOrders.get(obj.order);
      var startTime = Date.parse(obj.startTime);
      var finishTime = Date.parse(obj.finishTime);

      obj.no = i + 1;
      obj.shift = shiftUtil.getShiftNo(startTime);

      if (planOrder)
      {
        obj.mrp = planOrder.get('mrp');
        obj.nc12 = planOrder.get('nc12');
        obj.name = planOrder.get('name');
        obj.qtyTodo = planOrder.get('quantityTodo');
        obj.planStatus = planOrder.getStatus();
        obj.planStatusIcons = orderStatusIconsTemplate(plan, planOrder.id);
      }
      else
      {
        obj.mrp = '?';
        obj.nc12 = '?';
        obj.name = '?';
        obj.qtyTodo = 0;
        obj.planStatus = 'unplanned';
        obj.planStatusIcons = '?';
      }

      obj.startTime = time.utc.format(startTime, 'HH:mm:ss');
      obj.finishTime = time.utc.format(finishTime, 'HH:mm:ss');
      obj.comment = sapOrder ? sapOrder.getCommentWithIcon() : '';
      obj.comments = sapOrder ? sapOrder.get('comments') : [];
      obj.rowClassName = STATUS_TO_CLASS_NAME[obj.status];
      obj.funcIcons = {
        fmx: FUNC_STATUS_TO_ICON[obj.funcs[0].status],
        kitter: FUNC_STATUS_TO_ICON[obj.funcs[1].status],
        packer: FUNC_STATUS_TO_ICON[obj.funcs[2].status]
      };

      return obj;
    },

    serializeSet: function(plan, i, whUser)
    {
      var obj = this.serialize(plan, i);
      var canManage = user.isAllowedTo('WH:MANAGE');
      var userFunc = this.getUserFunc(whUser);
      var isUser = !!userFunc;

      obj.clickable = {
        picklistDone: canManage
          || (isUser && userFunc._id === obj.picklistFunc && obj.picklistDone === null)
      };

      obj.funcs.forEach(function(func)
      {
        obj.clickable[func._id] = {
          picklist: (canManage && obj.picklistDone)
            || (obj.picklistDone && isUser && userFunc._id === func._id && func.status === 'picklist'),
          pickup: (canManage && obj.picklistDone !== null && func.picklist === 'require')
            || (obj.picklistDone && isUser && userFunc._id === func._id && func.status === 'pickup')
        };
      });

      obj.clickable.printLabels = canManage || isUser;

      return obj;
    },

    update: function(newOrder)
    {
      this.set(newOrder);
    },

    getUserFunc: function(user)
    {
      if (!user)
      {
        return null;
      }

      var func = this.attributes.funcs[FUNC_TO_INDEX[user.func]];

      if (!func.user || func.user.id !== user._id)
      {
        return null;
      }

      return func;
    }

  }, {

    FUNC_TO_INDEX: FUNC_TO_INDEX

  });
});
