// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/wmes-osh-common/dictionaries',
  '../views/engagement/FilterView',
  '../views/engagement/OrgUnitsView',
  '../views/engagement/BrigadesView',
  '../views/engagement/UsersView',
  'app/wmes-osh-reports/templates/engagement/page'
], function(
  View,
  bindLoadingMessage,
  dictionaries,
  FilterView,
  OrgUnitsView,
  BrigadesView,
  UsersView,
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
        this.t(`engagement:breadcrumb`)
      ];
    },

    actions: function()
    {
      return [{
        label: this.t('settings:pageAction'),
        icon: 'cogs',
        privileges: 'OSH:DICTIONARIES:MANAGE',
        href: '#osh/reports;settings?tab=engagement'
      }];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.filterView = new FilterView({
        model: this.model
      });

      this.orgUnitsView = new OrgUnitsView({
        model: this.model
      });

      this.brigadesView = new BrigadesView({
        model: this.model
      });

      this.usersView = new UsersView({
        model: this.model
      });

      this.listenTo(this.filterView, 'filterChanged', this.onFilterChanged);

      this.setView('#-filter', this.filterView);
      this.setView('#-orgUnits', this.orgUnitsView);
      this.setView('#-brigades', this.brigadesView);
      this.setView('#-users', this.usersView);
    },

    load: function(when)
    {
      return when(dictionaries.load().done(() => this.model.fetch()));
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
