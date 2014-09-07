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

    initialize: function()
    {
      this.onKeyDown = this.onKeyDown.bind(this);
      this.onResize = _.debounce(this.onResize.bind(this), 16);
      this.toggleIsEmptyAsync = _.debounce(this.toggleIsEmpty, 1);

      this.lastWidth = null;

      this.listenTo(this.displayOptions, 'change:orgUnitType change:orgUnitIds', _.debounce(this.render, 1));
      this.listenTo(this.model.settings, 'change', this.onSettingsChange);

      $('body').on('keydown', this.onKeyDown);
      $(window).on('resize', this.onResize);
    },

    destroy: function()
    {
      $('body').off('keydown', this.onKeyDown);
      $(window).off('resize', this.onResize);
    },

    beforeRender: function()
    {
      this.stopListening(this.model.prodLineStates, 'reset', this.render);
      this.stopListening(this.model.prodLineStates, 'change:online change:state', this.toggleIsEmptyAsync);
      this.stopListening(this.displayOptions, 'change:statuses change:states', this.toggleIsEmptyAsync);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model.prodLineStates, 'reset', this.render);

      this.getProdLineStates().forEach(this.renderProdLineState, this);

      this.listenTo(this.model.prodLineStates, 'change:online change:state', this.toggleIsEmptyAsync);
      this.listenTo(this.displayOptions, 'change:statuses change:states', this.toggleIsEmptyAsync);

      this.toggleIsEmpty();
    },

    getProdLineStates: function()
    {
      return this.model.prodLineStates.getByOrgUnit(
        this.displayOptions.get('orgUnitType'),
        this.displayOptions.get('orgUnitIds'),
        this.model.settings.isBlacklisted.bind(this.model.settings)
      );
    },

    renderProdLineState: function(prodLineState)
    {
      var listItemView = new ProdLineStateListItemView({
        keep: false,
        model: prodLineState,
        displayOptions: this.displayOptions
      });

      this.insertView(listItemView).render();
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

    onSettingsChange: function(setting)
    {
      if (/blacklist/.test(setting.id))
      {
        this.render();
      }
    },

    toggleIsEmpty: function()
    {
      this.$el.toggleClass('is-empty', this.$('tbody:visible').length === 0);
    }

  });
});
