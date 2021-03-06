// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'd3',
  'screenfull',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/util/padString',
  'app/factoryLayout/templates/canvas',
  'app/factoryLayout/templates/popover'
], function(
  _,
  $,
  d3,
  screenfull,
  time,
  viewport,
  View,
  padString,
  template,
  popoverTemplate
) {
  'use strict';

  var PROD_LINE_PADDING = 9;
  var PROD_LINE_HEIGHT = 22;
  var PROD_LINE_TEXT_X = 4;
  var PROD_LINE_TEXT_Y = 17;
  var PROD_LINE_TEXT_SIZE = 18;
  var PROD_LINE_NAME_WIDTH = 110;
  var PROD_LINE_METRIC_WIDTH = 39;
  var PROD_LINE_TOP_INTERVAL = PROD_LINE_HEIGHT + 2 + PROD_LINE_PADDING;

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
        this.bringDivisionToTop(e.currentTarget);
      },
      'mouseenter .factoryLayout-prodLine': function(e)
      {
        this.$popover = this.$(e.currentTarget).popover({
          container: 'body',
          placement: 'auto right',
          viewport: {
            selector: 'body',
            padding: 15
          },
          trigger: 'manual',
          html: true,
          content: this.getPopoverContent.bind(this, e.currentTarget.getAttribute('data-id')),
          template: '<div class="popover factoryLayout-popover">'
            + '<div class="arrow"></div>'
            + '<div class="popover-content"></div>'
            + '</div>'
        }).popover('show');
      },
      'mouseleave .factoryLayout-prodLine': function(e)
      {
        this.$(e.currentTarget).popover('destroy');
        this.$popover = null;
      },
      'mousedown .factoryLayout-prodLine': function(e)
      {
        this.clickInfo = {
          type: 'prodLine',
          time: e.timeStamp,
          modelId: e.currentTarget.getAttribute('data-id'),
          button: e.button
        };

        return false;
      },
      'mousedown .factoryLayout-division': function(e)
      {
        this.clickInfo = {
          type: 'division',
          time: e.timeStamp,
          modelId: e.currentTarget.getAttribute('data-id'),
          button: e.button
        };

        return false;
      },
      'mousedown .factoryLayout-bg': function()
      {
        this.clickInfo = null;

        return false;
      }
    },

    localTopics: {
      'navbar.shown': function()
      {
        this.onResize();
      },
      'navbar.hidden': function()
      {
        this.onResize();
      }
    },

    initialize: function(options)
    {
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onResize = _.debounce(this.onResize.bind(this), 16);

      this.heff = !!options.heff;
      this.editable = !!this.options.editable;
      this.canvas = null;
      this.zoom = null;
      this.currentAction = null;
      this.clickInfo = null;
      this.panInfo = null;
      this.$popover = null;
      this.dragged = false;

      $('body').on('keydown', this.onKeyDown);
      $(window).on('resize', this.onResize);
      screenfull.onchange = _.debounce(this.onFullscreen.bind(this), 16);

      if (!this.editable)
      {
        var model = this.model;
        var prodLineStates = model.prodLineStates;

        this.once('afterRender', function()
        {
          this.listenTo(prodLineStates, 'change:state', this.onStateChange);
          this.listenTo(prodLineStates, 'change:online', this.onOnlineChange);
          this.listenTo(prodLineStates, 'change:extended', this.onExtendedChange);
          this.listenTo(prodLineStates, 'change:qi', this.onQiChange);
          this.listenTo(prodLineStates, 'change:plannedQuantityDone', this.onPlannedQuantityDoneChange);
          this.listenTo(prodLineStates, 'change:actualQuantityDone', this.onActualQuantityDoneChange);
          this.listenTo(prodLineStates, 'change:taktTime', this.updateTaktTime);
          this.listenTo(prodLineStates, 'change:heff', this.updateHeffStatus);
          this.listenTo(model, 'sync', this.render);
          this.listenTo(model.settings.factoryLayout, 'change', this.onLayoutSettingsChange);
          this.listenTo(model.settings.production, 'change', this.onProductionSettingsChange);
        });

        this.timers.updateMetrics = setInterval(this.updateMetrics.bind(this), 20000);
      }
    },

    destroy: function()
    {
      if (this.$popover)
      {
        this.$popover.popover('destroy');
        this.$popover = null;
      }

      $('body').off('keydown', this.onKeyDown);
      $(window).off('resize', this.onResize);
      screenfull.onchange = function() {};

      this.zoom = null;
      this.canvas = null;
      this.clickInfo = null;
      this.panInfo = null;
    },

    getTemplateData: function()
    {
      return {
        editable: this.editable,
        heff: this.heff
      };
    },

    afterRender: function()
    {
      if (this.model.isLoading())
      {
        return;
      }

      this.setUpCanvas(this.getSize());
      this.renderLayout();
      this.centerView();

      this.$('[data-action=pan]').click();
    },

    renderLayout: function()
    {
      this.renderDivisionAreas();
    },

    renderDivisionAreas: function()
    {
      var view = this;
      var model = this.model;
      var selection = this.canvas.selectAll('.factoryLayout-division')
        .data(model.factoryLayout.get('live'));

      var pathGenerator = d3.svg.line()
        .x(function(d)
        {
          return d[0];
        })
        .y(function(d)
        {
          return d[1];
        })
        .interpolate('linear-closed');

      var drag = d3.behavior.drag()
        .origin(function(d)
        {
          return d.position;
        })
        .on('dragstart', function()
        {
          d3.event.sourceEvent.stopPropagation();

          view.bringDivisionToTop(this);

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

          view.dragged = true;
        });

      var g = selection.enter().insert('g')
        .attr('class', 'factoryLayout-division')
        .attr('transform', function(d)
        {
          return 'translate(' + d.position.x + ',' + d.position.y + ')';
        })
        .attr('fill', function(d)
        {
          if (model.settings.factoryLayout)
          {
            return model.settings.factoryLayout.getColor(d._id);
          }

          return hex2rgba(d.fillColor || '#000000', 1);
        })
        .attr('data-id', function(d)
        {
          return d._id;
        })
        .call(this.editable ? drag : function()
        {

        });

      g.append('path')
        .classed('factoryLayout-division-area', true)
        .attr('d', function(d)
        {
          return pathGenerator(d.points);
        });

      var prodLineStates = model.prodLineStates;
      var isBlacklisted = model.settings.factoryLayout
        ? model.settings.factoryLayout.isBlacklisted.bind(model.settings.factoryLayout)
        : null;

      g.each(function(d)
      {
        var divisionEl = d3.select(this);

        d.prodLines.forEach(
          view.renderProdLinesGuide.bind(
            view, d, divisionEl,
            prodLineStates ? prodLineStates.getByOrgUnit('division', [d._id], isBlacklisted) : null
          )
        );

        view.renderDivisionName(divisionEl, d);
      });

      selection.exit().remove();
    },

    renderDivisionName: function(divisionEl, d)
    {
      var x = 0;
      var y = 0;

      for (var i = 1, l = d.points.length - 1; i < l; ++i)
      {
        var prevPoint = d.points[i - 1];
        var currentPoint = d.points[i];
        var nextPoint = d.points[i + 1];

        if (currentPoint[1] === prevPoint[1]
          && currentPoint[1] > nextPoint[1]
          && currentPoint[0] === nextPoint[0])
        {
          x = currentPoint[0] - (4 + d._id.length * 8);
          y = currentPoint[1] - 16;

          break;
        }
      }

      var g = divisionEl.append('g')
        .classed('factoryLayout-divisionName', true)
        .attr('transform', 'translate(' + x + ',' + y + ')');

      g.append('rect')
        .attr({
          x: 0,
          y: 0,
          width: 3 + d._id.length * 8,
          height: 14
        });

      g.append('text')
        .attr({
          x: 2,
          y: 12
        })
        .text(d._id);
    },

    renderProdLinesGuide: function(d, divisionContainerEl, prodLineStates, prodLinesGuide)
    {
      var prodLinesContainer = divisionContainerEl.append('g').attr({
        class: 'factoryLayout-prodLines',
        transform: 'translate(' + prodLinesGuide.x + ',' + prodLinesGuide.y + ')'
      });

      var prodLineCount = Math.floor(prodLinesGuide.h / PROD_LINE_TOP_INTERVAL);

      for (var i = 0; i < prodLineCount; ++i)
      {
        var prodLineState = prodLineStates ? prodLineStates.shift() : null;

        if (prodLineState === undefined)
        {
          break;
        }

        this.renderProdLineBox(prodLinesContainer, prodLineState, i);
      }
    },

    renderProdLineBox: function(prodLinesContainer, prodLineState, i)
    {
      var prodLineOuterContainer = prodLinesContainer.append('g').attr({
        class: 'factoryLayout-prodLine',
        transform: 'translate(0,' + (PROD_LINE_TOP_INTERVAL * i) + ')',
        style: 'font-size: ' + PROD_LINE_TEXT_SIZE + 'px'
      });

      var heff = this.heff && prodLineState ? prodLineState.recalcHeff() : null;
      var plannedQuantityDone = 0;
      var actualQuantityDone = 0;
      var inspections = 0;

      if (prodLineState)
      {
        prodLineOuterContainer.attr('data-id', prodLineState.id);

        if (!heff && prodLineState.get('state') !== null)
        {
          prodLineOuterContainer.classed('is-' + prodLineState.get('state'), true);
          prodLineOuterContainer.classed('is-break', prodLineState.isBreak());
        }

        if (heff)
        {
          plannedQuantityDone = heff.endOfHourPlanned;
          actualQuantityDone = heff.totalActual;

          prodLineOuterContainer.classed('is-heff-' + heff.status, true);
        }
        else
        {
          plannedQuantityDone = prodLineState.getMetricValue('plannedQuantityDone');
          actualQuantityDone = prodLineState.getMetricValue('actualQuantityDone');
        }

        inspections = prodLineState.getMetricValue('inspections');
      }

      var qi = prodLineState && prodLineState.get('qi');

      prodLineOuterContainer.classed({
        'is-offline': prodLineState && !prodLineState.get('online'),
        'is-extended': prodLineState && prodLineState.get('extended'),
        'is-eff-high': false,
        'is-eff-mid': false,
        'is-eff-low': false,
        'is-inspection-ok': qi && qi.ok === true,
        'is-inspection-nok': qi && qi.ok === false
      });

      var effClassName = prodLineState && prodLineState.getOrderEfficiencyClassName();

      if (effClassName)
      {
        prodLineOuterContainer.classed(effClassName, true);
      }

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
        .text(prodLineState ? prodLineState.getLabel() : ('LPx ' + (i + 1)));

      // Planned quantity done
      plannedQuantityDone = this.prepareMetricValue(plannedQuantityDone);

      prodLineInnerContainer.append('rect').attr({
        class: 'factoryLayout-metric-bg factoryLayout-metric-plannedQuantityDone-bg',
        x: PROD_LINE_NAME_WIDTH,
        y: 0,
        width: PROD_LINE_METRIC_WIDTH,
        height: PROD_LINE_HEIGHT
      });

      prodLineInnerContainer.append('text')
        .attr({
          class: 'factoryLayout-metric-value factoryLayout-metric-plannedQuantityDone',
          x: 1 + PROD_LINE_NAME_WIDTH + PROD_LINE_TEXT_X,
          y: PROD_LINE_TEXT_Y,
          'data-length': plannedQuantityDone.length
        })
        .text(plannedQuantityDone);

      // Actual quantity done
      actualQuantityDone = this.prepareMetricValue(actualQuantityDone);

      prodLineInnerContainer.append('rect').attr({
        class: 'factoryLayout-metric-bg factoryLayout-metric-actualQuantityDone-bg',
        x: PROD_LINE_NAME_WIDTH + PROD_LINE_METRIC_WIDTH,
        y: 0,
        width: PROD_LINE_METRIC_WIDTH,
        height: PROD_LINE_HEIGHT
      });

      prodLineInnerContainer.append('text')
        .attr({
          class: 'factoryLayout-metric-value factoryLayout-metric-actualQuantityDone',
          x: 1 + PROD_LINE_NAME_WIDTH + PROD_LINE_METRIC_WIDTH + PROD_LINE_TEXT_X,
          y: PROD_LINE_TEXT_Y,
          'data-length': actualQuantityDone.length
        })
        .text(actualQuantityDone);

      // Inspections
      inspections = this.prepareMetricValue(inspections);

      prodLineInnerContainer.append('rect').attr({
        class: 'factoryLayout-metric-bg factoryLayout-metric-inspections-bg',
        x: PROD_LINE_NAME_WIDTH + PROD_LINE_METRIC_WIDTH * 2,
        y: 0,
        width: PROD_LINE_METRIC_WIDTH,
        height: PROD_LINE_HEIGHT
      });

      prodLineInnerContainer.append('text')
        .attr({
          class: 'factoryLayout-metric-value factoryLayout-metric-inspections',
          x: 1 + PROD_LINE_NAME_WIDTH + PROD_LINE_METRIC_WIDTH * 2 + PROD_LINE_TEXT_X,
          y: PROD_LINE_TEXT_Y,
          'data-length': inspections.length
        })
        .text(inspections);
    },

    setUpCanvas: function(size)
    {
      var view = this;

      this.$el.css(size);

      var zoom = d3.behavior.zoom()
        .on('zoomstart', function()
        {
          view.panInfo = {
            time: d3.event.sourceEvent.timeStamp,
            translate: d3.event.target.translate()
          };

          view.$el.addClass('is-panning');

          if (view.$popover)
          {
            view.$popover.popover('destroy');
            view.$popover = null;
          }
        })
        .on('zoomend', function()
        {
          view.$el.removeClass('is-panning');

          var panInfo = view.panInfo;
          var translate = d3.event.target.translate();

          view.panInfo = null;

          if (!view.clickInfo
            || panInfo.translate[0] !== translate[0]
            || panInfo.translate[1] !== translate[1])
          {
            return;
          }

          view.handleClick();
        })
        .on('zoom', function()
        {
          if (view.canvas)
          {
            view.canvas.attr('transform', 'translate(' + d3.event.translate + ')');
          }
        });

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

      if (this.canvas)
      {
        this.canvas.remove();
      }

      this.canvas = outerContainer.append('g');

      this.canvas.append('rect')
        .attr('class', 'factoryLayout-area')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', '1920px')
        .attr('height', '1080px');

      this.translate(5, 5);
    },

    translate: function(x, y)
    {
      if (this.zoom)
      {
        this.zoom.translate([x, y]);
      }

      if (this.canvas)
      {
        this.canvas.attr('transform', 'translate(' + x + ',' + y + ')');
      }
    },

    getSize: function()
    {
      if (screenfull.element === this.el)
      {
        return {
          width: window.innerWidth,
          height: window.innerHeight
        };
      }

      var w = window.innerWidth - 28;
      var h = window.innerHeight
        - 28
        - $('.page > .hd').outerHeight(true);

      return {width: w, height: h};
    },

    centerView: function()
    {
      this.$el.toggleClass('is-fullscreen', screenfull.isFullscreen);

      var points = [];

      (this.model.factoryLayout.get('live') || []).forEach(function(section)
      {
        section.points.forEach(function(point)
        {
          points.push([point[0] + section.position.x, point[1] + section.position.y]);
        });
      });

      points.sort((a, b) => a[0] - b[0]);

      var left = points[0][0];
      var right = points[points.length - 1][0];

      points.sort((a, b) => a[1] - b[1]);

      var top = points[0][1];
      var bottom = points[points.length - 1][1];

      var containerWidth = 0;
      var containerHeight = 0;

      if (screenfull.isFullscreen)
      {
        containerWidth = window.innerWidth;
        containerHeight = window.innerHeight;
      }
      else
      {
        var rect = this.el.getBoundingClientRect();

        containerWidth = rect.width;
        containerHeight = rect.height;
      }

      var layoutWidth = right - left;
      var layoutHeight = bottom - top;

      var x = Math.round((containerWidth - layoutWidth) / 2);
      var y = Math.round((containerHeight - layoutHeight) / 2);

      this.translate(x, y);
    },

    getPopoverContent: function(prodLineId)
    {
      var prodLineState = this.model.prodLineStates.get(prodLineId);
      var state = prodLineState && prodLineState.get('state') || 'idle';
      var order = null;
      var downtime = null;

      if (!this.heff)
      {
        if (state === 'idle')
        {
          return;
        }

        order = prodLineState.getCurrentOrder();

        if (!order)
        {
          return;
        }

        downtime = prodLineState.getCurrentDowntime();
      }

      var now = Date.now();

      return this.renderPartialHtml(popoverTemplate, {
        order: !order ? null : {
          name: order.getProductName(),
          operation: order.getOperationName(),
          startedAt: time.format(order.get('startedAt'), 'LTS'),
          duration: order.getDurationString(now, false),
          quantityDone: order.getQuantityDone(),
          workerCount: order.getWorkerCount(),
          sapWorkerCount: order.getWorkerCountSap(),
          taktTime: time.toString(order.getSapTaktTime()),
          cycleTime: time.toString(order.getLastTaktTime()),
          iptCycleTime: time.toString(order.getIptTaktTime()),
          avgCycleTime: time.toString(order.getAvgTaktTime())
        },
        downtime: !downtime ? null : {
          reason: downtime.getReasonLabel(),
          aor: downtime.getAorLabel(),
          duration: downtime.getDurationString(now, false)
        },
        heff: this.heff && prodLineState ? prodLineState.get('heff') : null
      });
    },

    onKeyDown: function(e)
    {
      if (!document.msExitFullscreen && e.which === 122 && !screenfull.isFullscreen)
      {
        e.preventDefault();

        screenfull.request(this.el);
      }
    },

    onResize: function()
    {
      this.resize();

      if (!this.dragged)
      {
        this.centerView();
      }
    },

    onFullscreen: function()
    {
      this.resize();
      this.centerView();
    },

    resize: function()
    {
      var size = this.getSize();

      this.$el.css(size);
      this.$('svg').attr(size).find('.factoryLayout-bg').attr(size);
    },

    getProdLineOuterContainer: function(prodLineId)
    {
      return d3.select('.factoryLayout-prodLine[data-id="' + prodLineId + '"]');
    },

    onStateChange: function(prodLineState)
    {
      this.updateLineClassNames(prodLineState);
    },

    updateLineClassNames: function(prodLineState)
    {
      var prodLineOuterContainer = this.getProdLineOuterContainer(prodLineState.id);

      if (prodLineOuterContainer.empty())
      {
        return;
      }

      var stateClassNames = {
        'is-off': false,
        'is-idle': false,
        'is-working': false,
        'is-downtime': false,
        'is-break': !this.heff && prodLineState.isBreak(),
        'is-heff-off': false,
        'is-heff-noPlan': false,
        'is-heff-unplanned': false,
        'is-heff-under': false,
        'is-heff-over': false,
        'is-heff-underRatio': false,
        'is-heff-overRatio': false
      };

      if (this.heff)
      {
        var heff = prodLineState.get('heff');

        if (!heff)
        {
          heff = prodLineState.recalcHeff();
        }

        stateClassNames['is-heff-' + heff.status] = true;
      }
      else
      {
        stateClassNames['is-' + (prodLineState.get('state') || 'off')] = true;
      }

      prodLineOuterContainer.classed(stateClassNames);
    },

    onOnlineChange: function(prodLineState)
    {
      var prodLineOuterContainer = this.getProdLineOuterContainer(prodLineState.id);

      if (prodLineOuterContainer.empty())
      {
        return;
      }

      prodLineOuterContainer.classed('is-offline', !prodLineState.get('online'));

      this.updateTaktTime(prodLineState);
    },

    onExtendedChange: function(prodLineState)
    {
      var prodLineOuterContainer = this.getProdLineOuterContainer(prodLineState.id);

      if (prodLineOuterContainer.empty())
      {
        return;
      }

      prodLineOuterContainer.classed('is-extended', prodLineState.get('extended'));

      if (!prodLineState.get('extended'))
      {
        prodLineOuterContainer.style('display', 'none');
        _.defer(function() { prodLineOuterContainer.style('display', null); });
      }
    },

    onQiChange: function(prodLineState)
    {
      var prodLineOuterContainer = this.getProdLineOuterContainer(prodLineState.id);

      if (prodLineOuterContainer.empty())
      {
        return;
      }

      var qi = prodLineState.get('qi');

      prodLineOuterContainer.classed({
        'is-inspection-ok': qi.ok === true,
        'is-inspection-nok': qi.ok === false
      });

      this.updateMetricValue(prodLineState, 'inspections');
    },

    onPlannedQuantityDoneChange: function(prodLineState)
    {
      if (this.heff)
      {
        prodLineState.recalcHeff();
      }

      this.updateMetricValue(prodLineState, 'plannedQuantityDone');
    },

    onActualQuantityDoneChange: function(prodLineState)
    {
      if (this.heff)
      {
        prodLineState.recalcHeff();
      }

      this.updateMetricValue(prodLineState, 'actualQuantityDone');
    },

    onLayoutSettingsChange: function(setting)
    {
      if (/blacklist/.test(setting.id))
      {
        this.canvas.selectAll('.factoryLayout-division').remove();
        this.renderLayout();
      }
      else if (/color/.test(setting.id))
      {
        var divisionId = setting.id.split('.')[1];

        this.canvas.select('.factoryLayout-division[data-id="' + divisionId + '"]').attr('fill', setting.getValue());
      }
      else if (/outOfSyncWindow/.test(setting.id))
      {
        this.model.prodLineStates.forEach(function(prodLineState)
        {
          prodLineState.recalcHeff();
        });
      }
    },

    onProductionSettingsChange: function(setting)
    {
      if (/taktTime/.test(setting.id))
      {
        this.model.prodLineStates.forEach(this.updateTaktTime, this);
      }
    },

    updateTaktTime: function(prodLineState)
    {
      var prodLineOuterContainer = this.getProdLineOuterContainer(prodLineState.id);

      if (!prodLineOuterContainer.empty())
      {
        var effClassName = prodLineState.getOrderEfficiencyClassName();

        if (prodLineOuterContainer.classed(effClassName))
        {
          return;
        }

        prodLineOuterContainer.classed({
          'is-eff-high': false,
          'is-eff-mid': false,
          'is-eff-low': false
        });

        if (effClassName)
        {
          prodLineOuterContainer.classed(effClassName, true);
        }
      }
    },

    updateMetricValue: function(prodLineState, metricName)
    {
      var prodLineOuterContainer = this.getProdLineOuterContainer(prodLineState.id);

      if (prodLineOuterContainer.empty())
      {
        return;
      }

      var metric = prodLineOuterContainer.select('.factoryLayout-metric-' + metricName);

      if (metric.empty())
      {
        return;
      }

      var value = this.prepareMetricValue(prodLineState.getMetricValue(metricName, this.heff));

      if (metric.text() === value)
      {
        return;
      }

      var oldLength = +metric.attr('data-length');
      var newLength = value.length;

      if (newLength === oldLength)
      {
        metric.text(value);
      }
      else
      {
        metric.style('display', 'none');
        metric.text(value);
        metric.attr('data-length', value.length);
        _.defer(function() { metric.style('display', null); });
      }
    },

    updateMetrics: function()
    {
      var view = this;

      view.model.prodLineStates.forEach(function(prodLineState)
      {
        if (view.heff)
        {
          prodLineState.recalcHeff();
          view.updateMetricValue(prodLineState, 'plannedQuantityDone');
        }
        else
        {
          view.updateTaktTime(prodLineState);
        }
      });
    },

    updateHeffStatus: function(prodLineState)
    {
      this.updateLineClassNames(prodLineState);
    },

    toggleHeff: function()
    {
      var view = this;

      view.heff = !view.heff;

      view.$el.toggleClass('is-heff', view.heff);

      view.model.prodLineStates.forEach(function(prodLineState)
      {
        if (view.heff)
        {
          prodLineState.recalcHeff();
        }

        view.updateMetricValue(prodLineState, 'plannedQuantityDone');
        view.updateMetricValue(prodLineState, 'actualQuantityDone');

        if (!view.heff)
        {
          prodLineState.set('heff', null);
        }
      });
    },

    prepareMetricValue: function(value, maxLength)
    {
      if (!maxLength)
      {
        maxLength = 3;
      }

      return value === -1 ? padString.start('?', maxLength, '?') : padString.start(value.toString(), maxLength, ' ');
    },

    handleClick: function()
    {
      var clickInfo = this.clickInfo;

      if (!clickInfo)
      {
        return;
      }

      this.clickInfo = null;

      if (clickInfo.button === 2)
      {
        return;
      }

      var newWindow = clickInfo.button === 1;

      if (clickInfo.type === 'division')
      {
        var url = '#factoryLayout;list?orgUnitType=division&orgUnitIds=' + encodeURIComponent(clickInfo.modelId);

        if (newWindow)
        {
          window.open(url);
        }
        else
        {
          this.broker.publish('router.navigate', {
            url: url,
            trigger: true,
            replace: false
          });
        }
      }
      else if (clickInfo.type === 'prodLine')
      {
        this.showProdLinePreview(clickInfo.modelId, newWindow);
      }
    },

    showProdLinePreview: function(prodLineId, newWindow)
    {
      var prodLineState = this.model.prodLineStates.get(prodLineId);

      if (!prodLineState)
      {
        return;
      }

      var prodShift = prodLineState.get('prodShift');

      if (!prodShift)
      {
        return;
      }

      var url = '#prodShifts/' + prodLineId;

      if (newWindow)
      {
        window.open(url);
      }
      else
      {
        this.broker.publish('router.navigate', {
          url: url,
          trigger: true,
          replace: false
        });
      }
    },

    bringDivisionToTop: function(divisionEl)
    {
      if (divisionEl.parentNode.lastElementChild !== divisionEl)
      {
        divisionEl.parentNode.appendChild(divisionEl);
      }
    }

  });
});
