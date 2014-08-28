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

  var PROD_LINE_PADDING = 10;
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
      },
      'mouseover .factoryLayout-division': function(e)
      {
        var divisionContainerEl = e.currentTarget;

        if (divisionContainerEl.parentNode.lastChild !== divisionContainerEl)
        {
          divisionContainerEl.parentNode.appendChild(divisionContainerEl);
        }
      }
    },

    initialize: function()
    {
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onResize = _.debounce(this.onResize.bind(this), 16);

      this.canvas = null;
      this.zoom = null;
      this.currentAction = null;
      this.editable = false;

      $('body').on('keydown', this.onKeyDown);
      $(window).on('resize', this.onResize);
      screenfull.onchange = _.debounce(this.onFullscreen.bind(this), 16);

      this.listenTo(this.collection, 'change:state', this.onStateChange);
      this.listenTo(this.collection, 'change:online', this.onOnlineChange);
      this.listenTo(this.collection, 'change:extended', this.onExtendedChange);
    },

    destroy: function()
    {
      $('body').off('keydown', this.onKeyDown);
      $(window).off('resize', this.onResize);
      screenfull.onchange = function() {};

      this.zoom = null;
      this.canvas = null;
    },

    afterRender: function()
    {
      this.el.classList.toggle('is-editable', this.editable);

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
            _id: 'LPd',
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
                h: 340
              },
              {
                x: 310,
                y: 10,
                h: 580
              }
            ]
          },
          {
            _id: 'LPa',
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
            _id: 'LPb',
            position: {x: 1040, y: 10},
            points: [
              [0, 0],
              [0, 600],
              [430, 600],
              [430, 0]
            ],
            fillColor: '#99dd99',
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
            _id: 'LPc',
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
            _id: 'LD',
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

          d3.select(this).classed('is-dragging', true);
        })
        .on('dragend', function()
        {
          d3.select(this).classed('is-dragging', false);
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
        .attr('fill', function(d) { return hex2rgba(d.fillColor || '#000000', 1); })
        .call(this.editable ? drag : function() {});

      divisionContainerEnter.append('path')
        .classed('factoryLayout-division-area', true)
        .attr('d', function(d) { return pathGenerator(d.points); });

      var view = this;
      var padValue = d3.format(' >3d');
      var yInterval = PROD_LINE_HEIGHT + 2 + PROD_LINE_PADDING;

      divisionContainerEnter.each(function(d)
      {
        var divisionContainerEl = d3.select(this);
        var prodLineStates = view.collection.getForDivision(d._id);

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
            var prodLineState = prodLineStates.shift();

            if (prodLineState === undefined)
            {
              break;
            }

            var prodLineOuterContainer = prodLinesContainer.append('g').attr({
              class: 'factoryLayout-prodLine',
              transform: 'translate(0,' + (yInterval * i) + ')',
              style: 'font-size: ' + PROD_LINE_TEXT_SIZE + 'px'
            });

            prodLineOuterContainer.attr('data-id', prodLineState.id);

            if (prodLineState.get('state') !== null)
            {
              prodLineOuterContainer.classed('is-' + prodLineState.get('state'), true);
            }

            prodLineOuterContainer.classed('is-offline', !prodLineState.get('online'));
            prodLineOuterContainer.classed('is-extended', prodLineState.get('extended'));

            var prodLineInnerContainer = prodLineOuterContainer.append('g').attr({
              class: 'factoryLayout-prodLine-inner'
            });

            prodLineInnerContainer.append('rect').attr({
              class: 'factoryLayout-prodLine-bg',
              x: 0,
              y: 0,
              width: PROD_LINE_NAME_WIDTH,
              height: PROD_LINE_HEIGHT
            });

            prodLineInnerContainer.append('text')
              .attr({
                class: 'factoryLayout-prodLine-name',
                x: PROD_LINE_TEXT_X,
                y: PROD_LINE_TEXT_Y
              })
              .text(prodLineState.getLabel());

            prodLineInnerContainer.append('rect').attr({
              class: 'factoryLayout-metric-bg',
              x: PROD_LINE_NAME_WIDTH,
              y: 0,
              width: PROD_LINE_METRIC_WIDTH,
              height: PROD_LINE_HEIGHT
            });

            prodLineInnerContainer.append('text')
              .attr({
                class: 'factoryLayout-metric-value',
                x: 1 + PROD_LINE_NAME_WIDTH + PROD_LINE_TEXT_X,
                y: PROD_LINE_TEXT_Y
              })
              .text(padValue(prodLineState.get('metric1')));

            prodLineInnerContainer.append('rect').attr({
              class: 'factoryLayout-metric-bg',
              x: PROD_LINE_NAME_WIDTH + PROD_LINE_METRIC_WIDTH,
              y: 0,
              width: PROD_LINE_METRIC_WIDTH,
              height: PROD_LINE_HEIGHT
            });

            prodLineInnerContainer.append('text')
              .attr({
                class: 'factoryLayout-metric-value',
                x: 1 + PROD_LINE_NAME_WIDTH + PROD_LINE_METRIC_WIDTH + PROD_LINE_TEXT_X,
                y: PROD_LINE_TEXT_Y
              })
              .text(padValue(prodLineState.get('metric2')));
          }
        });
      });

      divisions.exit().remove();

      this.centerView();

      this.$('[data-action=pan]').click();
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
        .on('dblclick.zoom', null)
        .on('wheel.zoom', null);

      outerContainer.append('rect')
        .attr('class', 'factoryLayout-bg')
        .attr('width', size.width)
        .attr('height', size.height);

      this.zoom = zoom;
      this.canvas = outerContainer.append('g');

      this.translate(5, 5);

      function onZoom()
      {
        view.canvas.attr('transform', 'translate(' + d3.event.translate + ')');
      }
    },

    translate: function(x, y)
    {
      this.zoom.translate([x, y]);

      this.canvas.attr('transform', 'translate(' + x + ',' + y + ')');
    },

    getSize: function()
    {
      if (screenfull.element === this.el)
      {
        return {width: window.innerWidth, height: window.innerHeight};
      }

      var w = window.innerWidth - 28;
      var h = window.innerHeight
        - 19
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

    getProdLineOuterContainer: function(prodLineId)
    {
      return d3.select('.factoryLayout-prodLine[data-id="' + prodLineId + '"]');
    },

    onStateChange: function(prodLineState)
    {
      var prodLineOuterContainer = this.getProdLineOuterContainer(prodLineState.id);

      if (prodLineOuterContainer.empty())
      {
        return;
      }

      var stateClassNames = {
        'is-idle': false,
        'is-working': false,
        'is-downtime': false
      };

      stateClassNames['is-' + prodLineState.get('state')] = true;

      prodLineOuterContainer.classed(stateClassNames);
    },

    onOnlineChange: function(prodLineState)
    {
      var prodLineOuterContainer = this.getProdLineOuterContainer(prodLineState.id);

      if (!prodLineOuterContainer.empty())
      {
        prodLineOuterContainer.classed('is-offline', !prodLineState.get('online'));
      }
    },

    onExtendedChange: function(prodLineState)
    {
      var prodLineOuterContainer = this.getProdLineOuterContainer(prodLineState.id);

      if (!prodLineOuterContainer.empty())
      {
        prodLineOuterContainer.classed('is-extended', prodLineState.get('extended'));
      }
    }

  });
});
