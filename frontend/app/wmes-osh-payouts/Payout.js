// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/Model',
  'app/core/templates/userInfo',
  'app/wmes-osh-common/dictionaries'
], function(
  t,
  time,
  currentUser,
  Model,
  userInfoTemplate,
  dictionaries
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/payouts',

    clientUrlRoot: '#osh/payouts',

    topicPrefix: 'osh.payouts',

    privilegePrefix: 'OSH:REWARDS',

    nlsDomain: 'wmes-osh-payouts',

    serialize: function()
    {
      const obj = this.toJSON();

      obj.creator = userInfoTemplate(obj.creator);

      return obj;
    },

    serializeRow: function()
    {
      const obj = this.serialize();

      obj.createdAt = time.format(obj.createdAt, 'L LT');
      obj.recipients = obj.recipients.length.toLocaleString();
      obj.count = Object.keys(obj.count)
        .filter(k => k !== 'total')
        .map(k => t(this.nlsDomain, `count:${k}`, {count: obj.count[k]}))
        .join('; ');
      obj.amount = dictionaries.currencyFormatter.format(obj.amount.total);
      obj.companies = obj.companies.map(c => c.label).join('; ');

      return obj;
    },

    serializeDetails: function()
    {
      const obj = this.serialize();

      obj.createdAt = time.format(obj.createdAt, 'LLLL');

      return obj;
    }

  });
});
