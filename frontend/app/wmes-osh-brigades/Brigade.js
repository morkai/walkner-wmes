// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  time,
  Model,
  userInfoTemplate
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/brigades',

    clientUrlRoot: '#osh/brigades',

    topicPrefix: 'osh.brigades',

    privilegePrefix: 'OSH:HR',

    nlsDomain: 'wmes-osh-brigades',

    getLabel: function()
    {
      return time.utc.format(this.get('date'), 'YYYY-MM') + ', ' + this.get('leader').label;
    },

    serialize: function()
    {
      const obj = this.toJSON();

      obj.date = time.utc.format(obj.date, 'MMMM YYYY');
      obj.leader = userInfoTemplate(obj.leader);

      return obj;
    },

    serializeRow: function()
    {
      const obj = this.serialize();
      const members = obj.members

      obj.members = members.length ? userInfoTemplate(obj.members[0]) : '';

      if (members.length > 1)
      {
        obj.members += ` +${members.length - 1}`;
      }

      return obj;
    },

    serializeDetails: function()
    {
      const obj = this.serialize();

      obj.members = obj.members.map(userInfoTemplate);

      return obj;
    }

  });
});
