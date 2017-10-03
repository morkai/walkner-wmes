// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/time',
  'app/core/Model',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/users/ownMrps',
  'app/planning/Plan',
  'app/planning/PlanSettings',
  'app/planning/PlanDisplayOptions',
  'app/planning/views/PlanFilterView',
  'app/planning/views/PlanMrpView',
  'app/planning/templates/planPage'
], function(
  _,
  $,
  t,
  viewport,
  time,
  Model,
  View,
  bindLoadingMessage,
  ownMrps,
  Plan,
  PlanSettings,
  PlanDisplayOptions,
  PlanFilterView,
  PlanMrpView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          href: '#planning/plans',
          label: t.bound('planning', 'BREADCRUMBS:base')
        },
        this.plan.getLabel()
      ];
    },

    actions: function()
    {
      var page = this;

      return [
        {
          label: t.bound('planning', 'PAGE_ACTION:changes'),
          icon: 'list-ol',
          href: '#planning/changes?sort(-date)&plan=' + page.plan.id
        },
        {
          label: t.bound('planning', 'PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'PLANNING:MANAGE',
          href: '#planning/settings/' + page.plan.id,
          className: page.plan.isEditable() ? '' : 'disabled',
          callback: function(e)
          {
            if (e.button === 0 && !e.ctrlKey && page.plan.isEditable())
            {
              page.broker.publish('router.navigate', {
                url: '/planning/settings/' + page.plan.id + '?back=1',
                trigger: true,
                replace: false
              });

              return false;
            }
          }
        }
      ];
    },

    remoteTopics: {
      'planning.changes.created': function(planChange)
      {
        this.plan.applyChange(planChange);
      },
      'planning.generator.started': function(message)
      {
        if (message.date === this.plan.id)
        {
          viewport.msg.loading();
        }
      },
      'planning.generator.finished': function(message)
      {
        if (message.date === this.plan.id)
        {
          viewport.msg.loaded();
        }
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
      $(window).off('.' + this.idPrefix);
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    defineModels: function()
    {
      this.plan = new Plan({_id: this.options.date}, {
        displayOptions: PlanDisplayOptions.fromLocalStorage({
          mrps: this.options.mrps
        }),
        settings: PlanSettings.fromDate(this.options.date),
        minMaxDates: true,
        pceTimes: false
      });

      bindLoadingMessage(this.plan, this, 'MSG:LOADING_PLAN_FAILURE');
      bindLoadingMessage(this.plan.settings, this, 'MSG:LOADING_SETTINGS_FAILURE');

      window.plan = this.plan;
    },

    defineViews: function()
    {
      this.filterView = new PlanFilterView({plan: this.plan});

      this.setView('#-filter', this.filterView);
    },

    defineBindings: function()
    {
      var page = this;
      var plan = page.plan;
      var renderMrps = _.after(2, _.debounce(page.renderMrps.bind(page), 1));

      page.listenTo(plan, 'change:loading', page.onLoadingChanged);
      page.listenTo(plan, 'change:_id', page.onDateFilterChanged);

      page.listenTo(plan.displayOptions, 'change:mrps', page.onMrpsFilterChanged);

      page.listenTo(plan.settings, 'changed', page.onSettingsChanged);

      page.listenTo(plan.mrps, 'reset', renderMrps);

      $(window).on('resize.' + this.idPrefix, _.debounce(this.onWindowResize.bind(this), 16));
    },

    load: function(when)
    {
      return when(
        ownMrps.load(this),
        this.loadStyles(),
        this.plan.settings.fetch(),
        this.plan.fetch()
      );
    },

    loadStyles: function()
    {
      var deferred = $.Deferred(); // eslint-disable-line new-cap
      var $head = $('head');

      if ($head.find('link[href$="plan.css"]').length)
      {
        deferred.resolve();
      }
      else
      {
        $('<link rel="stylesheet" href="/app/planning/assets/plan.css">')
          .on('load', function() { deferred.resolve(); })
          .appendTo($head);
      }

      return deferred.promise();
    },

    afterRender: function()
    {
      this.renderMrps();
    },

    reload: function()
    {
      var page = this;
      var plan = page.plan;

      plan.set('loading', true);

      page.promised(plan.settings.set('_id', plan.id).fetch()).then(
        function()
        {
          page.promised(plan.fetch()).then(
            plan.set.bind(plan, 'loading', false),
            loadingFailed
          );
        },
        loadingFailed
      );

      function loadingFailed()
      {
        plan.set('loading', false);

        viewport.msg.loadingFailed();
      }
    },

    updateUrl: function()
    {
      this.broker.publish('router.navigate', {
        url: '/planning/plans/' + this.plan.id + '?mrps=' + this.plan.displayOptions.get('mrps'),
        replace: true,
        trigger: false
      });
    },

    renderMrps: function()
    {
      var page = this;

      page.removeView('#-mrps');

      page.plan.mrps.forEach(function(mrp)
      {
        page.insertView('#-mrps', new PlanMrpView({plan: page.plan, mrp: mrp})).render();
      });

      this.$id('empty').toggleClass('hidden', page.plan.mrps.length > 0);
      this.$id('mrps').toggleClass('hidden', page.plan.mrps.length === 0);
    },

    onDateFilterChanged: function()
    {
      if (this.layout)
      {
        this.layout.setBreadcrumbs(this.breadcrumbs, this);
        this.layout.setActions(this.actions, this);
      }

      this.updateUrl();
      this.reload();
    },

    onMrpsFilterChanged: function()
    {
      this.updateUrl();
      this.plan.mrps.reset();
    },

    onLoadingChanged: function()
    {
      if (!this.plan.get('loading'))
      {
        this.renderMrps();
      }
    },

    onSettingsChanged: function(changed)
    {
      if (changed.reset)
      {
        this.plan.mrps.reset();
      }
    },

    onWindowResize: function(e)
    {
      this.broker.publish('planning.windowResized', e);
    }

  });
});
