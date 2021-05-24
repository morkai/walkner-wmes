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

      obj.rid = `<a href="#osh/kaizens/${obj.rid}">${obj.rid}</a>`;

      obj.recipient = userInfoTemplate(obj.recipient);
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
