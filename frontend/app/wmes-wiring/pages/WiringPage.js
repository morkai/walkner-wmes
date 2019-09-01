// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/util/embedded',
  'app/core/util/pageActions',
  '../WiringOrder',
  '../WiringOrderCollection',
  '../WiringSettingCollection',
  '../views/FilterView',
  '../views/ListView',
  '../views/DatePickerView',
  '../views/UserPickerView',
  'app/wmes-wiring/templates/page',
  'app/wmes-wiring/templates/userPageAction'
], function(
  _,
  $,
  t,
  time,
  user,
  viewport,
  View,
  bindLoadingMessage,
  embedded,
  pageActions,
  WiringOrder,
  WiringOrderCollection,
  WiringSettingCollection,
  FilterView,
  ListView,
  DatePickerView,
  UserPickerView,
  pageTemplate,
  userPageActionTemplate
) {
  'use strict';

  return View.extend({

    template: pageTemplate,

    layoutName: 'page',

    pageId: 'wiring',

    modelProperty: 'orders',

    breadcrumbs: function()
    {
      return [
        this.t('BREADCRUMBS:base'),
        {
          href: '#wiring/' + this.orders.getDateFilter(),
          label: this.orders.getDateFilter('L'),
          template: function(breadcrumb)
          {
            return '<span class="wiring-breadcrumb"><a class="fa fa-chevron-left" data-action="prev"></a>'
              + '<a href="' + breadcrumb.href + '" data-action="showPicker">' + breadcrumb.label + '</a>'
              + '<a class="fa fa-chevron-right" data-action="next"></a></span>';
          }
        }
      ];
    },

    actions: function()
    {
      var page = this;
      var actions = [];

      if (embedded.isEnabled())
      {
        actions.push({
          id: 'user',
          template: function()
          {
            return userPageActionTemplate({
              signedIn: !!page.orders.user,
              user: page.orders.user
            });
          },
          afterRender: function($action)
          {
            $action.find('.is-clickable').on('click', page.showUserPickerDialog.bind(page));
          }
        });
      }
      else
      {
        actions.push({
          type: 'link',
          icon: 'arrows-alt',
          callback: page.toggleFullscreen.bind(page)
        }, {
          href: '#wiring;settings?tab=planning',
          icon: 'cogs',
          label: page.t('PAGE_ACTIONS:settings'),
          privileges: 'WIRING:MANAGE'
        });
      }

      return actions;
    },

    localTopics: {
      'socket.connected': function()
      {
        this.$el.removeClass('wiring-is-disconnected');
      },
      'socket.disconnected': function()
      {
        this.$el.addClass('wiring-is-disconnected');
      }
    },

    remoteTopics: {
      'wiring.orders.changed.*': function(message)
      {
        var currentDate = this.orders.getDateFilter();
        var importedDate = time.utc.format(message.date, 'YYYY-MM-DD');

        if (importedDate === currentDate)
        {
          this.orders.applyChanges(message.changes);
        }
      },
      'wiring.orders.updated.*': function(changes)
      {
        var order = this.orders.get(changes._id);

        if (order)
        {
          order.set(WiringOrder.parse(changes));

          if (changes.qty != null
            || changes.qtyDone != null
            || changes.status != null)
          {
            this.orders.recountTotals();
          }
        }
      }
    },

    events: {

    },

    initialize: function()
    {
      this.onResize = _.debounce(this.resize.bind(this), 30);

      this.defineModels();
      this.defineViews();
      this.once('afterRender', this.defineBindings);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    destroy: function()
    {
      $(document.body)
        .removeClass('wiring-is-fullscreen wiring-is-embedded');

      $(window).off('.' + this.idPrefix);
      $(document).off('.' + this.idPrefix);
    },

    defineModels: function()
    {
      this.settings = bindLoadingMessage(new WiringSettingCollection(null, {pubsub: this.pubsub}), this);

      this.orders = bindLoadingMessage(WiringOrderCollection.forDate(this.options.date, {
        mrp: this.options.mrp,
        status: this.options.status,
        settings: this.settings,
        user: JSON.parse(sessionStorage.getItem('WMES_WIRING_USER') || 'null')
      }), this);
    },

    defineViews: function()
    {
      this.filterView = new FilterView({
        orders: this.orders
      });

      this.listView = new ListView({
        orders: this.orders
      });

      this.setView('#-filter', this.filterView);
      this.setView('#-list', this.listView);
    },

    defineBindings: function()
    {
      var page = this;
      var idPrefix = page.idPrefix;

      page.listenTo(page.orders, 'reset', page.onOrdersReset);
      page.listenTo(page.orders, 'filter:status filter:mrp', page.onFilter);

      $(document)
        .on('click.' + idPrefix, '.wiring-breadcrumb', page.onBreadcrumbsClick.bind(page));

      $(window)
        .on('resize.' + idPrefix, page.onResize);

      embedded.ready();
      page.onOrdersReset();
    },

    load: function(when)
    {
      return when(
        this.settings.fetch({reset: true}),
        this.orders.fetch({reset: true})
      );
    },

    getTemplateData: function()
    {
      return {
        embedded: embedded.isEnabled()
      };
    },

    serializeTotals: function()
    {
      return this.orders.serializeTotals();
    },

    beforeRender: function()
    {
      document.body.classList.toggle('wiring-is-fullscreen', this.isFullscreen());
      document.body.classList.toggle('wiring-is-embedded', embedded.isEnabled());
    },

    afterRender: function()
    {
      embedded.render(this);
      this.resize();
    },

    resize: function()
    {
      document.body.classList.toggle('wiring-is-fullscreen', this.isFullscreen());
    },

    isFullscreen: function()
    {
      return embedded.isEnabled()
        || this.options.fullscreen
        || window.innerWidth <= 800
        || (window.outerWidth === window.screen.width && window.outerHeight === window.screen.height);
    },

    toggleFullscreen: function()
    {
      this.options.fullscreen = !this.options.fullscreen;

      this.updateUrl();
      this.resize();
    },

    updateUrl: function()
    {
      if (!embedded.isEnabled())
      {
        this.broker.publish('router.navigate', {
          url: this.genClientUrl(),
          trigger: false,
          replace: true
        });
      }
    },

    genClientUrl: function()
    {
      var query = [];

      if (this.orders.filters.mrp !== 'all')
      {
        query.push('mrp=' + this.orders.filters.mrp);
      }

      if (this.orders.filters.status.length)
      {
        query.push('status=' + this.orders.filters.status);
      }

      if (this.options.fullscreen)
      {
        query.push('fullscreen=1');
      }

      return this.orders.genClientUrl() + (query.length ? '?' : '') + query.join('&');
    },

    onOrdersReset: function()
    {
      var page = this;

      if (page.layout)
      {
        page.layout.setBreadcrumbs(page.breadcrumbs, page);
      }

      this.updateUrl();
    },

    onFilter: function()
    {
      this.updateUrl();
    },

    onBreadcrumbsClick: function(e)
    {
      if (e.target.tagName !== 'A')
      {
        return;
      }

      if (e.target.classList.contains('disabled'))
      {
        return false;
      }

      if (e.target.dataset.action === 'showPicker')
      {
        this.showDatePickerDialog();
      }
      else
      {
        this.selectNonEmptyDate(e.target.dataset.action);
      }

      return false;
    },

    setDate: function(newDate)
    {
      this.orders.setDateFilter(newDate);

      this.promised(this.orders.fetch({reset: true}));
    },

    showDatePickerDialog: function()
    {
      var dialogView = new DatePickerView({
        model: {
          date: this.orders.getDateFilter()
        }
      });

      this.listenTo(dialogView, 'picked', function(newDate)
      {
        viewport.closeDialog();

        if (newDate !== this.orders.getDateFilter())
        {
          this.setDate(newDate);
        }
      });

      viewport.showDialog(dialogView);
    },

    selectNonEmptyDate: function(dir)
    {
      $('.wiring-breadcrumb').find('a').addClass('disabled');

      var page = this;
      var date = +page.orders.getDateFilter('x');
      var month = 30 * 24 * 3600 * 1000;
      var url = '/wiring/orders?limit(1)&select(date)';

      if (dir === 'prev')
      {
        url += '&sort(-date)&date<' + date + '&date>' + (date - month);
      }
      else
      {
        url += '&sort(date)&date>' + date + '&date<' + (date + month);
      }

      var req = page.ajax({url: url});

      req.done(function(res)
      {
        if (res.totalCount)
        {
          page.setDate(time.utc.format(res.collection[0].date, 'YYYY-MM-DD'));
        }
        else
        {
          viewport.msg.show({
            type: 'warning',
            time: 2500,
            text: page.t('MSG:date:empty')
          });
        }
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 2500,
          text: page.t('MSG:date:failure')
        });
      });

      req.always(function()
      {
        if (page.layout)
        {
          page.layout.setBreadcrumbs(page.breadcrumbs, page);
        }
      });
    },

    showUserPickerDialog: function()
    {
      var page = this;
      var dialogView = new UserPickerView({
        model: {
          user: page.orders.user
        }
      });

      page.listenTo(dialogView, 'picked', function(user)
      {
        if (user)
        {
          sessionStorage.setItem('WMES_WIRING_USER', JSON.stringify(user));
        }
        else
        {
          sessionStorage.removeItem('WMES_WIRING_USER');
        }

        page.orders.user = user;

        if (page.layout)
        {
          page.layout.setActions(page.actions, page);
        }

        viewport.closeDialog();
      });

      viewport.showDialog(dialogView);
    }

  });
});
