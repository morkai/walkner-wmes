// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'backbone',
  'h5.rql/index',
  './util',
  './PaginationData'
], function(
  _,
  Backbone,
  rql,
  util,
  PaginationData
) {
  'use strict';

  function Collection(models, options)
  {
    if (!_.isObject(options))
    {
      options = {};
    }

    this.rqlQuery = this.createRqlQuery(options.rqlQuery || this.rqlQuery);

    this.paginationData = options.paginate !== false ? new PaginationData() : null;

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

  Collection.prototype.parse = function(res)
  {
    if (this.paginationData)
    {
      this.paginationData.set({
        totalCount: res.totalCount,
        urlTemplate: this.genPaginationUrlTemplate(),
        skip: this.rqlQuery.skip,
        limit: this.rqlQuery.limit
      });
    }

    return res.collection;
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

  return Collection;
});
