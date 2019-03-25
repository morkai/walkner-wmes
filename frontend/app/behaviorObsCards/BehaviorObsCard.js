// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../i18n',
  '../time',
  '../user',
  '../core/Model',
  'app/kaizenOrders/dictionaries',
  'app/core/templates/userInfo'
], function(
  _,
  t,
  time,
  user,
  Model,
  kaizenDictionaries,
  renderUserInfo
) {
  'use strict';

  var DATE_PROPERTIES = ['date'];
  var TIME_PROPERTIES = ['createdAt', 'updatedAt'];
  var USER_INFO_PROPERTIES = ['creator', 'updater', 'observer', 'superior'];

  return Model.extend({

    urlRoot: '/behaviorObsCards',

    clientUrlRoot: '#behaviorObsCards',

    topicPrefix: 'behaviorObsCards',

    privilegePrefix: 'KAIZEN',

    nlsDomain: 'behaviorObsCards',

    labelAttribute: 'rid',

    defaults: function()
    {
      return {
        date: new Date()
      };
    },

    serialize: function(options)
    {
      var longDateTime = options && options.longDateTime;
      var dateFormat = longDateTime ? 'LL' : 'L';
      var timeFormat = longDateTime ? 'LLLL' : 'L, LTS';
      var obj = this.toJSON();

      obj.section = kaizenDictionaries.sections.getLabel(obj.section);
      obj.observerSection = kaizenDictionaries.sections.getLabel(obj.observerSection);

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

      if (obj.shift)
      {
        obj.date = t('core', 'SHIFT', {date: obj.date, shift: obj.shift});
      }

      obj.observations.forEach(function(o)
      {
        var b = kaizenDictionaries.behaviours.get(o.id);

        if (b)
        {
          o.behavior = b.t('name');
        }
      });

      return obj;
    },

    serializeRow: function(options)
    {
      var row = this.serialize(options);

      if (row.observations.length)
      {
        var observation = _.find(row.observations, function(o) { return !o.safe && !o.easy; });

        if (!observation)
        {
          observation = _.find(row.observations, function(o) { return !o.safe; });
        }

        row.observation = observation ? (observation.observation || observation.behavior) : '';
      }

      if (row.risks.length)
      {
        var risk = _.find(row.risks, function(r) { return !r.easy; });

        if (!risk)
        {
          risk = row.risks[0];
        }

        row.risk = risk ? risk.risk : '';
      }

      if (row.difficulties.length)
      {
        row.difficulties.forEach(function(difficulty)
        {
          if (!row.hardBehavior && difficulty.behavior)
          {
            row.hardBehavior = difficulty.problem;
          }
          else if (!row.hardCondition && !difficulty.behavior)
          {
            row.hardCondition = difficulty.problem;
          }
        });
      }

      return row;
    },

    serializeDetails: function()
    {
      return this.serialize({longDateTime: true});
    },

    isCreator: function()
    {
      return this.attributes.creator && this.attributes.creator.id === user.data._id;
    },

    canEdit: function()
    {
      if (!user.isLoggedIn())
      {
        return false;
      }

      if (user.isAllowedTo(this.privilegePrefix + ':MANAGE'))
      {
        return true;
      }

      if (!this.isCreator())
      {
        return false;
      }

      return Date.now() - Date.parse(this.get('updatedAt') || this.get('createdAt')) < 24 * 3600 * 1000;
    },

    canDelete: function()
    {
      if (!user.isLoggedIn())
      {
        return false;
      }

      if (user.isAllowedTo(this.privilegePrefix + ':MANAGE'))
      {
        return true;
      }

      if (!this.isCreator())
      {
        return false;
      }

      return Date.now() - Date.parse(this.get('updatedAt') || this.get('createdAt')) < 8 * 3600 * 1000;
    },

    hasAnyEasy: function()
    {
      return _.any(this.get('observations'), function(o) { return !o.safe && o.easy; })
        || _.any(this.get('risks'), function(r) { return r.easy; });
    }

  });
});
