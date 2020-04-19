// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  t,
  time,
  Model,
  userInfoTemplate
) {
  'use strict';

  var DATE_PROPS = [
    'date',
    'completedAt',
    'deliveringAt',
    'deliveredAt'
  ];

  var STATUS_TO_CLASS_NAME = {
    completing: 'warning',
    completed: '',
    delivering: 'info',
    delivered: 'success'
  };

  return Model.extend({

    urlRoot: '/old/wh/setCarts',

    clientUrlRoot: '#wh/setCarts',

    topicPrefix: 'old.wh.setCarts',

    privilegePrefix: 'WH',

    nlsDomain: 'wh-setCarts',

    serialize: function()
    {
      var obj = this.toJSON();

      obj.className = STATUS_TO_CLASS_NAME[obj.status];
      obj.status = t(this.nlsDomain, 'status:' + obj.status);
      obj.kind = t(this.nlsDomain, 'kind:' + obj.kind);
      obj.date = time.format(obj.date, 'L');
      obj.orders = obj.orders.map(function(o) { return o.sapOrder; }).join('; ');
      obj.completedAt = time.format(obj.completedAt, 'L LTS');
      obj.duration = obj.deliveredAt && obj.deliveringAt
        ? time.toString((Date.parse(obj.deliveredAt) - Date.parse(obj.deliveringAt)) / 1000, false, false)
        : '';
      obj.deliveringAt = obj.deliveringAt ? time.format(obj.deliveringAt, 'L LTS') : '';
      obj.deliveredAt = obj.deliveredAt ? time.format(obj.deliveredAt, 'L LTS') : '';
      obj.completedBy = obj.completedBy
        .map(function(userInfo) { return userInfoTemplate({userInfo: userInfo}); })
        .join('; ');
      obj.deliveringBy = userInfoTemplate({userInfo: obj.deliveringBy});
      obj.deliveredBy = userInfoTemplate({userInfo: obj.deliveredBy});

      if (obj.redirLine)
      {
        obj.redirLine = obj.redirLines
          .map(function(sourceLine, i) { return _.escape(sourceLine) + ' ➜ ' + _.escape(obj.lines[i]); })
          .join('\n');
        obj.line = '<i class="fa fa-arrow-right"></i><span>' + _.escape(obj.line) + '</span>';
      }

      return obj;
    }

  }, {

    STATUSES: ['completing', 'completed', 'delivering', 'delivered'],
    KINDS: ['components', 'packaging'],

    parse: function(obj)
    {
      DATE_PROPS.forEach(function(prop)
      {
        if (obj[prop])
        {
          obj[prop] = new Date(obj[prop]);
        }
      });

      if (obj.date && obj.set)
      {
        obj.setKey = obj.date.getTime() + ':' + obj.set;
      }

      return obj;
    },

    isPartial: function(obj)
    {
      return obj.status === undefined
        || obj.date === undefined
        || obj.kind === undefined
        || obj.set === undefined
        || obj.cart === undefined
        || obj.users === undefined;
    }

  });
});
