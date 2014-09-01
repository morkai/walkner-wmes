// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'd3',
  'screenfull',
  'app/viewport',
  'app/core/View',
  'app/factoryLayout/templates/list',
  './ProdLineStateListItemView'
], function(
  _,
  $,
  d3,
  screenfull,
  viewport,
  View,
  template,
  ProdLineStateListItemView
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

    },

    initialize: function()
    {
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onResize = _.debounce(this.onResize.bind(this), 16);

      this.lastWidth = null;

      $('body').on('keydown', this.onKeyDown);
      $(window).on('resize', this.onResize);
      screenfull.onchange = _.debounce(this.onFullscreen.bind(this), 16);
    },

    destroy: function()
    {
      $('body').off('keydown', this.onKeyDown);
      $(window).off('resize', this.onResize);
      screenfull.onchange = function() {};
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'sync', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'sync', this.render);

      this.getProdLineStates().forEach(this.renderProdLineState, this);
    },

    getProdLineStates: function()
    {
      if (this.listOptions.hasDivision())
      {
        return this.model.prodLineStates.getForDivision(this.listOptions.get('division'));
      }

      var prodLineStates = [];
      var prodLines = this.listOptions.get('prodLines');

      if (Array.isArray(prodLines))
      {
        for (var i = 0, l = prodLines.length; i < l; ++i)
        {
          var prodLineState = this.model.prodLineStates.get(prodLines[i]);

          if (prodLineState)
          {
            prodLineStates.push(prodLineState);
          }
        }
      }

      return prodLineStates;
    },

    renderProdLineState: function(prodLineState)
    {
      this.insertView(new ProdLineStateListItemView({model: prodLineState, keep: false})).render();
    },

    onKeyDown: function(e)
    {
      if (e.which === 122 && !screenfull.isFullscreen)
      {
        e.preventDefault();

        screenfull.request(this.el.parentNode);
      }
    },

    onResize: function()
    {
      if (window.innerWidth !== this.lastWidth)
      {
        this.lastWidth = window.innerWidth;

        this.getViews().each(function(view) { view.resize(); });
      }
    },

    onFullscreen: function()
    {

    }

  });
});
