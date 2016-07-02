// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../user',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  user,
  Model,
  renderUserInfo
) {
  'use strict';

  var MIME_TO_ICON = {
    'application/octet-stream': 'file-archive-o',
    'application/x-zip-compressed': 'file-archive-o',
    'application/x-7z-compressed': 'file-archive-o',
    'application/x-rar-compressed': 'file-archive-o',
    'application/pdf': 'file-pdf-o',
    'application/json': 'file-text-o',
    'application/msword': 'file-word-o',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'file-word-o',
    'application/vnd.ms-excel': 'file-excel-o',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'file-excel-o',
    'application/vnd.ms-powerpoint': 'file-powerpoint-o',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'file-powerpoint-o'
  };

  return Model.extend({

    urlRoot: '/qi/results',

    clientUrlRoot: '#qi/results',

    topicPrefix: 'qi.results',

    privilegePrefix: 'QI:RESULTS',

    nlsDomain: 'qiResults',

    labelAttribute: 'rid',

    canEdit: function()
    {
      if (user.isAllowedTo('QI:RESULTS:MANAGE'))
      {
        return true;
      }

      var attrs = this.attributes;
      var updatedAt = Date.parse(attrs.updatedAt || attrs.createdAt);

      if (Date.now() - updatedAt > 14 * 24 * 3600 * 1000)
      {
        return false;
      }

      if (!attrs.ok && user.isAllowedTo('QI:SPECIALIST'))
      {
        return true;
      }

      if (attrs.creator && attrs.creator.id === user.data._id)
      {
        return true;
      }

      if (attrs.inspector && attrs.inspector.id === user.data._id)
      {
        return true;
      }

      return false;
    },

    canDelete: function()
    {
      if (user.isAllowedTo('QI:RESULTS:MANAGE'))
      {
        return true;
      }

      var attrs = this.attributes;
      var updatedAt = Date.parse(attrs.updatedAt || attrs.createdAt);

      if (Date.now() - updatedAt > 24 * 3600 * 1000)
      {
        return false;
      }

      if (attrs.creator && attrs.creator.id === user.data._id)
      {
        return true;
      }

      if (attrs.inspector && attrs.inspector.id === user.data._id)
      {
        return true;
      }

      return false;
    },

    serialize: function(dictionaries, options)
    {
      var obj = this.toJSON();

      obj.createdAt = time.format(obj.createdAt, 'LLLL');
      obj.creator = renderUserInfo({userInfo: obj.creator});
      obj.updatedAt = time.format(obj.updatedAt, 'LLLL');
      obj.updater = renderUserInfo({userInfo: obj.updater});
      obj.inspectedAt = time.format(obj.inspectedAt, options.dateFormat || 'YYYY-MM-DD');
      obj.inspector = renderUserInfo({userInfo: obj.inspector});
      obj.kind = dictionaries.getLabel('kind', obj.kind);
      obj.qtyInspected = obj.qtyInspected.toLocaleString();

      if (obj.ok)
      {
        obj.errorCategory = '';
        obj.faultCode = '';
        obj.qtyToFix = '';
        obj.qtyNok = '';
      }
      else
      {
        obj.errorCategory = dictionaries.getLabel('errorCategory', obj.errorCategory);
        obj.qtyToFix = obj.qtyToFix.toLocaleString();
        obj.qtyNok = obj.qtyNok.toLocaleString();
      }

      return obj;
    },

    serializeRow: function(dictionaries)
    {
      var row = this.serialize(dictionaries, {});

      row.className = row.ok ? 'success' : 'danger';

      return row;
    },

    serializeDetails: function(dictionaries)
    {
      var obj = this.serialize(dictionaries, {
        dateFormat: 'LL'
      });

      obj.correctiveActions = this.serializeCorrectiveActions(dictionaries);
      obj.okFile = this.serializeFile(obj.okFile);
      obj.nokFile = this.serializeFile(obj.nokFile);

      return obj;
    },

    serializeCorrectiveActions: function(dictionaries)
    {
      return _.map(this.get('correctiveActions'), function(action)
      {
        return {
          status: dictionaries.getLabel('actionStatus', action.status),
          when: time.format(action.when, 'LL'),
          who: action.who.map(function(u) { return u.label; }).join(', '),
          what: action.what
        };
      });
    },

    serializeFile: function(file)
    {
      if (!file)
      {
        return null;
      }

      var parts = file.type.split('/');

      switch (parts[0])
      {
        case 'image':
        case 'video':
        case 'audio':
        case 'text':
          file.icon = 'file-' + parts[0] + '-o';
          break;

        case 'multipart':
          file.icon = 'file-archive-o';
          break;

        default:
          file.icon = MIME_TO_ICON[file.type] || 'file-o';
          break;
      }

      return file;
    }

  });
});
