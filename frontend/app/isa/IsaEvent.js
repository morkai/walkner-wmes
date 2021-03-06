// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  t,
  time,
  Model,
  userInfoTemplate
) {
  'use strict';

  var EVENT_TO_SEVERITY_CLASS_NAME = {
    pickupRequested: 'debug',
    deliveryRequested: 'debug',
    requestCancelled: 'danger',
    requestAccepted: 'warning',
    requestFinished: 'success'
  };

  return Model.extend({

    urlRoot: '/isaEvents',

    clientUrlRoot: '#isa/events',

    topicPrefix: 'isaEvents',

    privilegePrefix: 'ISA',

    nlsDomain: 'isa',

    serializeRow: function(compact)
    {
      var obj = this.toJSON();

      obj.className = EVENT_TO_SEVERITY_CLASS_NAME[this.get('type')];
      obj.time = time.format(obj.time, compact ? 'LTS' : 'LL, LTS');
      obj.line = this.getProdLineId();
      obj.user = userInfoTemplate({userInfo: {
        id: obj.user.id,
        label: this.getUserName(compact),
        ip: compact ? null : obj.user.ip,
        cname: compact ? null : obj.user.cname
      }});
      obj.action = this.getActionText();

      return obj;
    },

    getProdLineId: function()
    {
      var orgUnits = this.get('orgUnits');
      var last = _.last(orgUnits);

      if (last && last.type === 'prodLine')
      {
        return last.id;
      }

      var line = _.find(orgUnits, function(orgUnit) { return orgUnit.type === 'prodLine'; });

      return line ? line.id : null;
    },

    getUserName: function(compact)
    {
      var userName = this.get('user').label;

      if (!compact)
      {
        return userName;
      }

      var parts = userName.split(' ');

      if (parts.length === 1)
      {
        return userName;
      }

      return parts[0] + ' ' + parts[1].charAt(0) + '.';
    },

    getActionText: function()
    {
      var data = t.flatten(this.get('data'));

      if (!data.qty)
      {
        data.qty = 8;
      }

      return t('isa', 'events:' + this.get('type'), data);
    }

  });
});
