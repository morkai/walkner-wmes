// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/core/Model',
  'app/data/orgUnits',
  'app/data/prodFunctions',
  'app/data/localStorage',
  'app/users/UserCollection'
], function(
  _,
  $,
  user,
  Model,
  orgUnits,
  prodFunctions,
  localStorage,
  UserCollection
) {
  'use strict';

  function resolved()
  {
    return $.Deferred().resolve().promise(); // eslint-disable-line new-cap
  }

  function rejected()
  {
    return $.Deferred().reject().promise(); // eslint-disable-line new-cap
  }

  return Model.extend({

    defaults: function()
    {
      return {
        users: [],
        settings: {},
        globalProdFunctions: [],
        sections: []
      };
    },

    initialize: function()
    {
      this.collapsedSections = JSON.parse(localStorage.getItem('MOR_COLLAPSED_SECTIONS') || '{}');

      this.users = new UserCollection(this.attributes.users, {paginate: false});

      this.on('reset change:users', function()
      {
        this.users.reset(this.attributes.users);
      });
    },

    url: function()
    {
      return '/mor';
    },

    subscribe: function(pubsub)
    {
      var mor = this;

      pubsub.subscribe('mor.updated', mor.onMorUpdated.bind(mor));
      pubsub.subscribe('users.added', mor.onUserEdited.bind(mor));
      pubsub.subscribe('users.edited', mor.onUserEdited.bind(mor));
      pubsub.subscribe('users.deleted', mor.onUserDeleted.bind(mor));
      pubsub.subscribe('users.presence.updated', mor.onPresenceUpdated.bind(mor));
      pubsub.subscribe('settings.updated.mor.**', mor.onSettingUpdated.bind(mor));
    },

    getSection: function(sectionId)
    {
      return _.findWhere(this.get('sections'), {_id: sectionId}) || null;
    },

    getWatch: function(sectionId, userId)
    {
      var section = this.getSection(sectionId);

      return section ? _.findWhere(section.watch, {user: userId}) : null;
    },

    getMrp: function(sectionId, mrpId)
    {
      var section = this.getSection(sectionId);

      return section ? _.findWhere(section.mrps, {_id: mrpId}) : null;
    },

    getUsers: function(sectionId, mrpId, prodFunctionId)
    {
      var prodFunctions;

      if (this.isGlobalProdFunction(prodFunctionId))
      {
        prodFunctions = this.get('globalProdFunctions');
      }
      else if (this.isCommonProdFunction(prodFunctionId))
      {
        prodFunctions = (this.getSection(sectionId) || {}).commonProdFunctions;
      }
      else
      {
        prodFunctions = (this.getMrp(sectionId, mrpId) || {}).prodFunctions;
      }

      var prodFunction = _.findWhere(prodFunctions, {_id: prodFunctionId});

      return prodFunction ? prodFunction.users : [];
    },

    toggleSection: function(id, collapsed)
    {
      if (!collapsed)
      {
        delete this.collapsedSections[id];
      }
      else
      {
        this.collapsedSections[id] = true;
      }

      localStorage.setItem('MOR_COLLAPSED_SECTIONS', JSON.stringify(this.collapsedSections));
    },

    isSectionCollapsed: function(sectionId)
    {
      return !!this.collapsedSections[sectionId];
    },

    isGlobalProdFunction: function(prodFunctionId)
    {
      return _.contains((this.get('settings') || {}).globalProdFunctions, prodFunctionId);
    },

    isCommonProdFunction: function(prodFunctionId)
    {
      return _.contains((this.get('settings') || {}).commonProdFunctions, prodFunctionId);
    },

    reload: function()
    {
      this.fetch();
    },

    act: function(action, params)
    {
      return $.ajax({
        method: 'POST',
        url: '/mor',
        data: JSON.stringify({
          instanceId: window.INSTANCE_ID,
          action: action,
          params: params
        })
      });
    },

    addSection: function(params, act)
    {
      var mor = this;
      var section = mor.getSection(params._id);

      if (section)
      {
        return resolved();
      }

      section = _.assign({}, params, {
        watch: [],
        commonProdFunctions: [],
        mrps: []
      });

      mor.attributes.sections.push(section);

      mor.trigger('update');

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('addSection', params)
        .fail(function()
        {
          mor.attributes.sections = _.without(mor.attributes.sections, section);

          mor.trigger('update');
        });
    },

    removeSection: function(params, act)
    {
      var mor = this;
      var section = mor.getSection(params.section);

      if (!section)
      {
        return resolved();
      }

      var old = [].concat(mor.attributes.sections);

      mor.attributes.sections = _.without(old, section);

      mor.trigger('update');

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('removeSection', params)
        .done(function()
        {
          delete mor.collapsedSections[section.id];
        })
        .fail(function()
        {
          mor.attributes.sections = old;

          mor.trigger('update');
        });
    },

    editSection: function(params, act)
    {
      var mor = this;
      var section = mor.getSection(params._id);

      if (!section)
      {
        return rejected();
      }

      var old = _.clone(section);

      _.assign(section, params);

      mor.trigger('update');

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('editSection', params)
        .fail(function()
        {
          _.assign(section, old);

          mor.trigger('update');
        });
    },

    moveSection: function(params, act)
    {
      var mor = this;
      var sourceSection = mor.getSection(params.source);
      var targetSection = mor.getSection(params.target);

      if (sourceSection === targetSection)
      {
        return resolved();
      }

      if (!sourceSection || !targetSection)
      {
        return rejected();
      }

      var sections = mor.get('sections');
      var old = [].concat(sections);

      sections.splice(sections.indexOf(sourceSection), 1);
      sections.splice(sections.indexOf(targetSection) + (params.position === 'after' ? 1 : 0), 0, sourceSection);

      mor.trigger('update');

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('moveSection', params)
        .fail(function()
        {
          mor.attributes.sections = old;

          mor.trigger('update');
        });
    },

    addWatch: function(params, act)
    {
      var mor = this;
      var watch = mor.getWatch(params.section, params.user);

      if (watch)
      {
        return resolved();
      }

      var section = mor.getSection(params.section);

      if (!section)
      {
        return rejected();
      }

      watch = _.pick(params, ['user', 'days', 'from', 'to']);

      section.watch.push(watch);

      mor.trigger('update');

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('addWatch', params)
        .fail(function()
        {
          section.watch = _.without(section.watch, watch);

          mor.trigger('update');
        });
    },

    removeWatch: function(params, act)
    {
      var mor = this;
      var watch = mor.getWatch(params.section, params.user);

      if (!watch)
      {
        return resolved();
      }

      var section = mor.getSection(params.section);

      section.watch = _.without(section.watch, watch);

      mor.trigger('update');

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('removeWatch', params)
        .fail(function()
        {
          section.watch.push(watch);

          mor.trigger('update');
        });
    },

    editWatch: function(params, act)
    {
      var mor = this;
      var watch = mor.getWatch(params.section, params.user);

      if (!watch)
      {
        return rejected();
      }

      var oldWatch = _.clone(watch);

      _.assign(watch, _.pick(params, ['user', 'days', 'from', 'to']));

      mor.trigger('update');

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('editWatch', params)
        .fail(function()
        {
          _.assign(watch, oldWatch);

          mor.trigger('update');
        });
    },

    addMrp: function(params, act)
    {
      var mor = this;
      var section = mor.getSection(params.section);

      if (!section)
      {
        return rejected();
      }

      var mrp = _.findWhere(section.mrps, {_id: params.mrp});

      if (mrp)
      {
        return rejected();
      }

      mrp = {
        _id: params.mrp,
        description: '',
        iptCheck: false,
        iptCheckRecipients: [],
        prodFunctions: []
      };

      _.assign(mrp, _.pick(params, ['description', 'iptCheck']), {
        iptCheckRecipients: _.pluck(params.iptCheckRecipients, '_id')
      });

      mor.users.add(params.iptCheckRecipients);

      section.mrps.push(mrp);

      mor.trigger('update');

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('addMrp', _.assign({}, params, {iptCheckRecipients: _.pluck(params.iptCheckRecipients, '_id')}))
        .fail(function()
        {
          section.mrps = _.without(section.mrps, mrp);

          mor.trigger('update');
        });
    },

    removeMrp: function(params, act)
    {
      var mor = this;
      var section = mor.getSection(params.section);

      if (!section)
      {
        return resolved();
      }

      var mrp = _.findWhere(section.mrps, {_id: params.mrp});

      if (!mrp)
      {
        return resolved();
      }

      section.mrps = _.without(section.mrps, mrp);

      mor.trigger('update');

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('removeMrp', params)
        .fail(function()
        {
          section.mrps.push(mrp);

          mor.trigger('update');
        });
    },

    editMrp: function(params, act)
    {
      var mor = this;
      var section = mor.getSection(params.section);

      if (!section)
      {
        return rejected();
      }

      var mrp = _.findWhere(section.mrps, {_id: params.mrp});

      if (!mrp)
      {
        return rejected();
      }

      var old = _.clone(mrp);

      _.assign(mrp, _.pick(params, ['description', 'iptCheck']), {
        iptCheckRecipients: _.pluck(params.iptCheckRecipients, '_id')
      });

      mor.users.add(params.iptCheckRecipients);

      mor.trigger('update');

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('editMrp', _.assign({}, params, {iptCheckRecipients: _.pluck(params.iptCheckRecipients, '_id')}))
        .fail(function()
        {
          _.assign(mrp, old);

          mor.trigger('update');
        });
    },

    editProdFunction: function(params, act)
    {
      var mor = this;
      var prodFunctions;

      if (mor.isGlobalProdFunction(params.prodFunction))
      {
        params.section = null;
        params.mrp = null;

        prodFunctions = this.get('globalProdFunctions');
      }
      else if (mor.isCommonProdFunction(params.prodFunction))
      {
        params.mrp = null;

        var section = this.getSection(params.section);

        if (!section)
        {
          return rejected();
        }

        prodFunctions = section.commonProdFunctions;
      }
      else
      {
        var mrp = mor.getMrp(params.section, params.mrp);

        if (!mrp)
        {
          return rejected();
        }

        prodFunctions = mrp.prodFunctions;
      }

      var prodFunction = _.findWhere(prodFunctions, {_id: params.prodFunction});

      if (!prodFunction)
      {
        prodFunction = {
          _id: params.prodFunction,
          users: []
        };

        prodFunctions.push(prodFunction);
      }

      var old = [].concat(prodFunction.users);

      prodFunction.users = params.users.map(function(u) { return u._id; });

      mor.users.add(params.users);

      mor.trigger('update');

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('editProdFunction', _.assign({}, params, {users: prodFunction.users}))
        .fail(function()
        {
          prodFunction.users = old;

          mor.trigger('update');
        });
    },

    onMorUpdated: function(message)
    {
      if (this[message.action] && message.instanceId !== window.INSTANCE_ID)
      {
        this[message.action](message.params, false);
      }
    },

    onUserEdited: function(message)
    {
      var user = this.users.get(message.model._id);

      if (user)
      {
        user.set(message.model);

        this.trigger('update');
      }

      if (message.model.prodFunction === 'manager')
      {
        this.reload();
      }
    },

    onUserDeleted: function(message)
    {
      var user = this.users.get(message.model._id);

      if (user)
      {
        this.users.remove(user);

        this.trigger('update');
      }

      if (message.model.prodFunction === 'manager')
      {
        this.reload();
      }
    },

    onPresenceUpdated: function(changes)
    {
      var users = this.users;
      var eventData = {};

      _.forEach(changes, function(presence, userId)
      {
        var user = users.get(userId);

        if (user)
        {
          user.attributes.presence = presence;
          eventData[userId] = presence;
        }
      });

      this.trigger('update:presence', eventData);
    },

    onSettingUpdated: function(message)
    {
      this.attributes.settings[message._id.replace('mor.', '')] = message.value;

      this.trigger('update');
    }

  });
});
