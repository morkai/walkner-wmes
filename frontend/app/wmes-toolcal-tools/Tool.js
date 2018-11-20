// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../user',
  '../core/Model',
  './dictionaries'
], function(
  _,
  t,
  time,
  user,
  Model,
  dictionaries
) {
  'use strict';

  return Model.extend({

    urlRoot: '/toolcal/tools',

    clientUrlRoot: '#toolcal/tools',

    topicPrefix: 'toolcal.tools',

    privilegePrefix: 'TOOLCAL',

    nlsDomain: 'wmes-toolcal-tools',

    labelAttribute: 'rid',

    defaults: function()
    {
      return {
        status: 'in-use',
        interval: 3,
        intervalUnit: 'month'
      };
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.type = dictionaries.types.getLabel(obj.type) || '-';
      obj.status = t(this.nlsDomain, 'status:' + obj.status);
      obj.users = obj.users.map(function(u) { return u.label; });
      obj.lastDate = time.format(obj.lastDate, 'L');
      obj.nextDate = time.format(obj.nextDate, 'L');

      return obj;
    },

    isOwner: function()
    {
      return _.some(this.attributes.users, function(u) { return u.id === user.data._id; });
    },

    canEdit: function()
    {
      if (user.isAllowedTo(this.privilegePrefix + ':MANAGE'))
      {
        return true;
      }

      if (this.get('status') === 'retired')
      {
        return false;
      }

      return this.isOwner();
    },

    canDelete: function()
    {
      return user.isAllowedTo(this.privilegePrefix + ':MANAGE');
    }

  });
});
