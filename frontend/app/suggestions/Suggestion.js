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
  currentUser,
  Model,
  kaizenDictionaries,
  renderUserInfo
) {
  'use strict';

  var DATE_PROPERTIES = ['date', 'kaizenStartDate', 'kaizenFinishDate'];
  var TIME_PROPERTIES = ['createdAt', 'updatedAt', 'confirmedAt', 'finishedAt'];
  var USER_INFO_PROPERTIES = ['creator', 'updater', 'confirmer', 'superior'];
  var OWNER_PROPERTIES = ['suggestionOwners', 'kaizenOwners'];

  t = t.forDomain('suggestions');

  return Model.extend({

    urlRoot: '/suggestions',

    clientUrlRoot: '#suggestions',

    topicPrefix: 'suggestions',

    privilegePrefix: 'SUGGESTIONS',

    nlsDomain: 'suggestions',

    labelAttribute: 'rid',

    defaults: function()
    {
      return {
        status: 'new',
        date: new Date()
      };
    },

    initialize: function()
    {
      this.on('reset change', this.prepareUsers);

      this.prepareUsers();
    },

    serialize: function(options)
    {
      var longDateTime = options && options.longDateTime;
      var dateFormat = longDateTime ? 'LL' : 'L';
      var timeFormat = longDateTime ? 'LLL' : 'L, LTS';
      var obj = this.toJSON();

      obj.status = t(options && options.nlsDomain || 'suggestions', 'status:' + obj.status);
      obj.section = kaizenDictionaries.sections.getLabel(obj.section);
      obj.categories = (obj.categories || [])
        .map(function(c) { return kaizenDictionaries.categories.getLabel(c); })
        .join('; ');
      obj.productFamily = obj.kaizenEvent || kaizenDictionaries.productFamilies.getLabel(obj.productFamily) || '';

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
        obj[userInfoProperty] = renderUserInfo({userInfo: obj[userInfoProperty], noIp: true});
      });

      OWNER_PROPERTIES.forEach(function(ownerProperty)
      {
        obj[ownerProperty] = (obj[ownerProperty] || []).map(function(userInfo)
        {
          return userInfo.rendered;
        });
      });

      obj.coordSections = (obj.coordSections || []).map(function(coordSection)
      {
        var section = kaizenDictionaries.sections.get(coordSection._id);

        return _.defaults({
          name: section ? section.getLabel() : coordSection._id,
          user: coordSection.user ? renderUserInfo({userInfo: coordSection.user}) : '-',
          time: coordSection.time ? time.format(coordSection.time, 'LLLL') : '-',
          users: (coordSection.users || []).map(function(u) { return renderUserInfo({userInfo: u}); })
        }, coordSection);
      });

      if (!Array.isArray(obj.attachments))
      {
        obj.attachments = [];
      }

      return obj;
    },

    serializeRow: function(options)
    {
      var row = this.serialize(options);

      row.className = '';

      if (row.observer && row.observer.notify && _.isEmpty(row.observer.changes))
      {
        row.className += ' is-changed';
      }

      var owners = row.owners;

      if (owners)
      {
        row.owners = owners.length === 1
          ? owners[0].rendered
          : t(options && options.nlsDomain || 'suggestions', 'LIST:owners', {
            first: owners[0].rendered,
            count: owners.length - 1
          });
      }

      row.finishedAt = row.finishedAt ? time.format(this.get('finishedAt'), 'L') : '';

      switch (this.get('status'))
      {
        case 'finished':
          if (this.get('kom'))
          {
            row.className += ' warning';
            row.status += ' <i class="fa fa-trophy"></i>';
          }
          else
          {
            row.className += ' success';
          }
          break;

        case 'cancelled':
          row.className += ' danger';
          break;

        case 'inProgress':
          row.className += ' active';
          break;

        case 'accepted':
        case 'verification':
          row.className = ' info';
          break;
      }

      return row;
    },

    serializeDetails: function()
    {
      var suggestion = this;
      var Suggestion = this.constructor;
      var obj = this.serialize({longDateTime: true});

      obj.changed = obj.observer.changes || {};
      delete obj.changed.all;
      obj.changed.all = obj.observer.notify && _.isEmpty(obj.observer.changes);

      obj.coordSections.forEach(function(coordSection)
      {
        coordSection.canCoordinate = Suggestion.can.coordinateSection(suggestion, coordSection._id);
      });

      return obj;
    },

    getAttachmentKinds: function()
    {
      return ['before', 'after', 'other'];
    },

    getAttachmentUrl: function(attachment)
    {
      return `${this.urlRoot}/${this.id}/attachments/${attachment._id}/${attachment.file}?`;
    },

    isParticipant: function()
    {
      return this.attributes.observer && this.attributes.observer.role !== 'viewer';
    },

    isCreator: function()
    {
      return this.attributes.creator && this.attributes.creator.id === currentUser.data._id;
    },

    isConfirmer: function()
    {
      return this.attributes.confirmer && this.attributes.confirmer.id === currentUser.data._id;
    },

    isPossibleConfirmer: function()
    {
      var section = kaizenDictionaries.sections.get(this.get('section'));

      return !!section && section.get('confirmers').some(function(u) { return u.id === currentUser.data._id; });
    },

    isSuggestionOwner: function()
    {
      return _.some(this.get('suggestionOwners'), function(owner)
      {
        return owner.id === currentUser.data._id;
      });
    },

    isKaizenOwner: function()
    {
      return _.some(this.get('kaizenOwners'), function(owner)
      {
        return owner.id === currentUser.data._id;
      });
    },

    isOwner: function()
    {
      return this.isSuggestionOwner() || this.isKaizenOwner();
    },

    isCoordinator: function()
    {
      return _.some(this.get('coordSections'), function(coordSection)
      {
        return _.some(coordSection.users, function(coordinator)
        {
          return coordinator.id === currentUser.data._id;
        });
      });
    },

    isNotSeen: function()
    {
      return this.attributes.observer.notify;
    },

    canManage: function()
    {
      return currentUser.isAllowedTo(this.privilegePrefix + ':MANAGE');
    },

    canKom: function()
    {
      return this.get('status') === 'finished'
        && (this.canManage() || this.isConfirmer());
    },

    canCoordinate: function()
    {
      if (this.get('status') !== 'new')
      {
        return false;
      }

      if (this.canManage())
      {
        return true;
      }

      return this.isCoordinator();
    },

    canAccept: function()
    {
      if (this.get('status') !== 'accepted')
      {
        return false;
      }

      if (this.canManage())
      {
        return true;
      }

      return this.isConfirmer();
    },

    canComplete: function()
    {
      if (this.get('status') !== 'inProgress')
      {
        return false;
      }

      if (this.canManage())
      {
        return true;
      }

      return this.isConfirmer() || this.isKaizenOwner();
    },

    canVerify: function()
    {
      if (this.get('status') !== 'verification')
      {
        return false;
      }

      if (this.canManage())
      {
        return true;
      }

      return this.isConfirmer();
    },

    canEdit: function()
    {
      if (!currentUser.isLoggedIn())
      {
        return false;
      }

      if (this.canManage() || this.isConfirmer() || this.isPossibleConfirmer())
      {
        return true;
      }

      var status = this.get('status');

      if (status === 'finished' || status === 'cancelled')
      {
        return false;
      }

      return (status === 'new' || status === 'inProgress')
        && (this.isCreator() || this.isSuggestionOwner() || this.isKaizenOwner());
    },

    canDelete: function()
    {
      if (this.canManage())
      {
        return true;
      }

      return this.get('status') === 'new' && this.isCreator();
    },

    markAsSeen: function()
    {
      var observer = this.attributes.observer;

      if (!observer.notify)
      {
        return;
      }

      observer.lastSeenAt = new Date();
      observer.notify = false;
      observer.changes = {};

      var observers = this.attributes.observers;
      this.attributes.observers = null;

      this.set('observers', observers);
      this.trigger('seen');
    },

    prepareUsers: function()
    {
      if (this.attributes.observers)
      {
        this.prepareObserver();
      }

      if (this.attributes.suggestionOwners)
      {
        this.prepareOwners();
      }
    },

    prepareObserver: function()
    {
      var observers = this.get('observers') || [];
      var observer = _.find(observers, function(observer) { return observer.user.id === currentUser.data._id; });

      this.attributes.observer = observer || {
        user: {
          id: currentUser.data._id,
          label: currentUser.getLabel()
        },
        role: 'viewer',
        lastSeenAt: null,
        notify: false,
        changes: {}
      };

      if (observer && typeof observer.lastSeenAt === 'string')
      {
        observer.lastSeenAt = new Date(observer.lastSeenAt);
      }

      this.trigger('change:observer');
    },

    prepareOwners: function()
    {
      var attrs = this.attributes;
      var owners = {};

      OWNER_PROPERTIES.forEach(function(ownerProperty)
      {
        attrs[ownerProperty] = (attrs[ownerProperty] || []).map(function(userInfo)
        {
          userInfo.rendered = renderUserInfo({userInfo: userInfo});

          if (!owners[userInfo.id])
          {
            owners[userInfo.id] = userInfo;
          }

          return userInfo;
        });
      });

      attrs.owners = _.values(owners);

      this.trigger('change:owners');
    },

    getCoordSection: function(sectionId)
    {
      return this.get('coordSections').find(function(s) { return s._id === sectionId; });
    }

  }, {

    DATE_PROPERTIES: DATE_PROPERTIES,

    can: {

      manage: function()
      {
        return currentUser.isAllowedTo('SUGGESTIONS:MANAGE');
      },

      coordinate: function(model)
      {
        var can = this.can || this;

        return (model.get('coordSections') || []).some(function(coordSection)
        {
          return can.coordinateSection(model, coordSection._id);
        });
      },

      coordinateSection: function(model, sectionId)
      {
        if ((this.can || this).manage())
        {
          return true;
        }

        if (model.get('status') !== 'new')
        {
          return false;
        }

        var coordSection = model.getCoordSection(sectionId);

        if (!coordSection)
        {
          return false;
        }

        return coordSection.users.some(function(u) { return u.id === currentUser.data._id; });
      },

      editAttachment: function(model)
      {
        if ((this.can || this).manage())
        {
          return true;
        }

        if (model.get('status') === 'finished')
        {
          return false;
        }

        return model.isParticipant();
      },

      deleteAttachment: function(model, attachment)
      {
        if ((this.can || this).manage())
        {
          return true;
        }

        if (model.get('status') === 'finished')
        {
          return false;
        }

        if (model.isCoordinator())
        {
          return true;
        }

        return attachment.user.id === currentUser.data._id;
      }

    }

  });
});
