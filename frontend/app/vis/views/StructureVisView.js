// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'd3',
  'app/data/divisions',
  'app/data/subdivisions',
  'app/data/mrpControllers',
  'app/data/prodFlows',
  'app/data/workCenters',
  'app/data/prodLines',
  'app/core/View',
  'app/vis/templates/structureLegend'
], function(
  _,
  $,
  d3,
  divisions,
  subdivisions,
  mrpControllers,
  prodFlows,
  workCenters,
  prodLines,
  View,
  structureLegendTemplate
) {
  'use strict';

  var NODE_TYPE_TO_SYMBOL = {

  };

  return View.extend({

    className: 'vis-structure',

    localTopics: {
      'divisions.synced': 'serializeAndRestart',
      'subdivisions.synced': 'serializeAndRestart',
      'mrpControllers.synced': 'serializeAndRestart',
      'prodFlows.synced': 'serializeAndRestart',
      'workCenters.synced': 'serializeAndRestart',
      'prodLines.synced': 'serializeAndRestart'
    },

    deactivatedVisible: false,

    initialize: function()
    {
      this.onResize = _.debounce(this.onResize.bind(this), 100);

      $(window).on('resize', this.onResize);
    },

    destroy: function()
    {
      $(window).off('resize', this.onResize);

      if (this.force)
      {
        this.force.stop();
        this.force = null;
      }

      this.nodes = null;
      this.links = null;
      this.vis = null;
    },

    beforeRender: function()
    {
      this.$el.empty();
      this.serializeNodesAndLinks();
    },

    afterRender: function()
    {
      var size = this.getSize();

      this.setUpVis(size);
      this.setUpForce(size);
      this.restart();

      this.$el.append(structureLegendTemplate());
    },

    getSize: function()
    {
      var w = window.innerWidth - 28;
      var h = window.innerHeight
        - 14
        - parseInt($('body').css('margin-top'), 10)
        - $('.page > .hd').outerHeight(true)
        - $('.page > .ft').outerHeight(true);

      return {width: w, height: h};
    },

    onResize: function()
    {
      var size = this.getSize();

      this.$('svg').attr(size).find('rect').attr(size);

      this.force.size([size.width, size.height]);
    },

    serializeAndRestart: function()
    {
      this.serializeNodesAndLinks();
      this.restart();
    },

    serializeNodesAndLinks: function()
    {
      var nodes = this.nodes = [];
      var links = this.links = [];

      nodes.push({type: 'root', id: 'root', label: 'PHILIPS'});

      var idToIndex = {root: 0};

      function createNodeAndLink(type, parentProperty, model)
      {
        nodes.push({
          type: type,
          id: model.id,
          label: model.getLabel(),
          deactivated: !!model.get('deactivatedAt')
        });

        var index = nodes.length - 1;

        idToIndex[model.id] = index;

        if (type === 'division')
        {
          links.push({source: index, target: 0});
        }
        else
        {
          [].concat(model.get(parentProperty)).forEach(function(parentId)
          {
            var parentIndex = idToIndex[parentId];

            if (parentIndex)
            {
              links.push({source: index, target: parentIndex});
            }
          });
        }
      }

      divisions.forEach(createNodeAndLink.bind(null, 'division', null));
      subdivisions.forEach(createNodeAndLink.bind(null, 'subdivision', 'division'));
      mrpControllers.forEach(createNodeAndLink.bind(null, 'mrpController', 'subdivision'));
      prodFlows.forEach(createNodeAndLink.bind(null, 'prodFlow', 'mrpController'));
      workCenters.forEach(function(model)
      {
        nodes.push({
          type: 'workCenter',
          id: model.id,
          label: model.getLabel(),
          deactivated: !!model.get('deactivatedAt')
        });

        var index = nodes.length - 1;

        idToIndex[model.id] = index;

        var parentIndex = idToIndex[model.get('mrpController') || model.get('prodFlow')];

        if (parentIndex)
        {
          links.push({source: index, target: parentIndex});
        }
      });
      prodLines.forEach(createNodeAndLink.bind(null, 'prodLine', 'workCenter'));
    },

    setUpVis: function(size)
    {
      var view = this;
      var outerVis = d3.select(this.el).append('svg')
        .attr('width', size.width)
        .attr('height', size.height)
        .attr('pointer-events', 'all')
        .append('g')
          .call(d3.behavior.zoom().on('zoom', zoom));

      outerVis.append('rect')
        .attr('width', size.width)
        .attr('height', size.height)
        .attr('fill', '#f8f8f8');

      this.vis = outerVis.append('g');

      function zoom()
      {
        view.vis.attr('transform', 'translate(' + d3.event.translate + ') scale(' + d3.event.scale + ')');

        if (d3.event.scale >= 0.5)
        {
          view.$('text').fadeIn();
        }
        else
        {
          view.$('text').fadeOut();
        }
      }
    },

    setUpForce: function(size)
    {
      var force = d3.layout.force()
        .nodes(this.nodes)
        .links(this.links)
        .gravity(0.05)
        .distance(function(d) { return d.distance || 100; })
        .charge(-500)
        .size([size.width, size.height]);

      var view = this;

      force.on('tick', function()
      {
        view.vis.selectAll('.link')
          .attr('x1', function(d) { return d.source.x; })
          .attr('y1', function(d) { return d.source.y; })
          .attr('x2', function(d) { return d.target.x; })
          .attr('y2', function(d) { return d.target.y; });

        view.vis.selectAll('.node').attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
      });

      this.force = force;
    },

    getNodeClassNames: function(d)
    {
      return 'node ' + d.type + ' ' + (d.deactivated ? 'is-deactivated' : '');
    },

    enterNodes: function(nodes)
    {
      var view = this;
      var node = nodes.enter().append('g')
        .attr('class', this.getNodeClassNames)
        .style('display', function(d) { return view.deactivatedVisible || !d.deactivated ? '' : 'none'; })
        .call(this.force.drag)
        .on('mousedown', function() { d3.event.stopPropagation(); });

      var symbol = d3.svg.symbol()
        .size(800)
        .type(function(d) { return NODE_TYPE_TO_SYMBOL[d.type] || 'circle'; });

      node.append('path')
        .attr('d', symbol);

      node.append('text')
        .attr('x', 20)
        .attr('y', 4)
        .text(function(d) { return d.label; });
    },

    updateNodes: function(nodes)
    {
      nodes.attr('class', this.getNodeClassNames);

      nodes.selectAll('text')
        .text(function(d) { return d.label; });
    },

    exitNodes: function(nodes)
    {
      nodes.exit().remove();
    },

    restart: function()
    {
      this.restartLinks();
      this.restartNodes();
      this.restartForce();
    },

    restartLinks: function(restartForce)
    {
      var view = this;
      var nodes = this.force.nodes();
      var links = this.vis.selectAll('.link')
        .data(this.links, function(d)
        {
          var source = nodes[d.source];
          var target = nodes[d.target];

          d.deactivated = (source && source.deactivated) || (target && target.deactivated);

          return d.source + '-' + d.target;
        });

      links.enter().insert('line', 'g.node')
        .attr('class', function(d) { return 'link ' + (d.deactivated ? 'is-deactivated' : ''); })
        .style('display', function(d) { return view.deactivatedVisible || !d.deactivated ? '' : 'none'; });

      links.exit().remove();

      if (restartForce)
      {
        this.restartForce();
      }
    },

    restartNodes: function(restartForce)
    {
      var nodes = this.vis.selectAll('g.node')
        .data(this.nodes, function(d) { return d.id; });

      this.updateNodes(nodes);
      this.enterNodes(nodes);
      this.exitNodes(nodes);

      if (restartForce)
      {
        this.restartForce();
      }
    },

    restartForce: function()
    {
      this.force
        .nodes(this.nodes)
        .links(this.links)
        .start();
    },

    showDeactivated: function()
    {
      this.$('.is-deactivated').css('display', '');
    },

    hideDeactivated: function()
    {
      this.$('.is-deactivated').css('display', 'none');
    }

  });
});
