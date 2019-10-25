// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../time',
  '../user',
  '../i18n',
  '../core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  user,
  t,
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

  function serializeCorrectiveActions(dictionaries, correctiveActions)
  {
    return _.map(correctiveActions, function(action)
    {
      return {
        status: dictionaries.getLabel('actionStatus', action.status),
        when: time.format(action.when, 'LL'),
        who: action.who.map(function(u) { return u.label; }).join(', '),
        what: action.what.trim()
      };
    });
  }

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

      if (!attrs.ok)
      {
        return user.isAllowedTo('QI:SPECIALIST', 'FN:master', 'FN:leader', 'FN:prod_whman')
          || this.isInspector()
          || this.isNokOwner()
          || this.isLeader()
          || this.isCorrector();
      }

      return this.isInspector();
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

      return this.isInspector() || this.isCreator();
    },

    canEditAttachments: function(editMode)
    {
      if (editMode)
      {
        return user.isAllowedTo('QI:RESULTS:MANAGE')
          || this.isInspector();
      }

      return user.isAllowedTo('QI:INSPECTOR', 'QI:RESULTS:MANAGE');
    },

    canAddActions: function(editMode)
    {
      if (editMode)
      {
        return this.canEditActions(editMode);
      }

      return user.isAllowedTo('QI:SPECIALIST', 'QI:RESULTS:MANAGE') || this.isNokOwner();
    },

    canEditActions: function(editMode)
    {
      if (editMode)
      {
        return user.isAllowedTo('QI:SPECIALIST', 'QI:RESULTS:MANAGE', 'FN:master', 'FN:leader', 'FN:prod_whman')
          || this.isNokOwner()
          || this.isLeader()
          || this.isCorrector();
      }

      return user.isAllowedTo('QI:SPECIALIST', 'QI:RESULTS:MANAGE');
    },

    isCreator: function()
    {
      return !!this.attributes.creator && this.attributes.creator.id === user.data._id;
    },

    isInspector: function()
    {
      return !!this.attributes.inspector && this.attributes.inspector.id === user.data._id;
    },

    isNokOwner: function()
    {
      return !!this.attributes.nokOwner && this.attributes.nokOwner.id === user.data._id;
    },

    isLeader: function()
    {
      return !!this.attributes.leader && this.attributes.leader.id === user.data._id;
    },

    isCorrector: function()
    {
      var attrs = this.attributes;

      return !!attrs.users
        && _.size(attrs.correctiveActions) > 0
        && attrs.users.indexOf(user.data._id) !== -1
        && _.some(attrs.correctiveActions, function(correctiveAction)
        {
          return _.some(correctiveAction.who, function(who) { return who.id === user.data._id; });
        });
    },

    serialize: function(dictionaries, options)
    {
      var obj = this.toJSON();

      obj.createdAt = time.format(obj.createdAt, 'LLLL');
      obj.creator = renderUserInfo({userInfo: obj.creator});
      obj.updatedAt = time.format(obj.updatedAt, 'LLLL');
      obj.updater = renderUserInfo({userInfo: obj.updater});
      obj.inspectedAtTime = Date.parse(obj.inspectedAt);
      obj.inspectedAt = time.format(obj.inspectedAtTime, options.dateFormat || 'L');
      obj.inspector = renderUserInfo({userInfo: obj.inspector});
      obj.nokOwner = renderUserInfo({userInfo: obj.nokOwner});
      obj.leader = renderUserInfo({userInfo: obj.leader});
      obj.coach = renderUserInfo({userInfo: obj.coach});
      obj.kind = dictionaries.getLabel('kind', obj.kind);
      obj.qtyOrder = obj.qtyOrder ? obj.qtyOrder.toLocaleString() : '0';
      obj.qtyInspected = obj.qtyInspected.toLocaleString();
      obj.serialNumbers = !Array.isArray(obj.serialNumbers) ? '' : obj.serialNumbers.join(', ');

      if (obj.ok)
      {
        obj.errorCategory = '';
        obj.faultCode = '';
        obj.qtyToFix = '';
        obj.qtyNok = '';
        obj.qtyNokInspected = '';
      }
      else
      {
        obj.errorCategory = dictionaries.getLabel('errorCategory', obj.errorCategory);
        obj.qtyToFix = obj.qtyToFix.toLocaleString();
        obj.qtyNok = obj.qtyNok.toLocaleString();
        obj.qtyNokInspected = obj.qtyNokInspected >= 0 ? obj.qtyNokInspected.toLocaleString() : '';
        obj.correctiveActions = this.serializeCorrectiveActions(dictionaries);
      }

      if (obj.source === 'wh')
      {
        obj.orderNo = '';
        obj.mrp = '';
        obj.productFamily = '';
      }
      else if (obj.orderNo === '000000000')
      {
        obj.orderNo = '';
        obj.mrp = '';
        obj.nc12 = '';
        obj.productFamily = '';
        obj.productName = '';
      }

      return obj;
    },

    serializeRow: function(dictionaries, options)
    {
      var row = this.serialize(dictionaries, options);

      row.className = row.ok ? 'success' : 'danger';

      if (!row.ok && row.correctiveActions.length)
      {
        row.correctiveAction = this.serializeBestCorrectiveAction(
          dictionaries,
          options && options.today || time.getMoment().startOf('day').hours(6).valueOf()
        );
      }

      return row;
    },

    serializeDetails: function(dictionaries)
    {
      var obj = this.serialize(dictionaries, {
        dateFormat: 'LL'
      });

      obj.okFile = this.serializeFile(obj.okFile);
      obj.nokFile = this.serializeFile(obj.nokFile);

      return obj;
    },

    serializeCorrectiveActions: function(dictionaries)
    {
      return serializeCorrectiveActions(dictionaries, this.get('correctiveActions'));
    },

    serializeBestCorrectiveAction: function(dictionaries, today)
    {
      var allCorrectiveActions = this.get('correctiveActions');
      var bestCorrectiveAction;

      if (allCorrectiveActions.length === 0)
      {
        return '';
      }

      if (allCorrectiveActions.length === 1)
      {
        bestCorrectiveAction = allCorrectiveActions[0];
      }
      else
      {
        var closestCorrectiveActions = allCorrectiveActions
          .map(function(action)
          {
            var diff = Date.parse(action.when) - today;

            return {
              diff: diff < 0 ? Number.MAX_VALUE : diff,
              action: action
            };
          })
          .sort(function(a, b)
          {
            return a.diff - b.diff;
          });

        bestCorrectiveAction = closestCorrectiveActions[0].action;

        while (closestCorrectiveActions.length)
        {
          var correctiveAction = closestCorrectiveActions.shift().action;

          if (correctiveAction.status !== 'finished')
          {
            bestCorrectiveAction = correctiveAction;

            break;
          }
        }
      }

      var result = dictionaries.getLabel('actionStatus', bestCorrectiveAction.status);

      if (bestCorrectiveAction.when)
      {
        result += ', ' + time.format(bestCorrectiveAction.when, 'L');
      }

      if (allCorrectiveActions.length > 1)
      {
        result += ' +' + (allCorrectiveActions.length - 1);
      }

      return result;
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

  }, {

    serializeCorrectiveActions: serializeCorrectiveActions

  });
});
