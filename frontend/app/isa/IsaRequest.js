// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../i18n',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  t,
  Model,
  renderUserInfo
) {
  'use strict';

  var STATUS_TO_SEVERITY_CLASS_NAME = {
    new: 'debug',
    accepted: 'warning',
    finished: 'success',
    cancelled: 'danger'
  };

  return Model.extend({

    urlRoot: '/isaRequests',

    clientUrlRoot: '#isa/requests',

    topicPrefix: 'isaRequests',

    privilegePrefix: 'ISA',

    nlsDomain: 'isa',

    serializeRow: function()
    {
      var obj = this.toJSON();

      obj.className = STATUS_TO_SEVERITY_CLASS_NAME[obj.status];
      obj.line = this.getProdLineId();
      obj.type = t('isa', 'requests:type:' + obj.type, {
        palletKind: obj.data.palletKind ? obj.data.palletKind.label : '?'
      });
      obj.status = t('isa', 'requests:status:' + obj.status);
      obj.requester = renderUserInfo({userInfo: obj.requester});
      obj.responder = renderUserInfo({userInfo: obj.responder});
      obj.finisher = renderUserInfo({userInfo: obj.finisher});
      obj.requestedAt = time.format(obj.requestedAt, 'LL, HH:mm:ss');
      obj.respondedAt = obj.respondedAt ? time.format(obj.respondedAt, 'HH:mm:ss') : '-';
      obj.finishedAt = obj.finishedAt ? time.format(obj.finishedAt, 'HH:mm:ss') : '-';
      obj.duration = time.toString(this.getDuration());
      obj.request = t('isa', 'requests:date+user', {
        date: obj.requestedAt,
        user: obj.requester
      });
      obj.response = obj.respondedAt === '-' ? '-' : t('isa', 'requests:time+user', {
        time: obj.respondedAt,
        user: obj.responder
      });
      obj.finish = obj.finishedAt === '-' ? '-' : t('isa', 'requests:time+user', {
        time: obj.finishedAt,
        user: obj.finisher
      });

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

    isCompleted: function()
    {
      return this.get('status') === 'finished' || this.get('status') === 'cancelled';
    },

    getDuration: function()
    {
      if (this.isCompleted())
      {
        return this.get('duration');
      }

      return (Date.now() - Date.parse(this.get('requestedAt'))) / 1000;
    }

  });
});
