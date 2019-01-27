// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/time',
  'app/core/Model',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/planning/Plan',
  'app/planning/PlanSettings',
  'app/planning/PlanDisplayOptions',
  '../settings',
  '../WhOrderCollection',
  '../views/WhProblemFilterView',
  '../views/WhProblemListView',
  'app/wh/templates/problemListPage'
], function(
  _,
  $,
  t,
  currentUser,
  viewport,
  time,
  Model,
  View,
  bindLoadingMessage,
  Plan,
  PlanSettings,
  PlanDisplayOptions,
  whSettings,
  WhOrderCollection,
  WhProblemFilterView,
  WhProblemListView,
  pageTemplate
) {
  'use strict';

  return View.extend({

    template: pageTemplate,

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: this.t('BREADCRUMBS:base')
        },
        {
          label: this.t('BREADCRUMBS:problems')
        }
      ];
    },

    actions: function()
    {
      var page = this;

      if (window.IS_EMBEDDED)
      {
        return [];
      }

      return [
        {
          label: page.t('PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'WH:MANAGE',
          href: '#wh/settings'
        }
      ];
    },

    remoteTopics: {
      'wh.orders.changed.*': function(message)
      {
        var page = this;

        message.changes.changed.forEach(function(changes)
        {
          var whOrder = page.whOrders.get(changes._id);

          if (!whOrder)
          {
            return;
          }

          if (changes.status && changes.status !== 'problem')
          {
            page.whOrders.remove(whOrder);
          }
          else
          {
            whOrder.set(changes);
          }
        });

        message.changes.removed.forEach(function(id)
        {
          page.whOrders.remove(id);
        });
      },
      'wh.orders.updated': function(message)
      {
        var page = this;

        message.orders.forEach(function(newWhOrder)
        {
          var oldWhOrder = page.whOrders.get(newWhOrder._id);

          if (oldWhOrder)
          {
            if (newWhOrder.status !== 'problem')
            {
              page.whOrders.remove(oldWhOrder);

              return;
            }

            oldWhOrder.set(newWhOrder);

            return;
          }

          if (newWhOrder.status === 'problem')
          {
            page.whOrders.add(newWhOrder);
          }
        });
      }
    },

    localTopics: {
      'socket.connected': function()
      {
        this.$el.removeClass('wh-is-disconnected');

        this.load();
      },
      'socket.disconnected': function()
      {
        this.$el.addClass('wh-is-disconnected');
      }
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    destroy: function()
    {
      $(document).off('.' + this.idPrefix);
      $(window).off('.' + this.idPrefix);

      whSettings.release();
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    defineModels: function()
    {
      var page = this;

      page.displayOptions = PlanDisplayOptions.fromLocalStorage({}, {
        storageKey: 'PLANNING:DISPLAY_OPTIONS:WH'
      });

      page.whSettings = bindLoadingMessage(whSettings.acquire(), page);

      page.whOrders = bindLoadingMessage(new WhOrderCollection(null, {
        date: null,
        rqlQuery: 'sort(startTime)&limit(0)&status=problem'
      }), page);

      page.model = page.whOrders;
    },

    defineViews: function()
    {
      this.filterView = new WhProblemFilterView({
        displayOptions: this.displayOptions
      });

      this.listView = new WhProblemListView({
        whSettings: this.whSettings,
        whOrders: this.whOrders
      });

      // this.setView('#-filter', this.filterView);
      this.setView('#-list', this.listView);
    },

    defineBindings: function()
    {
      var page = this;

      page.listenTo(page.displayOptions, 'change:useDarkerTheme', page.onDarkerThemeChanged);
    },

    load: function(when)
    {
      return when(
        this.whSettings.fetchIfEmpty(),
        this.whOrders.fetch({reset: true})
      );
    },

    getTemplateData: function()
    {
      return {
        darker: this.displayOptions.isDarkerThemeUsed()
      };
    },

    afterRender: function()
    {
      whSettings.acquire();
    },

    onDarkerThemeChanged: function()
    {
      this.$el.toggleClass('planning-darker', this.displayOptions.isDarkerThemeUsed());
    }

  });
});
