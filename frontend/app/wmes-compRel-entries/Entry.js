// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../i18n',
  '../time',
  '../user',
  '../socket',
  '../core/Model',
  '../core/util/autolinker',
  '../core/util/html',
  '../data/colorFactory',
  '../data/mrpControllers',
  './dictionaries',
  'app/core/templates/userInfo'
], function(
  _,
  $,
  t,
  time,
  user,
  socket,
  Model,
  autolinker,
  html,
  colorFactory,
  mrpControllers,
  dictionaries,
  userInfoTemplate
) {
  'use strict';

  var STATUS_CLASS = {
    pending: 'default',
    rejected: 'danger',
    accepted: 'success'
  };

  var MIME_TO_ICON = {
    image: 'fa-file-image-o',
    text: 'fa-file-text-o',
    audio: 'fa-audio-o',
    video: 'fa-video-o',
    'application/octet-stream': 'fa-file-archive-o',
    'application/x-zip-compressed': 'fa-file-archive-o',
    'application/x-7z-compressed': 'fa-file-archive-o',
    'application/x-rar-compressed': 'fa-file-archive-o',
    'application/pdf': 'fa-file-pdf-o',
    'application/json': 'fa-file-code-o',
    'application/msword': 'fa-file-word-o',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-file-word-o',
    'application/vnd.ms-excel': 'fa-file-excel-o',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fa-file-excel-o',
    'application/vnd.ms-powerpoint': 'fa-file-powerpoint-o',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'fa-file-powerpoint-o'
  };

  colorFactory.setColors('compRel/users', [
    '#0af', '#5cb85c', '#fa0', '#a0f', '#f0a', '#f00', '#ff0', '#9ff'
  ]);

  return Model.extend({

    urlRoot: '/compRel/entries',

    clientUrlRoot: '#compRel/entries',

    topicPrefix: 'compRel.entries',

    privilegePrefix: 'COMP_REL',

    nlsDomain: 'wmes-compRel-entries',

    labelAttribute: 'rid',

    getFunc: function(id)
    {
      return (this.get('funcs') || []).find(function(func) { return func._id === id; });
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.className = STATUS_CLASS[this.get('status')];
      obj.createdAt = time.format(obj.createdAt, 'L HH:mm');
      obj.updatedAt = time.format(obj.updatedAt, 'L HH:mm');
      obj.creator = userInfoTemplate({userInfo: obj.creator, noIp: true});
      obj.updater = userInfoTemplate({userInfo: obj.updater, noIp: true});
      obj.status = t(this.nlsDomain, 'status:' + obj.status);

      return obj;
    },

    serializeRow: function()
    {
      var obj = this.serialize();

      obj.mrps = obj.mrps.map(function(id)
      {
        var mrpController = mrpControllers.get(id);
        var title = mrpController ? mrpController.get('description') : id;

        return '<span title="' + _.escape(title) + '">' + _.escape(id) + '</span>';
      }).join(', ');

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serialize();
      var mrps = obj.mrps;

      if (mrps.length === 1)
      {
        obj.mrps = mrps[0];

        var mrpController = mrpControllers.get(obj.mrps);

        if (mrpController)
        {
          obj.mrps += ': ' + _.escape(mrpController.get('description'));
        }
      }
      else
      {
        obj.mrps = '<ul>';

        mrps.forEach(function(mrp)
        {
          var mrpController = mrpControllers.get(mrp);

          obj.mrps += '<li>' + mrp;

          if (mrpController)
          {
            obj.mrps += ': ' + _.escape(mrpController.get('description'));
          }
        });

        obj.mrps += '</ul>';
      }

      obj.oldComponent = obj.oldCode + ': ' + _.escape(obj.oldName);
      obj.newComponent = obj.newCode + ': ' + _.escape(obj.newName);

      return obj;
    },

    serializeFuncs: function()
    {
      var model = this;

      return (model.get('funcs') || []).map(function(func)
      {
        return {
          _id: func._id,
          label: dictionaries.funcs.getLabel(func._id),
          acceptedAt: func.acceptedAt ? time.format(func.acceptedAt, 'L HH:mm') : '-',
          acceptedBy: func.acceptedBy ? userInfoTemplate({userInfo: func.acceptedBy, noIp: true}) : '-',
          status: func.status,
          statusText: t(model.nlsDomain, 'funcStatus:' + func.status),
          comment: func.comment || '-',
          users: func.users.map(function(u) { return userInfoTemplate({userInfo: u}); }),
          canAccept: model.constructor.can.acceptFunc(model, func._id)
        };
      });
    },

    serializeChat: function()
    {
      var entry = this;
      var availableAttachments = {};

      (entry.get('attachments') || []).forEach(function(a)
      {
        availableAttachments[a._id] = true;
      });

      var createdAt = entry.get('createdAt');
      var createdAtMoment = time.getMoment(createdAt);
      var creator = entry.get('creator');
      var self = creator.id === user.data._id;
      var chat = [{
        user: {
          id: creator.id,
          label: userInfoTemplate({userInfo: creator, noIp: true}),
          self: self
        },
        color: self ? 'transparent' : colorFactory.getColor('compRel/users', creator.id),
        lines: [{
          time: createdAtMoment.format('LLLL'),
          text: t(entry.nlsDomain, 'history:added', {
            day: createdAtMoment.day(),
            ddd: createdAtMoment.format('ddd'),
            date: createdAtMoment.format('D MMMM YYYY'),
            time: createdAtMoment.format('HH:mm:ss')
          })
        }]
      }];

      (entry.get('changes') || []).forEach(function(change)
      {
        if (!change.user)
        {
          return;
        }

        var hasComment = !!change.comment;
        var hasAttachmentsAdded = !!change.data.attachments
          && !change.data.attachments[0]
          && !!change.data.attachments[1];

        if (hasComment
          || hasAttachmentsAdded)
        {
          entry.serializeChatMessage(change, chat, availableAttachments);
        }
      });

      return chat;
    },

    serializeChatMessage: function(change, chat, availableAttachments)
    {
      var entry = this;
      var prev = chat && chat[chat.length - 1];
      var shortTime = '<time>' + time.format(change.date, 'HH:mm:ss') + '</time>';
      var longTime = time.format(change.date, 'dddd, LL LTS');
      var lines = [];

      if (change.comment)
      {
        var text = this.serializeText(change.comment);

        lines.push({
          time: longTime,
          text: shortTime + '<span class="compRel-chat-line-text">' + text + '</span>'
        });
      }

      var attachments = change.data.attachments;

      if (attachments && !attachments[0] && attachments[1])
      {
        var title = t(entry.nlsDomain, 'autolink:attachment');

        change.data.attachments[1].forEach(function(a)
        {
          if (availableAttachments && !availableAttachments[a._id])
          {
            return;
          }

          var attachment = entry.serializeAttachment(a);

          lines.push({
            time: longTime,
            text: '<span class="compRel-chat-attachment" title="' + title + '" data-attachment-id="' + a._id + '">'
              + '<i class="fa ' + attachment.icon + '"></i><a>'
              + _.escape(attachment.label)
              + '</a></span>'
          });
        });
      }

      if (prev && prev.user.id === change.user.id)
      {
        prev.lines.push.apply(prev.lines, lines);

        return prev;
      }

      var self = change.user.id === user.data._id;
      var message = {
        user: {
          id: change.user.id,
          label: userInfoTemplate({userInfo: change.user, noIp: true}),
          self: self
        },
        color: self ? 'transparent' : colorFactory.getColor('compRel/users', change.user.id),
        lines: lines
      };

      if (chat && message.lines.length)
      {
        chat.push(message);
      }

      return message;
    },

    serializeText: function(text)
    {
      return autolinker.autolinkMessage(text, {nlsDomain: this.nlsDomain});
    },

    serializeAttachment: function(attachment)
    {
      var type = attachment.type.split('/')[0];

      return {
        _id: attachment._id,
        icon: MIME_TO_ICON[attachment.type] || MIME_TO_ICON[type] || 'fa-file-o',
        preview: type === 'image',
        label: attachment.name,
        menu: this.constructor.can.manage()
          || (attachment.user && attachment.user.id === user.data._id)
      };
    },

    serializeOrders: function()
    {
      return (this.get('orders') || []).map(function(order)
      {
        return {
          _id: order._id,
          releasedAt: time.format(order.releasedAt, 'L HH:mm'),
          releasedBy: userInfoTemplate({userInfo: order.releasedBy, noIp: true})
        };
      });
    },

    change: function(prop, newValue, oldValue)
    {
      if (oldValue === undefined)
      {
        oldValue = this.get(prop);
      }

      var data = {};

      data[prop] = [oldValue, newValue];

      this.multiChange(data, true);
    },

    multiChange: function(data, hasOldValues)
    {
      var entry = this;
      var change = {
        date: new Date(),
        user: user.getInfo(),
        data: {},
        comment: ''
      };
      var update = {};

      Object.keys(data).forEach(function(prop)
      {
        var oldValue;
        var newValue;

        if (hasOldValues)
        {
          oldValue = data[prop][0];
          newValue = data[prop][1];
        }
        else
        {
          oldValue = entry.get(prop);
          newValue = data[prop];
        }

        if (JSON.stringify(newValue) === JSON.stringify(oldValue))
        {
          return;
        }

        change.data[prop] = [oldValue, newValue];
        update[prop] = newValue;
      });

      if (Object.keys(data).length && !Object.keys(update).length)
      {
        return;
      }

      entry.handleChange(change);
      entry.update(update);
    },

    handleChange: function(change)
    {
      var entry = this;
      var data = {};

      if (change.comment.length || !_.isEmpty(change.data))
      {
        data.changes = entry.get('changes').concat(change);
      }

      Object.keys(change.data).forEach(function(prop)
      {
        var propName = prop.split('$')[0];

        if (!propName)
        {
          return;
        }

        var propData = change.data[prop];
        var handler = entry.propChangeHandlers[propName];

        if (typeof handler === 'function')
        {
          handler.call(entry.propChangeHandlers, data, entry, propData, change);
        }
        else
        {
          data[propName] = propData[1];
        }
      });

      entry.set(data);
    },

    update: function(data)
    {
      var entry = this;
      var req = $.ajax({
        method: 'PUT',
        url: '/compRel/entries/' + entry.id,
        data: JSON.stringify({
          socketId: socket.getId(),
          data: data
        })
      });

      req.fail(function()
      {
        entry.fetch();
      });

      return req;
    },

    propChangeHandlers: {

      funcs: function(data, entry, propData)
      {
        var oldFuncs = {};
        var newFuncs = [];

        (entry.get('funcs') || []).forEach(function(func)
        {
          oldFuncs[func._id] = func;
        });

        Object.keys(propData[0]).forEach(function(funcId)
        {
          var oldFunc = propData[0][funcId];
          var newFunc = propData[1][funcId];

          if (!oldFunc)
          {
            if (newFunc)
            {
              newFuncs.push(newFunc);
            }

            return;
          }

          delete oldFuncs[funcId];

          if (!newFunc)
          {
            return;
          }

          Object.assign(oldFunc, newFunc);
          newFuncs.push(oldFunc);
        });

        Object.values(oldFuncs).forEach(function(func) { newFuncs.push(func); });

        newFuncs.sort(function(a, b) { return a._id.localeCompare(b._id); });

        data.funcs = newFuncs;
      },

      attachments: function(data, entry, newOrders)
      {
        this.list('attachments', data, entry, newOrders);
      },

      orders: function(data, entry, newOrders)
      {
        this.list('orders', data, entry, newOrders);
      },

      list: function(property, data, entry, newList)
      {
        var oldList = entry.get(property);

        if (newList[0] === null)
        {
          this.addList(property, data, entry, oldList, newList[1]);
        }
        else if (newList[1] === null)
        {
          this.removeList(property, data, entry, oldList, newList[0]);
        }
        else
        {
          this.editList(property, data, entry, oldList, newList[1]);
        }
      },
      addList: function(property, data, entry, oldList, added)
      {
        var map = {};

        oldList.forEach(function(item) { map[item._id] = true; });

        var newList = [].concat(oldList);

        added.forEach(function(item)
        {
          if (!map[item._id])
          {
            newList.push(item);

            map[item.id] = true;
          }
        });

        data[property] = newList;
      },
      removeList: function(property, data, entry, oldList, removed)
      {
        var map = {};

        removed.forEach(function(item) { map[item._id] = true; });

        data[property] = oldList.filter(function(item) { return !map[item._id]; });
      },
      editList: function(property, data, entry, oldList, edited)
      {
        var map = {};

        edited.forEach(function(item) { map[item._id] = item; });

        data[property] = oldList.map(function(item)
        {
          return map[item._id] || item;
        });
      }

    }

  }, {

    can: {

      add: function()
      {
        return user.isAllowedTo('PROD_DATA:MANAGE', 'COMP_REL:ADD', 'FN:production-planner');
      },

      manage: function()
      {
        return user.isAllowedTo('PROD_DATA:MANAGE', 'COMP_REL:MANAGE');
      },

      edit: function(model)
      {
        var can = this.can || this;

        if (can.manage())
        {
          return true;
        }

        var creator = model.get('creator');

        if (!creator || model.get('status') === 'accepted')
        {
          return false;
        }

        return creator.id === user.data._id;
      },

      delete: function(model)
      {
        return (this.can || this).edit(model);
      },

      accept: function(model)
      {
        var can = this.can || this;

        return (model.get('funcs') || []).some(function(func)
        {
          return can.acceptFunc(model, func._id);
        });
      },

      acceptFunc: function(model, funcId)
      {
        if ((this.can || this).manage())
        {
          return true;
        }

        if (model.get('status') === 'accepted')
        {
          return false;
        }

        var func = model.getFunc(funcId);

        if (!func)
        {
          return false;
        }

        return func.users.some(function(u) { return u.id === user.data._id; });
      },

      releaseOrder: function(model)
      {
        return model.get('status') === 'accepted'
          && ((this.can || this).manage() || user.isAllowedTo('FN:production-planner'));
      },

      uploadAttachments: function()
      {
        return true;
      }

    }

  });
});
