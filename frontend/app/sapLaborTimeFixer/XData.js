// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/Model',
  'app/core/templates/userInfo'
], function(
  _,
  time,
  Model,
  renderUserInfo
) {
  'use strict';

  return Model.extend({

    urlRoot: '/sapLaborTimeFixer/xData',

    clientUrlRoot: '#sapLaborTimeFixer/xData',

    topicPrefix: 'sapLaborTimeFixer.xData',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'sapLaborTimeFixer',

    labelAttribute: 'title',

    initialize: function(attrs, options)
    {
      this.workCenter = options && options.workCenter || null;
      this.deps = options && options.deps || [];
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.createdAt = time.format(obj.createdAt, 'LLL');
      obj.creator = renderUserInfo({userInfo: obj.creator, noIp: true});

      return obj;
    },

    getSelectedWorkCenter: function()
    {
      var data = this.get('data');
      var workCenter = _.find(data, {_id: this.workCenter});

      return workCenter || data[0];
    },

    selectWorkCenter: function(newWorkCenter)
    {
      var oldWorkCenter = this.workCenter;

      if (oldWorkCenter === newWorkCenter)
      {
        return;
      }

      this.workCenter = newWorkCenter;
      this.deps = _.intersection(this.getSelectedWorkCenter().deps, this.deps);

      this.trigger('change:workCenter');
    },

    getSelectedDeps: function()
    {
      return this.deps;
    },

    toggleDeps: function(deps)
    {
      if (_.includes(this.deps, deps))
      {
        this.deps = _.without(this.deps, deps);
      }
      else
      {
        this.deps.push(deps);
      }

      this.trigger('change:deps');
    },

    isDepSelected: function(dep)
    {
      return _.includes(this.deps, dep);
    }

  });
});
