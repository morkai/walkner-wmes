// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../user',
  '../core/Model',
  'app/kaizenOrders/dictionaries',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  user,
  Model,
  kaizenDictionaries,
  renderUserInfo
) {
  'use strict';

  var DATE_PROPERTIES = ['date'];
  var TIME_PROPERTIES = ['createdAt', 'updatedAt'];
  var USER_INFO_PROPERTIES = ['creator', 'updater', 'owner'];

  return Model.extend({

    urlRoot: '/minutesForSafetyCards',

    clientUrlRoot: '#minutesForSafetyCards',

    topicPrefix: 'minutesForSafetyCards',

    privilegePrefix: 'KAIZEN',

    nlsDomain: 'minutesForSafetyCards',

    labelAttribute: 'rid',

    defaults: function()
    {
      return {
        date: new Date(),
        owner: user.getInfo()
      };
    },

    serialize: function(options)
    {
      var longDateTime = options && options.longDateTime;
      var dateFormat = longDateTime ? 'LL' : 'L';
      var timeFormat = longDateTime ? 'LLLL' : 'L, LTS';
      var obj = this.toJSON();

      obj.section = kaizenDictionaries.sections.getLabel(obj.section);

      DATE_PROPERTIES.forEach(function(dateProperty)
      {
        obj[dateProperty] = obj[dateProperty] ? time.format(obj[dateProperty], dateFormat) : null;
      });

      TIME_PROPERTIES.forEach(function(timeProperty)
      {
        obj[timeProperty] = obj[timeProperty] ? time.format(obj[timeProperty], timeFormat) : null;
      });

      USER_INFO_PROPERTIES.forEach(function(userInfoProperty)
      {
        obj[userInfoProperty] = renderUserInfo({userInfo: obj[userInfoProperty]});
      });

      return obj;
    },

    serializeRow: function(options)
    {
      return this.serialize(options);
    },

    serializeDetails: function()
    {
      return this.serialize({longDateTime: true});
    },

    isCreator: function()
    {
      return this.attributes.creator && this.attributes.creator.id === user.data._id;
    },

    isOwner: function()
    {
      return this.attributes.owner && this.attributes.owner.id === user.data._id;
    },

    canEdit: function()
    {
      return user.isAllowedTo(this.privilegePrefix + ':MANAGE')
        || this.isCreator()
        || this.isOwner();
    },

    canDelete: function()
    {
      if (user.isAllowedTo(this.privilegePrefix + ':MANAGE'))
      {
        return true;
      }

      if (!this.isCreator() && !this.isOwner())
      {
        return false;
      }

      return Date.now() - Date.parse(this.get('date')) < 24 * 3600 * 1000;
    }

  });
});
