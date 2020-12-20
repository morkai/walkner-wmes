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
    finished: 'fa-thumbs-up',
    ignored: 'fa-times'
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
    finished: 'fa-thumbs-up',
    ignored: 'fa-times'
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
    platformer: 2,
    packer: 3,
    painter: 4
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
      obj.funcIcons = {};
      obj.funcs.forEach(function(func)
      {
        if (func.picklist === 'ignore')
        {
          obj.funcIcons[func._id] = FUNC_STATUS_TO_ICON.ignored;
        }
        else if (func._id === 'painter' && func.status === 'pickup' && !func.user)
        {
          obj.funcIcons[func._id] = FUNC_STATUS_TO_ICON.pending;
        }
        else
        {
          obj.funcIcons[func._id] = FUNC_STATUS_TO_ICON[func.status];
        }
      });
      obj.distIcons = {
        dist: DIST_STATUS_TO_ICON[obj.distStatus],
        fifo: DIST_STATUS_TO_ICON[obj.fifoStatus],
        pack: DIST_STATUS_TO_ICON[obj.packStatus],
        psDist: obj.psStatus === 'unknown' ? DIST_STATUS_TO_ICON.ignored : DIST_STATUS_TO_ICON[obj.psDistStatus]
      };
      obj.picklistDoneIcon = PICKLIST_DONE_TO_ICON[obj.picklistDone];

      obj.hidden = !filters
        || startTime < filters.startTime.from
        || startTime >= filters.startTime.to
        || (filters.whStatuses.length > 0 && !filters.whStatuses.includes(obj.status))
        || (filters.psStatuses.length > 0 && !filters.psStatuses.includes(obj.psStatus))
        || (filters.distStatuses.length > 0 && !filters.distStatuses.includes(obj.distStatus))
        || (filters.orders.length > 0 && !filters.orders.includes(obj.order))
        || (filters.sets.length > 0 && !filters.sets.includes(obj.set))
        || (filters.lines.length > 0 && !obj.lines.some(function(l) { return filters.lines.includes(l._id); }))
        || (filters.mrps.length > 0 && !filters.mrps.includes(obj.mrp));

      if (obj.hidden)
      {
        obj.rowClassName += ' hidden';
      }

      return obj;
    },

    getFilters: function(plan)
    {
      if (this.collection)
      {
        return this.collection.getFilters(plan);
      }

      return {
        startTime: {},
        whStatuses: [],
        psStatuses: [],
        distStatuses: [],
        orders: [],
        sets: [],
        lines: [],
        mrps: []
      };
    },

    serializeSet: function(setData, plan, whUser)
    {
      var obj = this.serialize(plan, setData.i, this.getFilters(plan));
      var canManage = user.isAllowedTo('WH:MANAGE');
      var canManageCarts = user.isAllowedTo('WH:MANAGE:CARTS');
      var userFunc = this.getUserFunc(whUser);
      var isUser = !!userFunc;
      var isPicklistUser = isUser && userFunc._id === obj.picklistFunc;
      var picklistDone = obj.picklistDone === 'success';
      var undelivered = !setData.delivered;

      obj.visible = {
        picklistDone: true,
        funcs: {}
      };
      obj.clickable = {
        picklistDone: undelivered
          && (canManage || (isUser && userFunc._id === obj.picklistFunc && !picklistDone))
      };

      obj.funcs.forEach(function(func)
      {
        var isAssigned = !!func.user;
        var isFunc = isUser && userFunc._id === func._id;

        if (canManage || !isUser || isFunc)
        {
          obj.visible.funcs[func._id] = true;
        }

        var canIgnorePicklist = !isAssigned
          && (isPicklistUser || canManage)
          && picklistDone
          && (func.status === 'pending' || func.status === 'picklist' || func.picklist === 'ignore');

        obj.clickable[func._id] = {
          picklist: undelivered
            && (
              canIgnorePicklist
              || (isAssigned && canManage && picklistDone)
              || (picklistDone && isUser && isFunc && func.status === 'picklist')
            ),
          pickup: undelivered
            && (
              (isAssigned && canManage && func.picklist === 'require')
              || (isAssigned && canManageCarts && func.pickup === 'success')
              || (picklistDone && isUser && isFunc && func.status === 'pickup')
            )
        };
      });

      obj.visible.picklistDone = Object.keys(obj.visible.funcs).length !== 1 || isPicklistUser;

      var fmx = this.getFunc('fmx');
      var kitter = this.getFunc('kitter');
      var platformer = this.getFunc('platformer');

      if (platformer.status === 'finished' && platformer.pickup === 'success')
      {
        obj.clickable.fmx.picklist = false;
        obj.clickable.fmx.pickup = false;
        obj.clickable.kitter.picklist = false;
        obj.clickable.kitter.pickup = false;
      }

      obj.clickable.platformer.picklist = false;
      obj.clickable.platformer.pickup = obj.clickable.platformer.pickup
        && fmx.pickup === 'success'
        && kitter.status !== 'problem'
        && platformer.status !== 'problem';

      obj.clickable.painter.picklist = false;

      obj.clickable.printLabels = canManage
        || (isUser && userFunc._id !== 'platformer' && userFunc._id !== 'painter');

      return obj;
    },

    serializeProblemFuncs: function()
    {
      var problemFuncs = {};

      ['lp10', 'fmx', 'kitter', 'platformer', 'packer', 'painter'].forEach(function(funcId)
      {
        problemFuncs[funcId] = this.serializeProblemFunc(funcId);
      }, this);

      return problemFuncs;
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
          problem: this.get('problem'),
          solvable: false
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
          problem: func.comment,
          solvable: false
        };
      }

      if (user.isAllowedTo('WH:SOLVER', 'WH:MANAGE'))
      {
        var status = this.get('status');

        if (status === 'problem' && problemFunc.className === 'wh-problems-failure')
        {
          problemFunc.solvable = true;
        }
        else if (problemFunc.className === 'wh-problems-progress' && funcId === 'platformer')
        {
          problemFunc.solvable = true;
        }
      }

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
    },

    isDelivered: function()
    {
      var distStatus = this.get('distStatus');

      return distStatus === 'started' || distStatus === 'finished';
    }

  }, {

    FUNC_LIST: Object.keys(FUNC_TO_INDEX),
    FUNC_TO_INDEX: FUNC_TO_INDEX

  });
});
