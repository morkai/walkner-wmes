// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/templates/userInfo',
  'app/wmes-osh-common/dictionaries'
], function(
  time,
  currentUser,
  Model,
  userInfoTemplate,
  dictionaries
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/rewards',

    clientUrlRoot: '#osh/rewards',

    topicPrefix: 'osh.rewards',

    privilegePrefix: 'OSH:REWARDS',

    nlsDomain: 'wmes-osh-rewards',

    labelAttribute: 'rid',

    serialize: function()
    {
      const obj = this.toJSON();

      if (obj.paid)
      {
        obj.className = 'success';
      }

      if (obj.type === 'observation')
      {
        const match = obj.rid.match(/^O-([0-9]{4})-M000([0-9]{2})$/);
        const month = time.utc.getMoment(`${match[1]}-${match[2]}-01`, 'YYYY-MM-DD');
        const url = `#osh/observations?exclude(changes)&sort(-date)&limit(-1337)`
          + `&date=ge=${month.valueOf()}`
          + `&date=lt=${month.add(1, 'months').valueOf()}`
          + `&creator.id=${obj.creator.id}`;

        obj.rid = `<a href="${url}">${obj.rid}</a>`;
      }
      else if (obj.type === 'kaizen')
      {
        obj.rid = `<a href="#osh/kaizens/${obj.rid}">${obj.rid}</a>`;
      }

      obj.recipient = userInfoTemplate(obj.recipient, {noIp: true});
      obj.creator = userInfoTemplate(obj.creator);
      obj.payer = userInfoTemplate(obj.payer);

      obj.createdAt = time.format(obj.createdAt, 'L LT');
      obj.paidAt = obj.paidAt ? time.format(obj.paidAt, 'L LT') : '';

      obj.amount = dictionaries.currencyFormatter.format(obj.amount);

      return obj;
    }

  }, {

    can: {

      viewAll: function()
      {
        return currentUser.isAllowedTo('OSH:REWARDS:VIEW') || dictionaries.isCoordinator();
      }

    }

  });
});
