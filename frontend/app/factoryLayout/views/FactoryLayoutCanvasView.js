// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'd3',
  'app/core/View',
  'app/factoryLayout/templates/canvas',
  'screenfull'
], function(
  _,
  $,
  d3,
  View,
  template,
  screenfull
) {
  'use strict';

  var PROD_LINE_PADDING = 5;
  var PROD_LINE_HEIGHT = 22;
  var PROD_LINE_TEXT_X = 4;
  var PROD_LINE_TEXT_Y = 17;
  var PROD_LINE_TEXT_SIZE = 18;
  var PROD_LINE_NAME_WIDTH = 110;
  var PROD_LINE_METRIC_WIDTH = 39;

  function hex2rgba(hex, opacity)
  {
    return 'rgba(' + parseInt(hex.substr(1, 2), 16)
      + ',' + parseInt(hex.substr(3, 2), 16)
      + ',' + parseInt(hex.substr(5, 2), 16)
      + ',' + opacity
      + ')';
  }

  return View.extend({

    template: template,

    events: {
      'click [data-action]': function(e)
      {
        var actionEl = e.currentTarget;
        var newAction = actionEl.dataset.action;

        if (newAction === this.currentAction)
        {
          return false;
        }

        if (this.currentAction !== null)
        {
          this.$('[data-action=' + this.currentAction + ']').removeClass('active');
        }

        this.currentAction = newAction;

        this.$('[data-action=' + this.currentAction + ']').addClass('active');
      }
    },

    initialize: function()
    {
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onResize = _.debounce(this.onResize.bind(this), 16);

      this.canvas = null;
      this.zoom = null;
      this.currentAction = null;

      $('body').on('keydown', this.onKeyDown);
      $(window).on('resize', this.onResize);
      screenfull.onchange = _.debounce(this.onFullscreen.bind(this), 16);

window.flv = this;
    },

    destroy: function()
    {
      $('body').off('keydown', this.onKeyDown);
      $(window).off('resize', this.onResize);
      screenfull.onchange = function() {};

      this.zoom = null;
      this.canvas = null;
    },

    beforeRender: function()
    {

    },

    afterRender: function()
    {
      this.setUpCanvas(this.getSize());

      this.canvas.append('rect')
        .attr('class', 'factoryLayout-area')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', '1920px')
        .attr('height', '1080px');

      var divisions = this.canvas.selectAll('.division')
        .data([
          {
            id: 'LPd',
            position: {x: 10, y: 10},
            points: [
              [0, 0],
              [0, 350],
              [300, 350],
              [300, 600],
              [600, 600],
              [600, 0]
            ],
            fillColor: '#00aaff',
            prodLines: [
              {
                x: 10,
                y: 10,
                h: 330
              },
              {
                x: 310,
                y: 10,
                h: 580
              }
            ]
          },
          {
            id: 'LPa',
            position: {x: 610, y: 10},
            points: [
              [0, 0],
              [0, 600],
              [430, 600],
              [430, 0]
            ],
            fillColor: '#FFFF80',
            prodLines: [
              {
                x: 10,
                y: 10,
                h: 580
              },
              {
                x: 230,
                y: 10,
                h: 580
              }
            ]
          },
          {
            id: 'LPb',
            position: {x: 1040, y: 10},
            points: [
              [0, 0],
              [0, 600],
              [430, 600],
              [430, 0]
            ],
            fillColor: '#80D780',
            prodLines: [
              {
                x: 10,
                y: 10,
                h: 580
              },
              {
                x: 230,
                y: 10,
                h: 580
              }
            ]
          },
          {
            id: 'LPc',
            position: {x: 1470, y: 10},
            points: [
              [0, 0],
              [0, 600],
              [440, 600],
              [440, 0]
            ],
            fillColor: '#C080C0',
            prodLines: [
              {
                x: 10,
                y: 10,
                h: 580
              },
              {
                x: 240,
                y: 10,
                h: 580
              }
            ]
          },
          {
            position: {x: 10, y: 360},
            points: [
              [0, 0],
              [0, 250],
              [75, 250],
              [75, 500],
              [800, 500],
              [800, 710],
              [1320, 710],
              [1320, 500],
              [1900, 500],
              [1900, 250],
              [300, 250],
              [300, 0]
            ],
            fillColor: '#FFD580',
            prodLines: [

            ]
          }
        ]);

      var pathGenerator = d3.svg.line()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; })
        .interpolate('linear-closed');

      var drag = d3.behavior.drag()
        .origin(function(d) { return d.position; })
        .on('dragstart', function()
        {
          d3.event.sourceEvent.stopPropagation();

          this.parentNode.appendChild(this);
          this.classList.add('is-dragging');
        })
        .on('dragend', function()
        {
          this.classList.remove('is-dragging');
        })
        .on('drag', function(d)
        {
          d.position.x = d3.event.x - (d3.event.x % 10);
          d.position.y = d3.event.y - (d3.event.y % 10);

          d3.select(this).attr('transform', 'translate(' + d.position.x + ',' + d.position.y + ')');
        });

      var divisionContainerEnter = divisions.enter().insert('g')
        .attr('class', 'factoryLayout-division')
        .attr('transform', function(d) { return 'translate(' + d.position.x + ',' + d.position.y + ')'; })
        .attr('fill', function(d) { return hex2rgba(d.fillColor || '#000000', 0.5); })
        .call(drag);

      divisionContainerEnter.append('path')
        .classed('factoryLayout-division-area', true)
        .attr('d', function(d) { return pathGenerator(d.points); });

      var padName = d3.format(' >6d');
      var padValue = d3.format(' >3d');
      var yInterval = PROD_LINE_HEIGHT + 2 + PROD_LINE_PADDING;

      divisionContainerEnter.each(function(d)
      {
        var divisionContainerEl = d3.select(this);
        var prodLineCounter = 1;

        d.prodLines.forEach(function(prodLine)
        {
          var prodLinesContainer = divisionContainerEl.append('g').attr({
            class: 'factoryLayout-prodLines',
            transform: 'translate(' + prodLine.x + ',' + prodLine.y + ')'
          });

          prodLinesContainer.append('path').attr({
            class: 'factoryLayout-prodLines-line',
            d: 'M-5,0 v' + prodLine.h
          });

          var prodLineCount = Math.floor(prodLine.h / yInterval);

          for (var i = 0; i < prodLineCount; ++i)
          {
            var prodLineContainer = prodLinesContainer.append('g').attr({
              class: 'factoryLayout-prodLine',
              transform: 'translate(0,' + (yInterval * i) + ')',
              style: 'font-size: ' + PROD_LINE_TEXT_SIZE + 'px'
            });

            prodLineContainer.append('rect').attr({
              class: 'factoryLayout-prodLine-bg',
              x: 0,
              y: 0,
              width: PROD_LINE_NAME_WIDTH,
              height: PROD_LINE_HEIGHT
            });

            prodLineContainer.append('text')
              .attr({
                class: 'factoryLayout-prodLine-name',
                x: PROD_LINE_TEXT_X,
                y: PROD_LINE_TEXT_Y
              })
              .html(d.id + ' ' + padName(prodLineCounter++));

            prodLineContainer.append('rect').attr({
              class: 'factoryLayout-metric-bg',
              x: PROD_LINE_NAME_WIDTH,
              y: 0,
              width: PROD_LINE_METRIC_WIDTH,
              height: PROD_LINE_HEIGHT
            });

            prodLineContainer.append('text')
              .attr({
                class: 'factoryLayout-metric-value',
                x: 1 + PROD_LINE_NAME_WIDTH + PROD_LINE_TEXT_X,
                y: PROD_LINE_TEXT_Y
              })
              .html(padValue(Math.round(Math.random() * 125)));

            prodLineContainer.append('rect').attr({
              class: 'factoryLayout-metric-bg',
              x: PROD_LINE_NAME_WIDTH + PROD_LINE_METRIC_WIDTH,
              y: 0,
              width: PROD_LINE_METRIC_WIDTH,
              height: PROD_LINE_HEIGHT
            });

            prodLineContainer.append('text')
              .attr({
                class: 'factoryLayout-metric-value',
                x: 1 + PROD_LINE_NAME_WIDTH + PROD_LINE_METRIC_WIDTH + PROD_LINE_TEXT_X,
                y: PROD_LINE_TEXT_Y
              })
              .html(padValue(Math.round(Math.random() * 125)));
          }
        });
      });

      divisions.exit().remove();

      this.centerView();

      this.$('[data-action=pan]').click();
    },

    getSize: function()
    {
      if (screenfull.element === this.el)
      {
        return {width: window.innerWidth, height: window.innerHeight};
      }

      var w = window.innerWidth - 28;
      var h = window.innerHeight
        - 14
        - $('.page > .hd').outerHeight(true)
        - $('.page > .ft').outerHeight(true);

      return {width: w, height: h};
    },

    centerView: function()
    {
      var canvasWidth = this.canvas.node().getBBox().width;
      var x;
      var y;

      if (screenfull.isFullscreen)
      {
        x = (window.innerWidth - canvasWidth) / 2;
        y = 0;
      }
      else
      {
        x = (this.el.getBoundingClientRect().width - canvasWidth) / 2;
        y = 5;
      }

      this.$el.toggleClass('is-fullscreen', screenfull.isFullscreen);

      this.translate(x, y);
    },

    onKeyDown: function(e)
    {
      if (e.which === 122 && !screenfull.isFullscreen)
      {
        e.preventDefault();

        screenfull.request(this.el);
      }
    },

    onResize: function()
    {
      var size = this.getSize();

      this.$el.css(size);
      this.$('svg').attr(size).find('.factoryLayout-bg').attr(size);
    },

    onFullscreen: function()
    {
      this.centerView();
    },

    setUpCanvas: function(size)
    {
      var view = this;

      this.$el.css(size);

      var zoom = d3.behavior.zoom()
        .on('zoomstart', function()
        {
          view.$el.addClass('is-panning');
        })
        .on('zoomend', function()
        {
          view.$el.removeClass('is-panning');
        })
        .on('zoom', onZoom);

      var outerContainer = d3.select(this.el).select('svg')
        .attr('class', 'factoryLayout-canvas')
        .attr('width', size.width)
        .attr('height', size.height)
        .attr('pointer-events', 'all')
        .append('g')
          .call(zoom)
          .on('dblclick.zoom', null);

      outerContainer.append('rect')
        .attr('class', 'factoryLayout-bg')
        .attr('width', size.width)
        .attr('height', size.height);

      this.zoom = zoom;
      this.canvas = outerContainer.append('g');

      this.translate(5, 5);

      function onZoom()
      {
        view.canvas.attr('transform', 'translate(' + d3.event.translate + ') scale(' + d3.event.scale + ')');

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

    translate: function(x, y)
    {
      this.zoom.scale(1);
      this.zoom.translate([x, y]);

      this.canvas.attr('transform', 'translate(' + x + ',' + y + ') scale(1)');
    }

  });
});
