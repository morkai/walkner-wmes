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
  'app/core/templates/userInfo',
  'app/wmes-fap-entries/templates/levelIndicator'
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
  userInfoTemplate,
  levelIndicatorTemplate
) {
  'use strict';

  var SUBDIVISION_TYPES = [
    'assembly',
    'press',
    'wh'
  ];

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

  var AUTOLINK_ID_RE = /(.)??(#[0-9]+|[0-9]{15}|[0-9]{12}|[0-9]{9}|[A-Z]{3}[0-9]{3}[A-Z]{1})(.)??/g;
  var autolinker = null;

  function autolink(text)
  {
    if (!autolinker)
    {
      autolinker = new Autolinker({
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

    return autolinker.link(text);
  }

  return Model.extend({

    urlRoot: '/fap/entries',

    clientUrlRoot: '#fap/entries',

    topicPrefix: 'fap.entries',

    privilegePrefix: 'FAP',

    nlsDomain: 'wmes-fap-entries',

    labelAttribute: 'rid',

    defaults: function()
    {
      return {
        subdivisionType: 'assembly'
      };
    },

    initialize: function()
    {
      this.serialized = null;

      this.on('change', function()
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

      var subCategory = dictionaries.subCategories.get(obj.subCategory);

      if (subCategory)
      {
        obj.subCategory = subCategory.getLabel();
      }

      if (!obj.subCategory)
      {
        obj.subCategory = '-';
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

      obj.subdivisionType = t(this.nlsDomain, 'subdivisionType:' + obj.subdivisionType);

      if (!obj.componentCode)
      {
        obj.componentCode = '-';
        obj.componentName = '-';
      }

      obj.observer = this.serializeObserver();

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

      if (obj.observer.changes.any)
      {
        obj.className += ' fap-is-unseen';
      }

      var category = obj.category;

      if (obj.subCategory !== '-')
      {
        category = obj.subCategory;
      }

      obj.category = '<span class="fap-list-category">' + _.escape(category) + '</span>';
      obj.problem = '<span class="fap-list-problem">' + _.escape(obj.problem) + '</span>';
      obj.lines = '<span class="fap-list-lines">' + _.escape(obj.lines) + '</span>';

      if (obj.componentCode !== '-')
      {
        obj.nc12 = obj.componentCode;
        obj.productName = obj.componentName;
      }

      obj.levelIndicator = levelIndicatorTemplate({
        level: obj.level,
        canIncrease: false,
        canManage: false
      });

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
      obj.problem = this.serializeText(obj.problem.trim().replace(/\n{3,}/, '\n\n'));
      obj.solution = this.serializeText(obj.solution.trim().replace(/\n{3,}/, '\n\n') || '-');
      obj.solver = obj.solver ? obj.solver.label : '';
      obj.solutionSteps = this.serializeText(obj.solutionSteps.trim().replace(/\n{3,}/, '\n\n') || '-');
      obj.empty = {
        solution: obj.solution === '-'
      };
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

      obj.levelIndicator = levelIndicatorTemplate({
        level: obj.level,
        canIncrease: obj.auth.level,
        canManage: obj.auth.manage
      });

      return this.serialized = obj;
    },

    serializeAuth: function()
    {
      var loggedIn = user.isLoggedIn();
      var manage = user.isAllowedTo('FAP:MANAGE');
      var manager = user.isAllowedTo('FN:manager');
      var procEng = user.isAllowedTo('FN:process-engineer', 'FN:process-engineer-NPI');
      var qualityEng = user.isAllowedTo('FN:quality_engineer');
      var designer = user.isAllowedTo('FN:designer', 'FN:designer_eto');
      var master = user.isAllowedTo('FN:master');
      var leader = user.isAllowedTo('FN:leader');
      var whman = user.isAllowedTo('FN:whman', 'FN:prod_whman', 'FN:in_whman');
      var analyzers = this.get('analyzers');
      var analyzer = _.some(analyzers, function(u) { return user.data._id === u.id; });
      var mainAnalyzer = analyzer && analyzers[0].id === user.data._id;
      var subdivisionType = this.get('subdivisionType');
      var wh = subdivisionType === 'wh';
      var status = this.get('status');
      var pending = status === 'pending';
      var started = status === 'started';
      var finished = status === 'finished';
      var analysisNeed = this.get('analysisNeed');
      var analysisDone = this.get('analysisDone');
      var mainAnalyzerAuth = !pending && analysisNeed && !analysisDone && (manage || procEng || master);
      var solver = manage || procEng || designer || master || leader || (wh && whman);

      return {
        delete: this.canDelete(),
        manage: manage,
        comment: loggedIn,
        attachments: loggedIn,
        observers: loggedIn,
        restart: manage,
        status: solver,
        level: !finished && (solver || manager || whman),
        solution: solver,
        problem: started && (manage || procEng || designer || master || leader),
        category: manage || procEng || qualityEng || designer,
        subCategory: manage || procEng || qualityEng || designer,
        subdivisionType: manage || procEng || designer || master || leader,
        componentCode: started && (manage || procEng),
        orderNo: started && (manage || procEng),
        lines: started && (manage || procEng),
        assessment: !pending && (manage || procEng || master),
        analysisNeed: !pending && (manage || procEng || master),
        analysisDone: !pending && analysisNeed && (manage || procEng || master),
        mainAnalyzer: mainAnalyzerAuth,
        analyzers: (analyzers.length || mainAnalyzerAuth)
          && !pending && analysisNeed && !analysisDone
          && (manage || procEng || master || mainAnalyzer),
        why5: !pending && analysisNeed && !analysisDone
          && (manage || procEng || master || leader || analyzer),
        solutionSteps: !pending && analysisNeed && !analysisDone
          && (manage || procEng || master || leader || analyzer)
      };
    },

    serializeObserver: function()
    {
      var observer = _.assign({
        user: user.getInfo(),
        role: 'viewer',
        func: user.data.prodFunction || null,
        lastSeenAt: Date.now(),
        notify: false,
        changes: {}
      }, _.find(this.get('observers'), function(o) { return o.user.id === user.data._id; }));

      observer.lastSeenAt = Date.parse(observer.lastSeenAt || 0);

      var any = Object.keys(observer.changes).length > 0;

      observer.changes.any = observer.notify || any;
      observer.changes.all = observer.notify && !any;

      return observer;
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
          label: userInfoTemplate({userInfo: owner, noIp: true}),
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
        var hasAnalysisChanged = !!change.data.analysisNeed || !!change.data.analysisDone;
        var hasLevelChanged = !!change.data.level;

        if (hasComment
          || hasAttachmentsAdded
          || hasStatusChanged
          || hasAnalysisChanged
          || hasLevelChanged)
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
      var duration;

      if (change.comment)
      {
        var text = this.serializeText(change.comment);

        lines.push({
          time: longTime,
          text: shortTime + '<span class="fap-chat-line-text">' + text + '</span>'
        });
      }

      if (change.data.status)
      {
        duration = '?';

        if (change.data.status[1] === 'finished')
        {
          duration = Date.parse(change.date) - Date.parse(this.get('createdAt'));
          duration = duration > 0 ? time.toString(duration / 1000) : '?';
        }

        lines.push({
          time: longTime,
          text: t(this.nlsDomain, 'chat:status:' + change.data.status.join(':'), {
            duration: duration
          })
        });
      }

      if (change.data.analysisNeed && change.data.analysisNeed[1])
      {
        lines.push({
          time: longTime,
          text: t(this.nlsDomain, 'chat:analysis:started')
        });
      }

      if (change.data.analysisDone && change.data.analysisDone[1])
      {
        duration = Date.parse(change.date) - Date.parse(this.get('analysisStartedAt'));

        if (duration > 0)
        {
          duration = time.toString(duration / 1000);
        }
        else
        {
          duration = '?';
        }

        lines.push({
          time: longTime,
          text: t(this.nlsDomain, 'chat:analysis:finished', {
            duration: duration
          })
        });
      }

      if (change.data.level)
      {
        var escalation = change.data.level[1] > change.data.level[0] ? 'up' : 'down';

        lines.push({
          time: longTime,
          text: t(this.nlsDomain, 'chat:level:' + escalation, {
            level: change.data.level[1]
          })
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
            text: '<span class="fap-chat-attachment" title="' + title + '" data-attachment-id="' + a._id + '">'
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
        color: self ? 'transparent' : colorFactory.getColor('fap/users', change.user.id),
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
      var nlsDomain = this.nlsDomain;

      text = autolink(_.escape(text))
        .replace(/👤/g, '<i class="fa fa-user"></i>');

      text = text.replace(AUTOLINK_ID_RE, function(match, prefix, id, suffix)
      {
        var type;

        if (prefix === '/')
        {
          return match;
        }

        if (prefix === undefined)
        {
          prefix = '';
        }

        if (suffix === undefined)
        {
          suffix = '';
        }

        id = id.replace(/^0+/, '');

        if (/^#[0-9]+$/.test(id) && id.length < 9)
        {
          type = 'entry';
          id = id.substring(1);
          prefix += '#';
        }
        else if (id.length === 15)
        {
          type = 'document';
        }
        else if (id.length === 9)
        {
          type = 'order';
        }
        else
        {
          type = 'product';
        }

        if (!type)
        {
          return match;
        }

        return prefix
          + '<a href="javascript:void(0)" class="fap-autolink"'
          + ' title="' + t(nlsDomain, 'autolink:' + type) + '"'
          + ' data-type="' + type + '"'
          + ' data-id="' + id.toUpperCase() + '">'
          + id + '</a>' + suffix;
      });

      return text;
    },

    serializeObservers: function()
    {
      var entry = this;
      var canManage = user.isAllowedTo('FAP:MANAGE');

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
          online: self || !!entry.attributes.presence[observer.user.id],
          canUnsubscribe: self || canManage
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
        menu: user.isAllowedTo('FAP:MANAGE', 'FN:master', 'FN:leader', 'FN:process-engineer', 'FN:process-engineer-NPI')
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

      if (user.isLoggedIn() && !this.isObserver())
      {
        if (!change.data.subscribers)
        {
          change.data.subscribers = [null, []];
        }

        if (!change.data.subscribers[0])
        {
          change.data.subscribers[1].push({
            id: user.data._id,
            label: user.getLabel()
          });
        }
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
      var presence = this.attributes.presence || {};

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

    handleChange: function(change, notify)
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
        var propData = change.data[prop];
        var handler = entry.propChangeHandlers[propName];

        if (handler === 1)
        {
          data[propName] = propData[1];
        }
        else if (handler)
        {
          handler.call(entry.propChangeHandlers, data, entry, propData, change);
        }
      });

      var observers = data.observers || [].concat(entry.get('observers'));
      var observerIndex = _.findIndex(observers, function(o)
      {
        if (!o.user && window.WMES_LOG_BROWSER_ERROR)
        {
          window.WMES_LOG_BROWSER_ERROR(new Error('Invalid observer: ' + JSON.stringify({ // eslint-disable-line new-cap
            change: change,
            observer: o
          })));
        }

        return !!o.user && o.user.id === user.data._id;
      });

      if (observerIndex !== -1)
      {
        var observer = observers[observerIndex];

        if (change.user.id === user.data._id)
        {
          observers[observerIndex] = _.defaults({
            lastSeenAt: change.date,
            notify: false,
            changes: {}
          }, observer);

          data.observers = observers;
        }
        else if (notify && notify[user.data._id])
        {
          observers[observerIndex] = _.defaults({
            lastSeenAt: change.date,
            notify: true,
            changes: notify[user.data._id]
          }, observer);

          data.observers = observers;
        }
      }

      entry.set(data);
    },

    propChangeHandlers: {

      subscribers: function(data, entry, subscribers)
      {
        var observers = data.observers || entry.get('observers');

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
              lastSeenAt: new Date(),
              notify: false,
              changes: {},
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

      unsubscribed: function(data, entry, propData, change)
      {
        var unsubscribed = _.clone(entry.get('unsubscribed'));

        if (propData[1])
        {
          unsubscribed[change.user.id] = true;
        }
        else
        {
          delete unsubscribed[change.user.id];
        }

        data.unsubscribed = unsubscribed;
      },

      status: 1,
      level: 1,
      startedAt: 1,
      finishedAt: 1,
      problem: 1,
      solution: 1,
      solver: 1,
      category: 1,
      subCategory: 1,
      divisions: 1,
      lines: 1,
      why5: 1,
      solutionSteps: 1,
      assessment: 1,
      analysisNeed: 1,
      analysisDone: 1,
      analysisStartedAt: 1,
      analysisFinishedAt: 1,
      orderNo: 1,
      mrp: 1,
      nc12: 1,
      productName: 1,
      qtyTodo: 1,
      qtyDone: 1,
      analyzers: 1,
      subdivisionType: 1,
      componentCode: 1,
      componentName: 1

    }

  }, {

    SUBDIVISION_TYPES: SUBDIVISION_TYPES,
    AUTH_PROPS: AUTH_PROPS

  });
});
