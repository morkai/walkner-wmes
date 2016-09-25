define([
  'jquery',
  'd3',
  'app/core/View',
  'app/factoryLayout/templates/layout'
], function(
  $,
  d3,
  View,
  template
) {
  'use strict';



  return View.extend({

    template: template,

    initialize: function()
    {
      this.onWindowResize = this.resize.bind(this);

      $(window).on('resize', this.onWindowResize);
    },

    destroy: function()
    {
      $('.ft').show();
    },

    afterRender: function()
    {
      $('.ft').hide();

      this.$el.css({
        border: '1px solid #ddd',
        backgroundColor: '#f8f8f8',
        backgroundImage: 'url(/app/factoryLayout/assets/grid.png)',
        backgroundPosition: '1px 1px',
        boxShadow: '0px 0px 3px 0px #ddd',
        pointerEvents: 'all'
      });

      this.svgEl = d3.select(this.el);
      this.outerContainerEl = this.svgEl.append('g').attr('transform', 'translate(0.5,0.5)');
      this.innerContainerEl = this.outerContainerEl.append('rect').style({fill: 'transparent'});
      this.canvasEl = this.outerContainerEl.append('g');

      this.resize();

      /*
      this.canvasEl.append('rect')
        .attr('class', 'factoryLayout-area')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', '1918px')
        .attr('height', '1078px');
      */

      this.canvasEl.append('rect')
        .attr('class', 'factoryLayout-10x10')
        .attr('x', '0')
        .attr('y', '0')
        .attr('width', '10')
        .attr('height', '10');

      this.canvasEl.append('rect')
        .attr('class', 'factoryLayout-10x10')
        .attr('x', '10')
        .attr('y', '10')
        .attr('width', '100')
        .attr('height', '100');

      this.canvasEl.append('rect')
        .attr('class', 'factoryLayout-10x10')
        .attr('x', '110')
        .attr('y', '110')
        .attr('width', '60')
        .attr('height', '60');

      this.canvasEl.append('line')
        .attr('class', 'factoryLayout-10x10')
        .attr('x1', '40')
        .attr('y1', '39')
        .attr('x2', '40')
        .attr('y2', '79');
    },

    getSize: function()
    {
      var w = this.$el.parent().outerWidth();
      var h = window.innerHeight
        - $('.hd').outerHeight(true)
        - (parseInt($('.bd').css('marginTop'), 10) || 0) * 2
        - 5;

      return {width: w, height: h};
    },

    resize: function()
    {
      var size = this.getSize();

      this.svgEl.attr(size);
      this.innerContainerEl.attr(size);
    }

  });
});
