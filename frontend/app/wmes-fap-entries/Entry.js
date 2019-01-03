// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'autolinker',
  '../i18n',
  '../time',
  '../user',
  '../socket',
  '../core/Model',
  '../data/colorFactory',
  './dictionaries',
  'app/core/templates/userInfo'
], function(
  _,
  $,
  Autolinker,
  t,
  time,
  user,
  socket,
  Model,
  colorFactory,
  dictionaries,
  userInfoTemplate
) {
  'use strict';

  var AUTH_PROPS = {
    status: true,
    analysisNeed: true,
    analysisDone: true,
    analyzers: true
  };

  var STATUS_CLASS = {
    pending: 'danger',
    started: 'info',
    analyzing: 'warning',
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

  var AUTOLINKER = null;

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

      this.on('sync change', function()
      {
        this.serialized = null;
      });
    },

    isObserver: function()
    {
      return _.some(this.get('observers'), function(o) { return o.user.id === user.data._id; });
    },

    serialize: function()
    {
      if (this.serialized)
      {
        return this.serialized;
      }

      var obj = this.toJSON();

      obj.createdAt = time.format(obj.createdAt, 'L HH:mm');

      var category = dictionaries.categories.get(obj.category);

      if (category)
      {
        obj.category = category.getLabel();
      }

      obj.divisions = obj.divisions.join('; ');
      obj.lines = obj.lines.join('; ');

      obj.assessment = t(this.nlsDomain, 'assessment:' + obj.assessment);
      obj.analyzing = obj.status !== 'pending' && obj.analysisNeed && !obj.analysisDone;
      obj.analysisDone = obj.analysisNeed ? t('core', 'BOOL:' + obj.analysisDone) : '-';
      obj.analysisNeed = t('core', 'BOOL:' + obj.analysisNeed);

      if (!obj.orderNo)
      {
        obj.orderNo = '-';
        obj.nc12 = '-';
        obj.productName = '-';
        obj.mrp = '-';
        obj.qtyTodo = '-';
        obj.qtyDone = '-';
      }

      if (!obj.lines)
      {
        obj.lines = '-';
        obj.divisions = '-';
      }

      return this.serialized = obj;
    },

    serializeRow: function()
    {
      if (this.serialized)
      {
        return this.serialized;
      }

      var obj = this.serialize();

      obj.className = STATUS_CLASS[obj.analyzing ? 'analyzing' : obj.status];
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

      obj.auth = this.serializeAuth();
      obj.problem = obj.problem.trim().replace(/\n{3,}/, '\n\n');
      obj.solution = obj.solution.trim().replace(/\n{3,}/, '\n\n') || '-';
      obj.solutionSteps = obj.solutionSteps.trim().replace(/\n{3,}/, '\n\n') || '-';
      obj.multiline = {
        problem: obj.problem.indexOf('\n') !== -1,
        solution: obj.solution.indexOf('\n') !== -1,
        solutionSteps: obj.solutionSteps.indexOf('\n') !== -1
      };
      obj.mainAnalyzer = obj.analyzers.length ? obj.analyzers[0].label : '-';
      obj.analyzers = obj.analyzers.length > 1
        ? obj.analyzers.slice(1).map(function(u) { return u.label; }).join('; ')
        : '-';
      obj.chat = this.serializeChat();
      obj.attachments = obj.attachments.map(this.serializeAttachment, this);
      obj.observers = this.serializeObservers();
      obj.message = {
        type: '',
        text: ''
      };

      switch (obj.status)
      {
        case 'pending':
          obj.message.type = 'error';
          obj.message.text = t(this.nlsDomain, 'message:pending');
          break;

        case 'started':
          obj.message.type = obj.analyzing ? 'warning' : 'info';
          obj.message.text = t(this.nlsDomain, 'message:started:' + obj.analyzing);
          break;

        case 'finished':
          obj.message.type = obj.analyzing ? 'warning' : 'success';
          obj.message.text = t(this.nlsDomain, 'message:finished:' + obj.analyzing);
          break;
      }

      return this.serialized = obj;
    },

    serializeAuth: function()
    {
      var manage = user.isAllowedTo('FAP:MANAGE');
      var procEng = user.isAllowedTo('FN:process-engineer');
      var master = user.isAllowedTo('FN:master');
      var leader = user.isAllowedTo('FN:leader');
      var analyzers = this.get('analyzers');
      var analyzer = _.some(analyzers, function(u) { return user.data._id === u.id; });
      var mainAnalyzer = analyzer && analyzers[0].id === user.data._id;
      var status = this.get('status');
      var pending = status === 'pending';
      var started = status === 'started';
      var analysisNeed = this.get('analysisNeed');
      var analysisDone = this.get('analysisDone');
      var mainAnalyzerAuth = !pending && analysisNeed && !analysisDone && (manage || procEng || master);

      return {
        delete: this.canDelete(),
        restart: manage,
        status: manage || procEng || master || leader,
        solution: manage || procEng || master || leader,
        problem: started && (manage || procEng || master || leader),
        category: started && (manage || procEng),
        orderNo: started && (manage || procEng),
        lines: started && (manage || procEng),
        assessment: !pending && (manage || procEng || master),
        analysisNeed: !pending && (manage || procEng || master),
        analysisDone: !pending && analysisNeed && (manage || procEng || master),
        mainAnalyzer: mainAnalyzerAuth,
        analyzers: (analyzers.length || mainAnalyzerAuth)
          && !pending && analysisNeed && !analysisDone && (manage || procEng || master || mainAnalyzer),
        why5: !pending && analysisNeed && !analysisDone && (manage || procEng || master || leader || analyzer),
        solutionSteps: !pending && analysisNeed && !analysisDone && (manage || procEng || master || leader || analyzer)
      };
    },

    serializeChat: function()
    {
      var entry = this;
      var availableAttachments = {};

      entry.attributes.attachments.forEach(function(a)
      {
        availableAttachments[a._id] = true;
      });

      var createdAt = entry.get('createdAt');
      var createdAtMoment = time.getMoment(createdAt);
      var owner = entry.get('owner');
      var self = owner.id === user.data._id;
      var chat = [{
        user: {
          id: owner.id,
          label: userInfoTemplate({userInfo: owner}),
          self: self
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

      entry.get('changes').forEach(function(change)
      {
        if (!change.user)
        {
          return;
        }

        var hasComment = !!change.comment;
        var hasAttachmentsAdded = !!change.data.attachments
          && !change.data.attachments[0]
          && !!change.data.attachments[1];
        var hasStatusChanged = !!change.data.status;

        if (hasComment || hasAttachmentsAdded || hasStatusChanged)
        {
          entry.serializeChatMessage(change, chat, availableAttachments);
        }
      });

      return chat;
    },

    serializeChatMessage: function(change, chat, availableAttachments)
    {
      if (!AUTOLINKER)
      {
        AUTOLINKER = new Autolinker({
          urls: {
            schemeMatches: true,
            wwwMatches: true,
            tldMatches: true
          },
          email: true,
          phone: false,
          mention: false,
          hashtag: false,
          stripPrefix: true,
          stripTrailingSlash: true,
          newWindow: true,
          truncate: {
            length: 0,
            location: 'end'
          },
          className: '',
          replaceFn: function(match)
          {
            var url = match.getUrl();
            var tag = match.buildTag();

            if (match.getType() === 'url' && url.indexOf(window.location.host) !== -1)
            {
              var parts = tag.innerHTML.split('?');

              if (parts.length > 1 && parts[1].length)
              {
                tag.innerHTML = parts[0] + '?&hellip;';
              }

              delete tag.attrs.rel;
            }
            else if (tag.innerHTML.length >= 60)
            {
              tag.innerHTML = tag.innerHTML.substring(0, 50) + '&hellip;';
            }

            return tag;
          }
        });
      }

      var entry = this;
      var prev = chat && chat[chat.length - 1];
      var changeTime = time.format(change.date, 'dddd, LL LTS');
      var lines = [];

      if (change.comment)
      {
        lines.push({
          time: changeTime,
          text: AUTOLINKER.link(_.escape(change.comment))
        });
      }

      if (change.data.status)
      {
        lines.push({
          time: changeTime,
          text: t(this.nlsDomain, 'chat:status:' + change.data.status.join(':'))
        });
      }

      var attachments = change.data.attachments;

      if (attachments && !attachments[0] && attachments[1])
      {
        change.data.attachments[1].forEach(function(a)
        {
          if (availableAttachments && !availableAttachments[a._id])
          {
            return;
          }

          var attachment = entry.serializeAttachment(a);

          lines.push({
            time: changeTime,
            text: '<span class="fap-chat-attachment" data-attachment-id="' + a._id + '">'
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
          label: userInfoTemplate({userInfo: change.user}),
          self: self
        },
        color: self ? 'transparent' : colorFactory.getColor('fap/users', change.user.id),
        lines: lines
      };

      if (chat && message.lines.length)
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
        label: attachment.name,
        menu: user.isAllowedTo('FAP:MANAGE', 'FN:master', 'FN:leader', 'FN:process-engineer')
          || (attachment.user && attachment.user.id === user.data._id)
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

      if (!Object.keys(update).length)
      {
        return;
      }

      entry.handleChange(change);
      entry.update(update);
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

      if (this.serialized)
      {
        this.serialized.observers = this.serializeObservers();
      }
    },

    handleChange: function(change)
    {
      var entry = this;
      var data = {
        changes: entry.get('changes').concat(change)
      };

      Object.keys(change.data).forEach(function(prop)
      {
        var handler = entry.propChangeHandlers[prop];

        if (handler === 1)
        {
          data[prop] = change.data[prop][1];
        }
        else if (handler)
        {
          handler.call(entry.propChangeHandlers, data, entry, change.data[prop], change);
        }
      });

      entry.set(data);
    },

    propChangeHandlers: {

      subscribers: function(data, entry, subscribers)
      {
        var observers = entry.get('observers');

        if (subscribers[0] === null)
        {
          this.addObservers(data, entry, observers, subscribers[1]);
        }
        else if (subscribers[1] === null)
        {
          this.removeObservers(data, entry, observers, subscribers[0]);
        }
      },
      addObservers: function(data, entry, oldObservers, subscribers)
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

        data.observers = newObservers;
      },
      removeObservers: function(data, entry, oldObservers, subscribers)
      {
        var subscriberMap = {};

        subscribers.forEach(function(s) { subscriberMap[s.id] = true; });

        data.observers = oldObservers.filter(function(o) { return !subscriberMap[o.user.id]; });
      },

      attachments: function(data, entry, newAttachments)
      {
        var oldAttachments = entry.get('attachments');

        if (newAttachments[0] === null)
        {
          this.addAttachments(data, entry, oldAttachments, newAttachments[1]);
        }
        else if (newAttachments[1] === null)
        {
          this.removeAttachments(data, entry, oldAttachments, newAttachments[0]);
        }
        else
        {
          this.editAttachments(data, entry, oldAttachments, newAttachments[1]);
        }
      },
      addAttachments: function(data, entry, oldAttachments, addedAttachments)
      {
        var attachmentMap = {};

        oldAttachments.forEach(function(a) { attachmentMap[a._id] = true; });

        var newAttachments = [].concat(oldAttachments);

        addedAttachments.forEach(function(attachment)
        {
          if (!attachmentMap[attachment._id])
          {
            newAttachments.push(attachment);

            attachmentMap[attachment.id] = true;
          }
        });

        data.attachments = newAttachments;
      },
      removeAttachments: function(data, entry, oldAttachments, removedAttachments)
      {
        var attachmentMap = {};

        removedAttachments.forEach(function(a) { attachmentMap[a._id] = true; });

        data.attachments = oldAttachments.filter(function(a) { return !attachmentMap[a._id]; });
      },
      editAttachments: function(data, entry, oldAttachments, editedAttachments)
      {
        var attachmentMap = {};

        editedAttachments.forEach(function(a) { attachmentMap[a._id] = a; });

        data.attachments = oldAttachments.map(function(attachment)
        {
          return attachmentMap[attachment._id] || attachment;
        });
      },

      status: 1,
      problem: 1,
      solution: 1,
      category: 1,
      divisions: 1,
      lines: 1,
      why5: 1,
      solutionSteps: 1,
      assessment: 1,
      analysisNeed: 1,
      analysisDone: 1,
      orderNo: 1,
      mrp: 1,
      nc12: 1,
      productName: 1,
      qtyTodo: 1,
      qtyDone: 1,
      analyzers: 1

    }

  }, {

    AUTH_PROPS: AUTH_PROPS

  });
});
