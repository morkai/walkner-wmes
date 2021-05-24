// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'backbone'
], function(
  _,
  Backbone
) {
  'use strict';

  return Backbone.Model.extend({

    idAttribute: '_id',

    urlRoot: '/',

    clientUrlRoot: null,

    topicPrefix: null,

    privilegePrefix: null,

    nlsDomain: null,

    labelAttribute: null,

    genUrl: function(action, base)
    {
      var urlRoot = _.result(this, 'urlRoot');

      if (!urlRoot)
      {
        throw new Error("'urlRoot' was not specified!");
      }

      var url = urlRoot;

      if (action === 'base')
      {
        return url;
      }

      if (base !== true)
      {
        url += '/';

        if (this.isNew())
        {
          url += encodeURIComponent(this.cid);
        }
        else
        {
          url += encodeURIComponent(this.id);
        }
      }

      if (typeof action === 'string')
      {
        url += ';' + action;
      }

      return url;
    },

    genClientUrl: function(action)
    {
      var clientUrlRoot = _.result(this, 'clientUrlRoot');

      if (!clientUrlRoot)
      {
        throw new Error('`clientUrlRoot` was not specified');
      }

      var url = clientUrlRoot;

      if (action === 'base')
      {
        return url;
      }

      url += '/';

      if (this.isNew())
      {
        url += encodeURIComponent(this.cid);
      }
      else
      {
        url += encodeURIComponent(this.id);
      }

      if (typeof action === 'string')
      {
        url += ';' + action;
      }

      return url;
    },

    getTopicPrefix: function()
    {
      return this.topicPrefix;
    },

    getPrivilegePrefix: function()
    {
      return this.privilegePrefix;
    },

    getNlsDomain: function()
    {
      return this.nlsDomain || 'core';
    },

    getLabelAttribute: function()
    {
      return this.labelAttribute || this.idAttribute;
    },

    getLabel: function()
    {
      return String(this.get(this.getLabelAttribute()));
    },

    sync: function(method, model, options)
    {
      var read = method === 'read';

      if (read)
      {
        this.cancelCurrentReadRequest(model);
      }

      var req = Backbone.Model.prototype.sync.call(this, method, model, options);

      if (read)
      {
        this.setUpCurrentReadRequest(model, req);
      }

      return req;
    },

    cancelCurrentReadRequest: function(model)
    {
      if (model.currentReadRequest)
      {
        model.currentReadRequest.abort();
        model.currentReadRequest = null;
      }
    },

    setUpCurrentReadRequest: function(model, req)
    {
      req.always(function()
      {
        if (model.currentReadRequest === req)
        {
          model.currentReadRequest = null;
        }
      });

      model.currentReadRequest = req;
    },

    isSynced: function()
    {
      return this.currentReadRequest === null || (!!this.collection && !!this.collection.get(this));
    },

    findRqlTerm: function(prop, name)
    {
      if (!this.rqlQuery)
      {
        return null;
      }

      return _.find(this.rqlQuery.selector.args, function(term)
      {
        if (term.args[0] !== prop)
        {
          return false;
        }

        if (Array.isArray(name))
        {
          return name.indexOf(term.name) !== -1;
        }

        return !name || term.name === name;
      });
    }

  });
});
