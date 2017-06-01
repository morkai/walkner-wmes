// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/user',
  'app/core/Model',
  'app/data/orgUnits',
  'app/data/prodFunctions',
  'app/users/UserCollection'
], function(
  _,
  $,
  user,
  Model,
  orgUnits,
  prodFunctions,
  UserCollection
) {
  'use strict';

  function resolved()
  {
    return $.Deferred().resolve().promise();
  }

  return Model.extend({

    initialize: function()
    {
      this.collapsedSections = JSON.parse(localStorage.MOR_COLLAPSED_SECTIONS || '{}');

      this.users = new UserCollection(this.attributes.users, {paginate: false});

      this.on('change:users', function()
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
      pubsub.subscribe('mor.updated', this.onMorUpdated.bind(this));
      pubsub.subscribe('users.edited', this.onUserEdited.bind(this));
      pubsub.subscribe('users.deleted', this.onUserDeleted.bind(this));
      pubsub.subscribe('settings.updated.mor.**', this.onSettingUpdated.bind(this));
    },

    getDivision: function(divisionId)
    {
      return _.findWhere(this.get('divisions'), {_id: divisionId}) || null;
    },

    getMrp: function(divisionId, mrpId)
    {
      var division = this.getDivision(divisionId);

      return division ? _.findWhere(division.mrps, {_id: mrpId}) : null;
    },

    getUsers: function(divisionId, mrpId, prodFunctionId)
    {
      var mrp = this.getMrp(divisionId, mrpId);

      if (!mrp)
      {
        return [];
      }

      var prodFunction = _.findWhere(mrp.prodFunctions, {_id: prodFunctionId});

      return prodFunction ? prodFunction.users : [];
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

    addWatch: function(params, act)
    {
      var mor = this;
      var watchUser = _.findWhere(mor.get('watch'), {user: params.user});

      if (watchUser)
      {
        return resolved();
      }

      mor.set('watch', [params].concat(mor.get('watch')));

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('addWatch', params)
        .fail(function()
        {
          mor.set('watch', _.without(mor.get('watch'), params));
        });
    },

    removeWatch: function(params, act)
    {
      var mor = this;
      var watchUser = _.findWhere(mor.get('watch'), {user: params.user});

      if (!watchUser)
      {
        return resolved();
      }

      mor.set('watch', _.without(mor.get('watch'), watchUser));

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('removeWatch', params)
        .fail(function()
        {
          mor.set('watch', [watchUser].concat(mor.get('watch')));
        });
    },

    editWatch: function(params, act)
    {
      var mor = this;
      var watchUser = _.findWhere(mor.get('watch'), {user: params.user});

      if (!watchUser)
      {
        return resolved();
      }

      var oldWatchUser = _.clone(watchUser);

      _.assign(watchUser, params);

      mor.trigger('change:watch', mor, mor.get('watch'), {});
      mor.trigger('change', mor, {});

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('editWatch', params)
        .fail(function()
        {
          _.assign(watchUser, oldWatchUser);

          mor.trigger('change:watch', mor, mor.get('watch'), {});
          mor.trigger('change', mor, {});
        });
    },

    addMrp: function(params, act)
    {
      var mor = this;
      var divisions = mor.get('divisions');
      var division = _.findWhere(divisions, {_id: params.division});

      if (!division)
      {
        return resolved();
      }

      var mrp = _.findWhere(division.mrps, {_id: params.mrp});

      if (mrp)
      {
        return resolved();
      }

      mrp = {
        _id: params.mrp,
        prodFunctions: []
      };

      division.mrps.push(mrp);

      mor.trigger('change:divisions', mor, divisions, {});
      mor.trigger('change', mor, {});

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('addMrp', params)
        .fail(function()
        {
          division.mrps = _.without(division.mrps, mrp);

          mor.trigger('change:divisions', mor, divisions, {});
          mor.trigger('change', mor, {});
        });
    },

    removeMrp: function(params, act)
    {
      var mor = this;
      var divisions = mor.get('divisions');
      var division = _.findWhere(divisions, {_id: params.division});

      if (!division)
      {
        return resolved();
      }

      var mrp = _.findWhere(division.mrps, {_id: params.mrp});

      if (!mrp)
      {
        return resolved();
      }

      division.mrps = _.without(division.mrps, mrp);

      mor.trigger('change:divisions', mor, divisions, {});
      mor.trigger('change', mor, {});

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('removeMrp', params)
        .fail(function()
        {
          division.mrps.push(mrp);

          mor.trigger('change:divisions', mor, divisions, {});
          mor.trigger('change', mor, {});
        });
    },

    editMrp: function(params, act)
    {
      var mor = this;
      var divisions = mor.get('divisions');
      var division = _.findWhere(divisions, {_id: params.division});

      if (!division)
      {
        return resolved();
      }

      var mrp = _.findWhere(division.mrps, {_id: params.mrp});

      if (!mrp)
      {
        if (params.mrp === null)
        {
          mrp = {
            _id: null,
            prodFunctions: []
          };

          division.mrps.push(mrp);
        }
        else
        {
          return resolved();
        }
      }

      var prodFunction = _.findWhere(mrp.prodFunctions, {_id: params.prodFunction});
      var oldUsers = [];

      if (prodFunction)
      {
        oldUsers = prodFunction.users;
      }
      else
      {
        prodFunction = {
          _id: params.prodFunction,
          users: []
        };

        mrp.prodFunctions.push(prodFunction);
      }

      this.users.add(params.users);

      prodFunction.users = params.users.map(function(user) { return user._id; });

      mor.trigger('change:divisions', mor, divisions, {});
      mor.trigger('change', mor, {});

      if (act === false)
      {
        return resolved();
      }

      return mor
        .act('editMrp', _.assign({}, params, {users: prodFunction.users}))
        .fail(function()
        {
          prodFunction.users = oldUsers;

          mor.trigger('change:divisions', mor, divisions, {});
          mor.trigger('change', mor, {});
        });
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

      localStorage.MOR_COLLAPSED_SECTIONS = JSON.stringify(this.collapsedSections);
    },

    serializeProdFunctions: function()
    {
      var settings = this.get('settings') || {};
      var allProdFunctions = settings.prodFunctions || [];
      var commonProdFunctions = settings.commonProdFunctions || [];
      var orderedProdFunctions = settings.orderedProdFunctions || [];

      return _.map(allProdFunctions, function(prodFunctionId)
      {
        var prodFunction = prodFunctions.get(prodFunctionId);

        return {
          _id: prodFunction ? prodFunction.id : prodFunctionId,
          label: prodFunction ? prodFunction.getLabel() : prodFunctionId,
          common: _.contains(commonProdFunctions, prodFunctionId),
          ordered: _.contains(orderedProdFunctions, prodFunctionId)
        };
      });
    },

    serializeWatch: function()
    {
      return (this.get('watch') || [])
        .map(this.serializeWatchUser, this)
        .filter(function(user) { return !!user; })
        .sort(function(a, b)
        {
          var cmp = a.prodFunction.localeCompare(b.prodFunction);

          return cmp === 0 ? a.label.localeCompare(b.label) : cmp;
        });
    },

    serializeWatchUser: function(watch)
    {
      var user = this.users.get(watch.user);

      if (!user)
      {
        return null;
      }

      var prodFunction = user ? prodFunctions.get(user.get('prodFunction')) : null;

      return {
        _id: user.id,
        label: user.getLabel(),
        prodFunction: prodFunction ? prodFunction.getLabel() : '?',
        email: user.get('email') || '?',
        mobile: user.getMobile() || '?',
        available: !!user.get('working'),
        availability: watch.from && watch.to ? (watch.from + '-' + watch.to) : ''
      };
    },

    serializeDivisions: function()
    {
      return orgUnits.getAllByType('division')
        .filter(function(division) { return division.get('type') === 'prod' && division.isActive(); })
        .map(function(division) { return this.serializeDivision(division.id); }, this)
        .filter(function(division) { return !!division; })
        .sort(function(a, b) { return a._id.localeCompare(b._id); });
    },

    serializeDivision: function(divisionId)
    {
      var division = orgUnits.getByTypeAndId('division', divisionId);

      if (!division)
      {
        return null;
      }

      var morDivision = _.find(this.get('divisions'), function(d) { return d._id === division.id; }) || {};
      var manager = this.users.find(function(user)
      {
        return user.get('prodFunction') === 'manager' && user.get('orgUnitId') === division.id;
      });
      var commonProdFunctions = {};
      var mrps = (morDivision.mrps || [])
        .map(this.serializeMrp, this)
        .filter(function(mrp)
        {
          if (mrp._id === null)
          {
            commonProdFunctions = mrp.users;
          }

          return mrp._id !== null;
        })
        .sort(function(a, b) { return a._id.localeCompare(b._id); });

      return {
        _id: division.id,
        collapsed: !!this.collapsedSections[division.id],
        label: division.get('description'),
        manager: this.serializeUser(manager),
        canManage: manager && user.data._id === manager.id,
        commonProdFunctions: commonProdFunctions,
        mrps: mrps
      };
    },

    serializeUser: function(userId, i)
    {
      var user = this.users.get(userId);

      if (!user)
      {
        return null;
      }

      var prodFunction = user ? prodFunctions.get(user.get('prodFunction')) : null;

      return {
        _id: user.id,
        no: i + 1,
        label: user.getLabel(),
        prodFunction: prodFunction ? prodFunction.getLabel() : '?',
        email: user.get('email') || '?',
        mobile: user.getMobile() || '?',
        available: !!user.get('working')
      };
    },

    serializeMrp: function(morMrp)
    {
      var mor = this;
      var common = morMrp._id === null;
      var mrp = orgUnits.getByTypeAndId('mrpController', morMrp._id);
      var mrpUsers = {};

      morMrp.prodFunctions.forEach(function(morProdFunction)
      {
        mrpUsers[morProdFunction._id] = morProdFunction.users.map(mor.serializeUser, mor);

        if (common)
        {
          mrpUsers[morProdFunction._id].sort(function(a, b)
          {
            return a.label.localeCompare(b.label);
          });
        }
      });

      return {
        _id: morMrp._id,
        label: mrp ? mrp.get('description') : '',
        users: mrpUsers
      };
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

        this.trigger('change:users', this, this.users.toJSON(), {});
        this.trigger('change', this, {});
      }
    },

    onUserDeleted: function(message)
    {
      var user = this.users.get(message.model._id);

      if (user)
      {
        this.users.remove(user);

        this.trigger('change:users', this, this.users.toJSON(), {});
        this.trigger('change', this, {});
      }
    },

    onSettingUpdated: function(message)
    {
      var settings = _.clone(this.get('settings'));

      settings[message._id.replace('mor.', '')] = message.value;

      this.set('settings', settings);
    }

  });
});
