// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/pages/FilteredListPage',
  'app/prodShifts/ProdShift',
  'app/prodShiftOrders/ProdShiftOrder',
  '../views/ProdLogEntryFilterView',
  '../views/ProdLogEntryListView'
], function(
  _,
  FilteredListPage,
  ProdShift,
  ProdShiftOrder,
  FilterView,
  ListView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: FilterView,
    ListView: ListView,

    actions: null,

    breadcrumbs: function()
    {
      if (this.prodShift)
      {
        return [{
          href: this.prodShift.genClientUrl(),
          label: this.t('BREADCRUMBS:browse:shift', {
            shift: this.prodShift.getLabel()
          })
        }];
      }

      if (this.prodShiftOrder)
      {
        return [{
          href: this.prodShiftOrder.genClientUrl(),
          label: this.t('BREADCRUMBS:browse:order', {
            order: this.prodShiftOrder.getLabel()
          })
        }];
      }

      return FilteredListPage.prototype.breadcrumbs.apply(this, arguments);
    },

    getFilterViewOptions: function()
    {
      return _.assign(FilteredListPage.prototype.getFilterViewOptions.apply(this, arguments), {
        prodShift: this.options.prodShift,
        prodShiftOrder: this.options.prodShiftOrder
      });
    },

    defineModels: function()
    {
      FilteredListPage.prototype.defineModels.apply(this, arguments);

      this.prodShift = !this.options.prodShift
        ? null
        : new ProdShift({_id: this.options.prodShift});

      this.prodShiftOrder = !this.options.prodShiftOrder
        ? null
        : new ProdShiftOrder({_id: this.options.prodShiftOrder});
    },

    load: function(when)
    {
      return when(
        this.collection.fetch({reset: true}),
        this.prodShift ? this.prodShift.fetch() : null,
        this.prodShiftOrder ? this.prodShiftOrder.fetch() : null
      );
    }

  });
});
