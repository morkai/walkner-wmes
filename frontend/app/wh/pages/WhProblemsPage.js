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
  'app/core/util/embedded',
  'app/planning/Plan',
  'app/planning/PlanSettings',
  'app/planning/PlanDisplayOptions',
  '../settings',
  '../WhOrderCollection',
  '../views/WhProblemFilterView',
  '../views/WhProblemListView',
  '../views/WhProblemDetailsView',
  'app/wh/templates/problems/listPage'
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
  embedded,
  Plan,
  PlanSettings,
  PlanDisplayOptions,
  whSettings,
  WhOrderCollection,
  WhProblemFilterView,
  WhProblemListView,
  WhProblemDetailsView,
  pageTemplate
) {
  'use strict';

  return View.extend({

    template: pageTemplate,

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {label: this.t('BREADCRUMB:base'), href: embedded.isEnabled() ? null : '#wh/pickup/0d'},
        this.t('BREADCRUMB:problems')
      ];
    },

    remoteTopics: {
      'orders.updated.*': function(message)
      {
        var problemView = viewport.currentDialog;

        if (!(problemView instanceof WhProblemDetailsView))
        {
          return;
        }

        var change = message.change;
        var newValues = change.newValues;

        var sapOrder = problemView.plan.sapOrders.get(message._id);

        if (!sapOrder)
        {
          return;
        }

        var attrs = _.clone(newValues);

        if (!_.isEmpty(change.comment))
        {
          attrs.comments = sapOrder.get('comments').concat({
            source: change.source,
            time: change.time,
            user: change.user,
            text: change.comment,
            delayReason: newValues.delayReason
          });
        }

        sapOrder.set(attrs);
      },
      'old.wh.orders.changed.*': function(message)
      {
        var page = this;

        message.changes.changed.forEach(function(changes)
        {
          var whOrder = page.whOrders.get(changes._id);

          if (!whOrder)
          {
            if (viewport.currentDialog instanceof WhProblemDetailsView
              && viewport.currentDialog.model.id === changes._id)
            {
              whOrder = viewport.currentDialog.model;
            }
            else
            {
              return;
            }
          }

          whOrder.set(changes);

          if (changes.status && changes.status !== 'problem')
          {
            page.whOrders.remove(whOrder);
          }
        });

        message.changes.removed.forEach(function(id)
        {
          page.whOrders.remove(id);
        });
      },
      'old.wh.orders.updated': function(message)
      {
        var page = this;

        message.updated.forEach(function(newWhOrder)
        {
          var oldWhOrder = page.whOrders.get(newWhOrder._id);
          var reAdd = false;

          if (!oldWhOrder
            && viewport.currentDialog instanceof WhProblemDetailsView
            && viewport.currentDialog.model.id === newWhOrder._id)
          {
            oldWhOrder = viewport.currentDialog.model;
            reAdd = true;
          }

          if (oldWhOrder)
          {
            oldWhOrder.set(newWhOrder);

            if (oldWhOrder.get('status') !== 'problem')
            {
              page.whOrders.remove(oldWhOrder);
            }
            else if (reAdd)
            {
              page.whOrders.add(oldWhOrder);
            }

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

        this.load(_.noop);
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
        embedded: embedded.isEnabled(),
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

      page.listenToOnce(page, 'afterRender', function()
      {
        window.parent.postMessage({type: 'ready', app: window.WMES_APP_ID}, '*');
      });
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
      embedded.render(this);
    },

    onDarkerThemeChanged: function()
    {
      this.$el.toggleClass('planning-darker', this.displayOptions.isDarkerThemeUsed());
    }

  });
});
