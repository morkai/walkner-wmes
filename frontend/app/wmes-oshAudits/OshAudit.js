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
  dictionaries,
  renderUserInfo
) {
  'use strict';

  var DATE_PROPERTIES = ['date'];
  var TIME_PROPERTIES = ['createdAt', 'updatedAt'];
  var USER_INFO_PROPERTIES = ['creator', 'updater', 'auditor'];
  var STATUS_TO_CLASS = {
    new: 'default',
    inProgress: 'info',
    finished: 'success',
    cancelled: 'danger'
  };

  return Model.extend({

    urlRoot: '/oshAudits',

    clientUrlRoot: '#oshAudits',

    topicPrefix: 'oshAudits',

    privilegePrefix: 'OSH_AUDITS',

    nlsDomain: 'wmes-oshAudits',

    labelAttribute: 'rid',

    serialize: function(options)
    {
      var longDateTime = options && options.longDateTime;
      var dateFormat = longDateTime ? 'LL' : 'L';
      var timeFormat = longDateTime ? 'LLLL' : 'L, LTS';
      var obj = this.toJSON();

      obj.status = t(this.nlsDomain, 'status:' + obj.status);

      obj.section = dictionaries.sections.getLabel(obj.section);

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
        obj[userInfoProperty] = renderUserInfo(obj[userInfoProperty]);
      });

      obj.results = obj.results.map(function(r)
      {
        return Object.assign({}, r);
      });

      return obj;
    },

    serializeDetails: function()
    {
      return this.serialize({longDateTime: true});
    },

    serializeRow: function(options)
    {
      var row = this.serialize(options);

      row.className = STATUS_TO_CLASS[this.get('status')];

      row.categories = row.results
        .filter(r => r.ok === false)
        .map(r => r.shortName)
        .join('; ');

      if (row.anyNok)
      {
        row.nok = row.results.filter(r => !!r.comment)[0].comment;
      }

      return row;
    },

    isCreator: function()
    {
      return this.attributes.creator && this.attributes.creator.id === user.data._id;
    },

    isAuditor: function()
    {
      return this.attributes.auditor && this.attributes.auditor.id === user.data._id;
    }

  }, {

    can: {

      manage: function()
      {
        return user.isAllowedTo('OSH_AUDITS:MANAGE');
      },

      add: function()
      {
        if ((this.can || this).manage())
        {
          return true;
        }

        return dictionaries.isAuditor();
      },

      edit: function(model)
      {
        if ((this.can || this).manage())
        {
          return true;
        }

        return model.isCreator() || model.isAuditor();
      },

      delete: function(model)
      {
        if ((this.can || this).manage())
        {
          return true;
        }

        if (!model.isCreator())
        {
          return false;
        }

        return Date.now() - Date.parse(model.get('updatedAt')) < 8 * 3600 * 1000;
      }

    }

  });
});
