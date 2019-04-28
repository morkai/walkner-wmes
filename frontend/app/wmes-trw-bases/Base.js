// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model'
], function(
  _,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/trw/bases',

    clientUrlRoot: '#trw/bases',

    topicPrefix: 'trw.bases',

    privilegePrefix: 'TRW',

    nlsDomain: 'wmes-trw-bases',

    labelAttribute: 'name',

    defaults: function()
    {
      return {
        clusters: []
      };
    },

    url: function()
    {
      var url = Model.prototype.url.apply(this, arguments);

      if (this.isNew())
      {
        return url;
      }

      return url + '?populate(tester)';
    },

    serialize: function()
    {
      var obj = this.toJSON();

      if (obj.tester && obj.tester.name)
      {
        obj.tester = obj.tester.name;
      }

      return obj;
    },

    serializeForm: function()
    {
      var obj = this.toJSON();

      if (obj.tester && obj.tester._id)
      {
        obj.tester = obj.tester._id;
      }

      return obj;
    },

    updateCluster: function(newCluster)
    {
      var oldClusters = this.get('clusters');
      var oldClusterI = _.findIndex(oldClusters, function(cluster) { return cluster._id === newCluster._id; });
      var oldCluster = oldClusters[oldClusterI] || null;
      var newClusters;

      if (oldClusterI !== -1)
      {
        newClusters = [].concat(oldClusters);
        newClusters[oldClusterI] = newCluster;
      }
      else
      {
        newClusters = oldClusters.concat(newCluster);
      }

      this.attributes.clusters = newClusters;

      this.trigger('change:clusters', this, newClusters, {
        action: 'updateOne',
        oldCluster: oldCluster,
        newCluster: newCluster
      });
      this.trigger('change', this);
    },

    deleteCluster: function(cluster)
    {
      var oldClusters = this.get('clusters');
      var newClusters = _.without(oldClusters, cluster);

      if (newClusters.length === oldClusters.length)
      {
        return;
      }

      this.set('clusters', newClusters, {
        action: 'deleteOne',
        cluster: cluster
      });
    },

    updateIo: function(ioMap)
    {
      var clusters = this.get('clusters');

      if (!clusters.length)
      {
        return;
      }

      clusters.forEach(function(cluster)
      {
        cluster.rows.forEach(function(row)
        {
          row.forEach(function(cell)
          {
            cell.io = cell.io.filter(function(io) { return !!ioMap[io]; });
          });
        });
      });

      this.trigger('change:clusters', this, clusters, {action: 'updateIo'});
      this.trigger('change', this);
    }

  });
});
