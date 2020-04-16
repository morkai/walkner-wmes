// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'backbone',
  'h5.rql/index',
  './util',
  './PaginationData',
  './Model'
], function(
  _,
  Backbone,
  rql,
  util,
  PaginationData,
  Model
) {
  'use strict';

  function Collection(models, options)
  {
    if (!_.isObject(options))
    {
      options = {};
    }

    this.rqlQuery = this.createRqlQuery(options.rqlQuery || this.rqlQuery);

    if (this.rqlQuery.limit === -1337)
    {
      this.rqlQuery.limit = this.getDefaultPageLimit();
    }

    this.paginationData = options.paginate !== false && this.paginate !== false ? new PaginationData() : null;

    if (!this.url)
    {
      this.url = this.model.prototype.urlRoot;
    }

    Backbone.Collection.call(this, models, options);

    if (this.paginationData)
    {
      this.listenTo(this.paginationData, 'change:page', this.onPageChanged);
    }
  }

  util.inherits(Collection, Backbone.Collection);

  Collection.prototype.model = Model;

  Collection.prototype.parse = function(res)
  {
    if (!res)
    {
      res = {totalCount: 0, collection: []};
    }

    if (this.paginationData)
    {
      this.paginationData.set(this.getPaginationData(res));
    }

    return Array.isArray(res.collection) ? res.collection : [];
  };

  Collection.prototype.sync = function(type, model, options)
  {
    if (type === 'read' && !options.data)
    {
      options.data = this.rqlQuery.toString();
    }

    return Backbone.Collection.prototype.sync.call(this, type, model, options);
  };

  Collection.prototype.genClientUrl = function(action)
  {
    if (this.model.prototype.clientUrlRoot === null)
    {
      throw new Error("Model's `clientUrlRoot` was not specified");
    }

    var url = this.model.prototype.clientUrlRoot;

    if (typeof action === 'string')
    {
      url += ';' + action;
    }

    return url;
  };

  Collection.prototype.getTopicPrefix = function()
  {
    return this.topicPrefix || this.model.prototype.topicPrefix;
  };

  Collection.prototype.getPrivilegePrefix = function()
  {
    return this.privilegePrefix || this.model.prototype.privilegePrefix;
  };

  Collection.prototype.getNlsDomain = function()
  {
    return this.nlsDomain || this.model.prototype.nlsDomain;
  };

  Collection.prototype.getLabel = function(id)
  {
    var model = this.get(id);

    return model ? model.getLabel() : null;
  };

  Collection.prototype.createRqlQuery = function(rqlQuery)
  {
    if (_.isString(rqlQuery))
    {
      rqlQuery = rql.parse(rqlQuery);
    }
    else if (_.isFunction(rqlQuery))
    {
      rqlQuery = rqlQuery.call(this, rql);
    }
    else if (_.isObject(rqlQuery))
    {
      rqlQuery = rql.Query.fromObject(rqlQuery);
    }

    if (rqlQuery && !rqlQuery.isEmpty())
    {
      return rqlQuery;
    }

    if (_.isString(this.rqlQuery))
    {
      return rql.parse(this.rqlQuery);
    }

    if (_.isFunction(this.rqlQuery))
    {
      return this.rqlQuery.call(this, rql);
    }

    if (_.isObject(this.rqlQuery))
    {
      return rql.Query.fromObject(this.rqlQuery);
    }

    return new rql.Query();
  };

  Collection.prototype.getPaginationData = function(res)
  {
    return {
      totalCount: res.totalCount || 0,
      urlTemplate: this.genPaginationUrlTemplate(),
      skip: this.rqlQuery.skip,
      limit: this.rqlQuery.limit
    };
  };

  Collection.prototype.genPaginationUrlTemplate = function()
  {
    var rqlQuery = this.rqlQuery;
    var skip = rqlQuery.skip;
    var limit = rqlQuery.limit;

    rqlQuery.skip = '${skip}';
    rqlQuery.limit = '${limit}';

    var urlTemplate = this.genClientUrl() + '?' + rqlQuery.toString();

    rqlQuery.skip = skip;
    rqlQuery.limit = limit;

    return urlTemplate;
  };

  Collection.prototype.onPageChanged = function(model, newPage)
  {
    this.rqlQuery.skip = (newPage - 1) * this.rqlQuery.limit;

    this.fetch({reset: true});
  };

  Collection.prototype.getDefaultPageLimit = function()
  {
    var hdHeight = 84 + 15;
    var filterHeight = 91 + 15;
    var pagerHeight = 39 + 15;
    var theadHeight = 32;
    var rowHeight = 34;

    if (this.theadHeight > 8)
    {
      theadHeight = this.theadHeight;
    }
    else
    {
      theadHeight = 32 + 20 * ((this.theadHeight || 1) - 1);
    }

    if (typeof this.rowHeight === 'number')
    {
      if (this.rowHeight > 8)
      {
        rowHeight = this.rowHeight;
      }
      else
      {
        rowHeight = 31 + 20 * (this.rowHeight - 1);
      }
    }
    else if (this.rowHeight === false)
    {
      rowHeight = 31;
    }

    var availHeight = window.innerHeight - hdHeight - filterHeight - pagerHeight - theadHeight;

    return Math.max(10, Math.floor(availHeight / rowHeight));
  };

  Collection.prototype.findRqlTerm = function(prop, name)
  {
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
  };

  return Collection;
});
