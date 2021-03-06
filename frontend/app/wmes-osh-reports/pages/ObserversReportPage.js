// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/wmes-osh-common/dictionaries',
  '../views/observers/FilterView',
  '../views/observers/OrgUnitsView',
  '../views/observers/UsersView',
  'app/wmes-osh-reports/templates/observers/page'
], function(
  View,
  bindLoadingMessage,
  dictionaries,
  ObserversFilterView,
  ObserversOrgUnitsView,
  ObserversUsersView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template,

    breadcrumbs: function()
    {
      return [
        this.t('breadcrumb'),
        this.t(`observers:breadcrumb`)
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.filterView = new ObserversFilterView({
        model: this.model
      });

      this.orgUnitsView = new ObserversOrgUnitsView({
        model: this.model
      });

      this.usersView = new ObserversUsersView({
        model: this.model
      });

      this.listenTo(this.filterView, 'filterChanged', this.onFilterChanged);

      this.setView('#-filter', this.filterView);
      this.setView('#-orgUnits', this.orgUnitsView);
      this.setView('#-users', this.usersView);
    },

    load: function(when)
    {
      return when(
        'datatables.net',
        'datatables-fixedcolumns',
        dictionaries.load().done(() => this.model.fetch())
      );
    },

    onFilterChanged: function(newRqlQuery)
    {
      this.model.rqlQuery = newRqlQuery;

      this.promised(this.model.fetch());

      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl(),
        trigger: false,
        replace: true
      });
    }

  });
});
