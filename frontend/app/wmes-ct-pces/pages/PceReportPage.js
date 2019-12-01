// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/wmes-ct-lines/LineCollection',
  '../PceReport',
  '../views/pceReport/FilterView',
  '../views/pceReport/ProductView',
  'app/wmes-ct-pces/templates/pceReport/page'
], function(
  _,
  t,
  View,
  bindLoadingMessage,
  LineCollection,
  PceReport,
  FilterView,
  ProductView,
  template
) {
  'use strict';

  return View.extend({

    pageClassName: 'page-max-flex',

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        {href: '#ct', label: this.t('BREADCRUMBS:base')},
        this.t('BREADCRUMBS:pceReport')
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);
      this.lines = bindLoadingMessage(new LineCollection(null, {rqlQuery: 'select(_id)&limit(0)'}), this);

      this.setView('#-filter', new FilterView({
        model: this.model,
        lines: this.lines
      }));

      this.listenTo(this.model, 'filtered', this.onFiltered);

      this.listenToOnce(this, 'afterRender', function()
      {
        this.listenTo(this.model.products, 'reset', function() { this.renderProducts(true); });
      });
    },

    load: function(when)
    {
      return when(
        this.lines.fetch({reset: true}),
        this.model.fetch()
      );
    },

    onFiltered: function()
    {
      this.promised(this.model.fetch());

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    },

    beforeRender: function()
    {
      this.renderProducts(false);
    },

    renderProducts: function(render)
    {
      var page = this;

      page.removeView('#-products');

      page.model.products.forEach(function(product)
      {
        var productView = new ProductView({
          model: page.model,
          product: product
        });

        page.insertView('#-products', productView);

        if (render)
        {
          productView.render();
        }
      });
    }

  });
});
