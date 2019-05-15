// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jsplumb',
  'app/viewport',
  'app/core/Model',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/planning/util/contextMenu',
  'app/wmes-trw-tests/dictionaries',
  '../Base',
  './ClusterFormView',
  './ClusterCellFormView',
  'app/wmes-trw-bases/templates/form',
  'app/wmes-trw-bases/templates/cluster'
], function(
  _,
  jsPlumb,
  viewport,
  Model,
  FormView,
  idAndLabel,
  contextMenu,
  dictionaries,
  Base,
  ClusterFormView,
  ClusterCellFormView,
  template,
  clusterTemplate
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'dblclick #-canvas': function(e)
      {
        if (!this.tester)
        {
          return false;
        }

        var top = e.offsetY + 10 - (e.offsetY % 10);
        var left = e.offsetX + 10 - (e.offsetX % 10);

        this.showAddClusterDialog(top, left);
      },

      'contextmenu #-canvas': function(e)
      {
        if (!this.tester)
        {
          return false;
        }

        var top = e.offsetY + 10 - (e.offsetY % 10);
        var left = e.offsetX + 10 - (e.offsetX % 10);

        contextMenu.show(this, e.pageY, e.pageX, [
          {
            icon: 'fa-plus',
            label: this.t('menu:addCluster'),
            handler: this.showAddClusterDialog.bind(this, top, left)
          }
        ]);

        return false;
      },

      'dblclick .trw-base-cell': function(e)
      {
        if (!this.tester)
        {
          return false;
        }

        var $io = this.$(e.currentTarget);
        var $cluster = $io.closest('.trw-base-cluster');
        var cluster = _.find(this.model.get('clusters'), function(cluster)
        {
          return cluster._id === $cluster[0].dataset.id;
        });

        this.showEditIoDialog(cluster, +$io[0].dataset.row, +$io[0].dataset.col);

        return false;
      },

      'contextmenu .trw-base-cell': function(e)
      {
        if (!this.tester)
        {
          return false;
        }

        var $io = this.$(e.currentTarget);
        var $cluster = $io.closest('.trw-base-cluster');
        var cluster = _.find(this.model.get('clusters'), function(cluster)
        {
          return cluster._id === $cluster[0].dataset.id;
        });

        contextMenu.show(this, e.pageY, e.pageX, [
          {
            icon: 'fa-edit',
            label: this.t('menu:editIo'),
            handler: this.showEditIoDialog.bind(this, cluster, +$io[0].dataset.row, +$io[0].dataset.col)
          },
          '-',
          {
            icon: 'fa-edit',
            label: this.t('menu:editCluster'),
            handler: this.showEditClusterDialog.bind(this, cluster)
          },
          {
            icon: 'fa-arrows-h',
            label: this.t('menu:alignH'),
            handler: this.alignCluster.bind(this, cluster, 'h')
          },
          {
            icon: 'fa-arrows-v',
            label: this.t('menu:alignV'),
            handler: this.alignCluster.bind(this, cluster, 'v')
          },
          {
            icon: 'fa-times',
            label: this.t('menu:deleteCluster'),
            handler: this.model.deleteCluster.bind(this.model, cluster)
          }
        ]);

        return false;
      },

      'change #-tester': function()
      {
        this.loadTester();
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.jsPlumb = null;
      this.tester = null;

      this.listenTo(this.model, 'change:clusters', this.updateClusters);
    },

    destroy: function()
    {
      var view = this;

      if (view.jsPlumb)
      {
        view.$('.trw-base-cluster').each(function()
        {
          view.jsPlumb.destroyDraggable(this);
        });

        view.jsPlumb.reset();
        view.jsPlumb = null;
      }
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('tester').select2({
        data: dictionaries.testers.map(idAndLabel)
      });

      this.setUpJsPlumb();
      this.loadTester();
    },

    setUpJsPlumb: function()
    {
      this.jsPlumb = jsPlumb.getInstance({
        Container: this.$('.trw-base-canvas-outer')[0]
      });
    },

    loadTester: function()
    {
      var view = this;
      var testerId = view.$id('tester').val();

      view.tester = null;

      view.model.get('clusters').forEach(function(cluster)
      {
        view.deleteCluster(cluster);
      });

      if (!testerId.length)
      {
        return;
      }

      var req = view.ajax({
        url: '/trw/testers/' + testerId
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 10000,
          text: view.t('FORM:ERROR:testerLoadingFailure')
        });
      });

      req.done(function(tester)
      {
        view.tester = {
          ioList: tester.io,
          ioMap: {}
        };

        tester.io.forEach(function(io)
        {
          view.tester.ioMap[io._id] = io;
        });

        view.model.updateIo(view.tester.ioMap);
      });
    },

    $cluster: function(id)
    {
      return this.$('.trw-base-cluster[data-id="' + id + '"]');
    },

    updateClusters: function(base, clusters, options)
    {
      switch (options.action)
      {
        case 'updateOne':
          this.updateCluster(options.newCluster);
          break;

        case 'deleteOne':
          this.deleteCluster(options.cluster);
          break;

        case 'updateIo':
          this.model.get('clusters').forEach(this.updateCluster, this);
          break;
      }
    },

    updateCluster: function(cluster)
    {
      var view = this;
      var clusterId = cluster._id;
      var $oldCluster = view.$cluster(clusterId);
      var $newCluster = view.renderPartial(clusterTemplate, {
        cluster: cluster
      });

      if ($oldCluster.length)
      {
        view.jsPlumb.destroyDraggable($oldCluster[0]);
        $oldCluster.replaceWith($newCluster);
      }
      else
      {
        view.$id('canvas').append($newCluster);
      }

      view.jsPlumb.draggable($newCluster[0], {
        containment: true,
        grid: [10, 10],
        stop: function(e)
        {
          var cluster = _.find(view.model.get('clusters'), function(c) { return c._id === clusterId; });

          if (cluster)
          {
            cluster.top = e.finalPos[1];
            cluster.left = e.finalPos[0];
          }
        }
      });
    },

    deleteCluster: function(cluster)
    {
      var $cluster = this.$cluster(cluster._id);

      if ($cluster.length)
      {
        this.jsPlumb.destroyDraggable($cluster[0]);

        $cluster.remove();
      }
    },

    alignCluster: function(cluster, plane)
    {
      var $canvas = this.$id('canvas');
      var canvasW = $canvas.outerWidth();
      var canvasH = $canvas.outerHeight();
      var $cluster = this.$cluster(cluster._id);
      var clusterW = $cluster.outerWidth();
      var clusterH = $cluster.outerHeight();

      if (plane === 'h')
      {
        cluster.left = (canvasW - clusterW) / 2;
      }
      else
      {
        cluster.top = (canvasH - clusterH) / 2;
      }

      $cluster.css({
        top: cluster.top + 'px',
        left: cluster.left + 'px'
      });
    },

    showAddClusterDialog: function(top, left)
    {
      this.showEditClusterDialog({
        id: '',
        label: {
          text: '',
          position: 'bottom'
        },
        top: top,
        left: left,
        rows: []
      });
    },

    showEditClusterDialog: function(cluster)
    {
      cluster = new Model(_.clone(cluster));

      var dialogView = new ClusterFormView({
        nlsDomain: this.model.nlsDomain,
        model: cluster
      });

      this.listenToOnce(cluster, 'change', function()
      {
        this.model.updateCluster(cluster.toJSON());
      });

      viewport.showDialog(dialogView, this.t('clusterForm:title'));
    },

    showEditIoDialog: function(cluster, rowI, colI)
    {
      var row = cluster.rows[rowI];

      if (!row)
      {
        return;
      }

      var cell = row[colI];

      if (!cell)
      {
        return;
      }

      cell = new Model(_.clone(cell));

      var dialogView = new ClusterCellFormView({
        nlsDomain: this.model.nlsDomain,
        io: this.tester.ioList,
        model: cell
      });

      this.listenToOnce(cell, 'change', function()
      {
        cluster = _.clone(cluster);
        cluster.rows[rowI][colI] = cell.toJSON();

        this.model.updateCluster(cluster);
      });

      viewport.showDialog(dialogView, this.t('clusterCellForm:title'));
    }

  });
});
