// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/wmes-osh-common/dictionaries',
  '../views/rewards/FilterView',
  '../views/rewards/UsersView',
  '../views/rewards/PayoutView',
  'app/wmes-osh-reports/templates/rewards/page'
], function(
  viewport,
  View,
  bindLoadingMessage,
  dictionaries,
  FilterView,
  UsersView,
  PayoutView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template,

    events: {
      'click #-warning': function()
      {
        this.filterView.$id('submit').click();
      }
    },

    breadcrumbs: function()
    {
      return [
        this.t('breadcrumb'),
        this.t(`rewards:breadcrumb`)
      ];
    },

    actions: function()
    {
      return [{
        icon: 'money',
        label: this.t('rewards:payout:pageAction'),
        callback: this.showPayoutDialog.bind(this),
        privileges: 'OSH:REWARDS:MANAGE',
        disabled: !this.model.hasAnyPayouts()
      }, {
        icon: 'dollar',
        label: this.t('rewards:payouts:pageAction'),
        href: '#osh/payouts',
        privileges: 'OSH:REPORTS:MANAGE'
      }, {
        icon: 'trophy',
        label: this.t('rewards:list:pageAction'),
        href: '#osh/rewards'
      }, {
        icon: 'cogs',
        label: this.t('settings:pageAction'),
        href: '#osh/reports;settings?tab=rewards',
        privileges: 'OSH:REPORTS:MANAGE'
      }];
    },

    remoteTopics: function()
    {
      return {
        'osh.rewards.updated': function()
        {
          this.$id('warning').removeClass('hidden');
        }
      };
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.filterView = new FilterView({
        model: this.model
      });

      this.usersView = new UsersView({
        model: this.model
      });

      this.listenTo(this.filterView, 'filterChanged', this.onFilterChanged);

      this.listenToOnce(this.filterView, 'afterRender', () =>
      {
        this.filterView.$id('submit').click();
      });

      this.listenTo(this.model, 'change:loading', () =>
      {
        this.$id('warning').addClass('hidden');

        if (this.layout)
        {
          this.layout.setActions(this.actions, this);
        }
      });

      this.setView('#-filter', this.filterView);
      this.setView('#-users', this.usersView);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    load: function(when)
    {
      return when(dictionaries.load());
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
    },

    showPayoutDialog: function()
    {
      const payouts = this.model.getPayouts();

      if (!payouts.length)
      {
        return;
      }

      const dialogView = new PayoutView({
        model: this.model
      });

      this.listenToOnce(dialogView, 'saved', payout =>
      {
        this.broker.publish('router.navigate', {
          url: `/osh/payouts/${payout._id}`,
          trigger: true,
          replace: false
        });
      });

      viewport.showDialog(dialogView, this.t('rewards:payout:title'));
    }

  });
});
