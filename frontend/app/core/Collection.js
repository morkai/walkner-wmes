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

    this.paginationData = new PaginationData();

    if (!this.url)
    {
      this.url = this.model.prototype.urlRoot;
    }

    Backbone.Collection.call(this, models, options);

    this.listenTo(this.paginationData, 'change:page', this.onPageChanged);
  }

  util.inherits(Collection, Backbone.Collection);

  Collection.prototype.parse = function(res)
  {
    this.paginationData.set({
      totalCount: res.totalCount,
      urlTemplate: this.genPaginationUrlTemplate(),
      skip: this.rqlQuery.skip,
      limit: this.rqlQuery.limit
    });

    return res.collection;
  };

  Collection.prototype.sync = function(type, model, options)
  {
    if (type === 'read' && !options.data)
    {
      options.data = this.rqlQuery.toString();
    }

    return Backbone.sync(type, model, options);
  };

  Collection.prototype.createRqlQuery = function(rqlQuery)
  {
    if (_.isString(rqlQuery))
    {
      rqlQuery = rql.parse(rqlQuery);
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

    if (_.isObject(rqlQuery))
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

/*
    var clientUrl = _.isFunction(this.clientUrl)
      ? this.clientUrl()
      : _.isString(this.clientUrl) ? this.clientUrl : '#';
*/
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

  return Collection;
});
