// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/templates/userInfo',
  'app/planning/util/shift',
  'app/planning/templates/orderStatusIcons'
], function(
  t,
  time,
  user,
  Model,
  userInfoTemplate,
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
  var FUNC_STATUS_TO_CLASS = {
    pending: 'wh-problems-pending',
    progress: 'wh-problems-progress',
    picklist: 'wh-problems-progress',
    pickup: 'wh-problems-progress',
    problem: 'wh-problems-failure',
    failure: 'wh-problems-failure',
    success: 'wh-problems-success',
    finished: 'wh-problems-success'
  };
  var DIST_STATUS_TO_ICON = {
    pending: 'fa-question',
    started: 'fa-truck',
    finished: 'fa-thumbs-up'
  };
  var PICKLIST_DONE_TO_ICON = {
    pending: 'fa-question',
    progress: 'fa-spinner',
    success: 'fa-thumbs-up',
    failure: 'fa-thumbs-down'
  };
  var FUNC_TO_INDEX = {
    fmx: 0,
    kitter: 1,
    packer: 2
  };

  return Model.extend({

    urlRoot: '/old/wh/orders',

    topicPrefix: 'old.wh.orders',

    privilegePrefix: 'WH',

    nlsDomain: 'wh',

    serialize: function(plan, i, filters)
    {
      var obj = this.toJSON();

      var planOrder = plan && plan.orders.get(obj.order) || null;
      var sapOrder = plan && plan.sapOrders.get(obj.order) || null;
      var startTime = Date.parse(obj.startTime);
      var finishTime = Date.parse(obj.finishTime);

      obj.no = i + 1;
      obj.shift = shiftUtil.getShiftNo(startTime);
      obj.qty = obj.qty.toLocaleString();

      if (planOrder)
      {
        obj.mrp = planOrder.get('mrp');
        obj.nc12 = planOrder.get('nc12');
        obj.name = planOrder.get('name');
        obj.qtyTodo = planOrder.get('quantityTodo').toLocaleString();
        obj.planStatus = planOrder.getStatus();
        obj.planStatusIcons = orderStatusIconsTemplate(plan, planOrder.id);
      }
      else
      {
        obj.mrp = '?';
        obj.nc12 = '?';
        obj.name = '?';
        obj.qtyTodo = '0';
        obj.planStatus = 'unplanned';
        obj.planStatusIcons = '?';
      }

      obj.startDate = time.utc.format(startTime, 'LL');
      obj.finishDate = time.utc.format(finishTime, 'LL');
      obj.startTimeMs = startTime;
      obj.startTime = time.utc.format(startTime, 'HH:mm:ss');
      obj.startTimeShort = time.utc.format(startTime, 'H:mm');
      obj.finishTime = time.utc.format(finishTime, 'HH:mm:ss');
      obj.comment = sapOrder ? sapOrder.getCommentWithIcon() : '';
      obj.comments = sapOrder ? sapOrder.get('comments') : [];
      obj.rowClassName = STATUS_TO_CLASS_NAME[obj.status];
      obj.funcIcons = {
        fmx: FUNC_STATUS_TO_ICON[obj.funcs[0].status],
        kitter: FUNC_STATUS_TO_ICON[obj.funcs[1].status],
        packer: FUNC_STATUS_TO_ICON[obj.funcs[2].status]
      };
      obj.distIcons = {
        dist: DIST_STATUS_TO_ICON[obj.distStatus],
        fifo: DIST_STATUS_TO_ICON[obj.fifoStatus],
        pack: DIST_STATUS_TO_ICON[obj.packStatus]
      };
      obj.picklistDoneIcon = PICKLIST_DONE_TO_ICON[obj.picklistDone];
      obj.psStatus = plan && plan.sapOrders.getPsStatus(obj.order) || 'unknown';
      obj.hidden = !filters
        || startTime < filters.startTime.from
        || startTime >= filters.startTime.to
        || (filters.whStatuses.length > 0 && filters.whStatuses.indexOf(obj.status) === -1)
        || (filters.psStatuses.length > 0 && filters.psStatuses.indexOf(obj.psStatus) === -1);

      if (obj.hidden)
      {
        obj.rowClassName += ' hidden';
      }

      return obj;
    },

    serializeSet: function(plan, i, whUser)
    {
      var obj = this.serialize(plan, i, this.collection ? this.collection.getFilters(plan) : {
        startTime: {},
        whStatuses: [],
        psStatuses: []
      });
      var canManage = user.isAllowedTo('WH:MANAGE');
      var userFunc = this.getUserFunc(whUser);
      var isUser = !!userFunc;
      var picklistDone = obj.picklistDone === 'success';
      var fifoUndelivered = this.get('fifoStatus') === 'pending'
        || (obj.funcs[0].pickup === 'ignore' && obj.funcs[1].pickup === 'ignore');
      var packUndelivered = this.get('packStatus') === 'pending'
        || obj.funcs[2].pickup === 'ignore';
      var undelivered = fifoUndelivered && packUndelivered;

      obj.clickable = {
        picklistDone: undelivered
          && (canManage || (isUser && userFunc._id === obj.picklistFunc && !picklistDone))
      };

      obj.funcs.forEach(function(func)
      {
        obj.clickable[func._id] = {
          picklist: undelivered
            && ((canManage && picklistDone)
            || (picklistDone && isUser && userFunc._id === func._id && func.status === 'picklist')),
          pickup: undelivered
            && ((canManage && func.picklist === 'require')
            || (picklistDone && isUser && userFunc._id === func._id && func.status === 'pickup'))
        };
      });

      obj.clickable.printLabels = canManage || isUser;

      return obj;
    },

    serializeProblemFunc: function(funcId)
    {
      var problemFunc;
      var func;

      if (funcId === 'lp10')
      {
        func = this.getFunc(this.get('picklistFunc'));

        problemFunc = {
          label: t('wh', 'prop:picklist'),
          className: FUNC_STATUS_TO_CLASS[this.get('picklistDone')],
          status: t('wh', 'status:picklistDone:' + this.get('picklistDone')),
          user: !func || !func.user ? '' : userInfoTemplate({
            userInfo: func.user,
            noIp: true,
            clickable: false
          }),
          carts: '',
          problemArea: '',
          problem: this.get('problem')
        };
      }
      else
      {
        func = this.getFunc(funcId);

        problemFunc = {
          label: t('wh', 'func:' + funcId),
          className: FUNC_STATUS_TO_CLASS[func.status],
          status: t('wh', 'status:' + func.status),
          user: !func.user ? '' : userInfoTemplate({
            userInfo: func.user,
            noIp: true,
            clickable: false
          }),
          carts: func.carts.join(', '),
          problemArea: func.problemArea,
          problem: func.comment
        };
      }

      problemFunc.solvable = this.get('status') === 'problem'
        && problemFunc.className === 'wh-problems-failure'
        && user.isAllowedTo('WH:SOLVER', 'WH:MANAGE');

      return problemFunc;
    },

    update: function(newOrder)
    {
      this.set(newOrder);
    },

    getFunc: function(func)
    {
      return this.attributes.funcs[FUNC_TO_INDEX[func]] || null;
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
