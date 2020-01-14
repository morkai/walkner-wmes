// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/core/util/pageActions',
  '../views/XDataTabsView',
  '../views/XDataViewerView',
  'app/sapLaborTimeFixer/templates/details'
], function(
  _,
  $,
  viewport,
  View,
  pageActions,
  XDataTabsView,
  XDataViewerView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        {label: this.t('BREADCRUMB:browse'), href: this.model.genClientUrl('base')},
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      return [pageActions.delete(this.model)];
    },

    initialize: function()
    {
      this.defineViews();
      this.defineBindings();

      this.setView('#-tabs', this.tabsView);
      this.insertView('#-viewer', this.currentView);
      this.insertView('#-viewer', this.draftView);
      this.insertView('#-viewer', this.diffView);
    },

    destroy: function()
    {

    },

    defineViews: function()
    {
      this.tabsView = new XDataTabsView({model: this.model});

      var height = this.calcHeight();

      this.currentView = new XDataViewerView({
        model: this.model,
        height: height
      });
      this.draftView = new XDataViewerView({
        model: this.model,
        height: height
      });
      this.diffView = new XDataViewerView({
        model: this.model,
        height: height
      });
    },

    defineBindings: function()
    {
      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'change:workCenter change:deps', this.updateUrl);
      });

      $(window).on('resize.' + this.idPrefix, _.debounce(this.resize.bind(this), 30));
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    afterRender: function()
    {
      this.resize();
    },

    updateUrl: function()
    {
      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl()
          + '?workCenter=' + encodeURIComponent(this.model.getSelectedWorkCenter()._id)
          + '&deps=' + encodeURIComponent(this.model.getSelectedDeps().join(',')),
        trigger: false,
        replace: true
      });
    },

    resize: function()
    {
      var height = this.calcHeight();

      this.currentView.resize(height);
      this.draftView.resize(height);
      this.diffView.resize(height);
    },

    calcHeight: function()
    {
      var height = window.innerHeight;

      height -= this.tabsView.$el.outerHeight() || 83;
      height -= $('.hd').outerHeight(true) || 87;
      height -= $('.ft').outerHeight(true) || 66;
      height -= 15;

      return height;
    }

  });
});
