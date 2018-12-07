// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  '../i18n',
  '../time',
  '../user',
  '../socket',
  '../core/Model',
  '../data/delayReasons',
  '../data/colorFactory',
  'app/core/templates/userInfo'
], function(
  _,
  $,
  t,
  time,
  user,
  socket,
  Model,
  delayReasons,
  colorFactory,
  userInfoTemplate
) {
  'use strict';

  var STATUS_CLASS = {
    pending: '',
    started: 'warning',
    finished: 'success'
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

  colorFactory.setColors('fap/users', [
    '#0af', '#5cb85c', '#fa0', '#a0f', '#f0a', '#f00', '#ff0', '#9ff'
  ]);

  return Model.extend({

    urlRoot: '/fap/entries',

    clientUrlRoot: '#fap/entries',

    topicPrefix: 'fap.entries',

    privilegePrefix: 'FAP',

    nlsDomain: 'wmes-fap-entries',

    labelAttribute: 'rid',

    initialize: function()
    {
      this.serialized = null;

      this.on('change', function()
      {
        this.serialized = null;
      });
    },

    serialize: function()
    {
      if (this.serialized)
      {
        return this.serialized;
      }

      var obj = this.toJSON();

      obj.createdAt = time.format(obj.createdAt, 'L HH:mm');

      var delayReason = delayReasons.get(obj.category);

      if (delayReason)
      {
        obj.category = delayReason.getLabel();
      }

      obj.divisions = obj.divisions.join('; ');
      obj.lines = obj.lines.join('; ');

      if (obj.assessment === 'unspecified')
      {
        obj.analysisNeed = '-';
        obj.analysisDone = '-';
      }
      else
      {
        obj.analysisNeed = t('core', 'BOOL:' + obj.analysisNeed);
        obj.analysisDone = t('core', 'BOOL:' + obj.analysisDone);
      }

      obj.assessment = t(this.nlsDomain, 'assessment:' + obj.assessment);

      return this.serialized = obj;
    },

    serializeRow: function()
    {
      if (this.serialized)
      {
        return this.serialized;
      }

      var obj = this.serialize();

      obj.className = STATUS_CLASS[obj.status];
      obj.category = '<span class="fap-list-category">' + _.escape(obj.category) + '</span>';
      obj.problem = '<span class="fap-list-problem">' + _.escape(obj.problem) + '</span>';

      return this.serialized = obj;
    },

    serializeDetails: function()
    {
      if (this.serialized)
      {
        return this.serialized;
      }

      var obj = this.serialize();

      obj.problem = obj.problem.trim().replace(/\n{3,}/, '\n\n');
      obj.multilineProblem = obj.problem.indexOf('\n') !== -1;
      obj.multilineSolution = obj.solution.indexOf('\n') !== -1;
      obj.chat = this.serializeChat();
      obj.attachments = obj.attachments.map(this.serializeAttachment, this);
      obj.observers = this.serializeObservers();
      obj.auth = this.serializeAuth();

      return this.serialized = obj;
    },

    serializeAuth: function()
    {
      var canManage = user.isAllowedTo('FAP:MANAGE');
      var isProcessEngineer = user.isAllowedTo('FN:process-engineer');
      var isMaster = user.isAllowedTo('FN:master');
      var isLeader = user.isAllowedTo('FN:leader');
      var isAnalyzer = _.some(this.get('analyzers'), function(u) { return user.data._id === u.id; });

      return {
        delete: this.canDelete(),
        status: canManage || isProcessEngineer || isMaster || isLeader,
        problem: canManage || isProcessEngineer || isMaster || isLeader,
        category: canManage || isProcessEngineer,
        lines: canManage || isProcessEngineer,
        assessment: canManage || isProcessEngineer || isMaster,
        // TODO assessment
        analysisNeed: canManage || isProcessEngineer || isMaster,
        analysisDone: canManage || isProcessEngineer || isMaster,
        analysers: canManage || isProcessEngineer || isMaster,
        why5: canManage || isProcessEngineer || isMaster || isLeader || isAnalyzer,
        solution: canManage || isProcessEngineer || isMaster || isLeader || isAnalyzer
      };
    },

    serializeChat: function()
    {
      var entry = this;
      var createdAt = entry.get('createdAt');
      var createdAtMoment = time.getMoment(createdAt);
      var owner = entry.get('owner');
      var self = owner.id === user.data._id;
      var chat = [{
        user: {
          id: owner.id,
          label: userInfoTemplate({userInfo: owner}),
          self
        },
        color: self ? 'transparent' : colorFactory.getColor('fap/users', owner.id),
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

      entry.get('attachments').forEach(a =>
      {
        if (a.user.id !== owner.id || a.date !== createdAt)
        {
          return;
        }

        var attachment = entry.serializeAttachment(a);

        chat[0].lines.push({
          time: chat[0].lines[0].time,
          text: '<span class="fap-chat-attachment" data-attachment-id="' + a._id + '">'
            + '<i class="fa ' + attachment.icon + '"></i><a>'
            + _.escape(attachment.label)
            + '</a></span>'
        });
      });

      entry.get('changes').forEach(function(change)
      {
        if (!change.user)
        {
          return;
        }

        var hasComment = !!change.comment;
        var hasAddedAttachments = !!change.data.attachments && !change.data.attachments.added.length;

        if (hasComment || hasAddedAttachments)
        {
          entry.serializeChatMessage(change, chat);
        }
      });

      return chat;
    },

    serializeChatMessage: function(change, chat)
    {
      var prev = chat && chat[chat.length - 1];
      var line = {
        time: time.format(change.date, 'dddd, LL LTS'),
        text: _.escape(change.comment)
      };

      if (prev && prev.user.id === change.user.id)
      {
        prev.lines.push(line);

        return prev;
      }

      var self = change.user.id === user.data._id;
      var message = {
        user: {
          id: change.user.id,
          label: userInfoTemplate({userInfo: change.user}),
          self: self
        },
        color: self ? 'transparent' : colorFactory.getColor('fap/users', change.user.id),
        lines: [line]
      };

      if (chat)
      {
        chat.push(message);
      }

      return message;
    },

    serializeObservers: function()
    {
      var entry = this;

      return entry.get('observers').map(function(observer)
      {
        var self = observer.user.id === user.data._id;

        return {
          _id: observer.user.id,
          label: userInfoTemplate({userInfo: observer.user, noIp: true}),
          color: self
            ? '#000'
            : colorFactory.getColor('fap/users', observer.user.id),
          lastSeenAt: observer.lastSeenAt ? Date.parse(observer.lastSeenAt) : 0,
          online: self || !!entry.attributes.presence[observer.user.id]
        };
      }).sort(function(a, b)
      {
        return b.lastSeenAt - a.lastSeenAt;
      });
    },

    serializeAttachment: function(attachment)
    {
      var type = attachment.type.split('/')[0];

      return {
        _id: attachment._id,
        icon: MIME_TO_ICON[attachment.type] || MIME_TO_ICON[type] || 'fa-file-o',
        preview: type === 'image',
        label: attachment.name
      };
    },

    canDelete: function()
    {
      return user.isAllowedTo(this.privilegePrefix + ':MANAGE');
    },

    change: function(prop, newValue, oldValue)
    {
      if (oldValue === undefined)
      {
        oldValue = this.get(prop);
      }

      var change = {
        date: new Date(),
        user: user.getInfo(),
        data: {},
        comment: ''
      };
      var update = {};

      change.data[prop] = [oldValue, newValue];
      update[prop] = newValue;

      this.handleChange(change);
      this.update(update);
    },

    update: function(data)
    {
      var entry = this;
      var req = $.ajax({
        method: 'PATCH',
        url: '/fap/entries/' + entry.id,
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

    handlePresence: function(userId, online)
    {
      var presence = this.attributes.presence;

      if (typeof presence[userId] === 'undefined')
      {
        presence[userId] = false;
      }

      if (presence[userId] === online)
      {
        return;
      }

      presence[userId] = online;

      this.trigger('change:presence', this, presence, {
        userId: userId,
        online: online
      });
      this.trigger('change', this, {});
    },

    handleChange: function(change)
    {
      var entry = this;

      Object.keys(change.data).forEach(function(prop)
      {
        var handler = entry.propChangeHandlers[prop];

        if (handler === 1)
        {
          entry.set(prop, change.data[prop][1]);
        }
        else if (handler)
        {
          handler.call(entry.propChangeHandlers, entry, change.data[prop], change);
        }
      });

      entry.set('changes', entry.get('changes').concat(change));
    },

    propChangeHandlers: {

      subscribers: function(entry, data)
      {
        var observers = entry.get('observers');

        if (data[0] === null)
        {
          this.addObservers(entry, observers, data[1]);
        }
        else if (data[1] === null)
        {
          this.removeObservers(entry, observers, data[0]);
        }
      },
      addObservers: function(entry, oldObservers, subscribers)
      {
        var observerMap = {};

        oldObservers.forEach(function(o) { observerMap[o.user.id] = true; });

        var newObservers = [].concat(oldObservers);

        subscribers.forEach(function(subscriber)
        {
          if (!observerMap[subscriber.id])
          {
            newObservers.push({
              user: subscriber
            });

            observerMap[subscriber.id] = true;
          }
        });

        entry.set('observers', newObservers);
      },
      removeObservers: function(entry, oldObservers, subscribers)
      {
        var subscriberMap = {};

        subscribers.forEach(function(s) { subscriberMap[s.id] = true; });

        entry.set('observers', oldObservers.filter(function(o) { return !subscriberMap[o.user.id]; }));
      },

      status: 1,
      problem: 1,
      category: 1

    }

  });
});
