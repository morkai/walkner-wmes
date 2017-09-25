// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/Model',
  'app/core/View',
  'app/users/ownMrps',
  'app/planning/Plan',
  'app/planning/PlanSettings',
  'app/planning/views/PlanFilterView',
  'app/planning/views/PlanMrpView',
  'app/planning/templates/planPage'
], function(
  $,
  t,
  viewport,
  Model,
  View,
  ownMrps,
  Plan,
  PlanSettings,
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
      return [
        {
          label: t.bound('planning', 'PAGE_ACTION:changes'),
          icon: 'list-ol',
          href: '#planning/changes?sort(-date)&plan=' + this.plan.id
        },
        {
          label: t.bound('planning', 'PAGE_ACTION:settings'),
          icon: 'cogs',
          privileges: 'PLANNING:MANAGE',
          href: '#planning/settings/' + this.plan.id
        }
      ];
    },

    remoteTopics: {
      'planning.generator.finished': function(message)
      {
        if (message.date === this.plan.id)
        {
          this.reload();
        }
      }
    },

    initialize: function()
    {
      this.defineModels();
      this.defineViews();
      this.defineBindings();
    },

    setUpLayout: function(layout)
    {
      this.layout = layout;
    },

    defineModels: function()
    {
      this.planningOptions = new Model(JSON.parse(localStorage.getItem('PLANNING:OPTIONS') || '{}'));

      this.settings = PlanSettings.forDate(this.options.date);

      this.plan = new Plan({
        _id: this.settings.id,
        mrpFilter: this.options.mrpFilter
      }, {
        cache: true,
        urlQuery: 'pceTimes=0&minMaxDates=1',
        options: this.planningOptions,
        settings: this.settings
      });
    },

    defineViews: function()
    {
      this.filterView = new PlanFilterView({model: this.plan});

      this.setView('#-filter', this.filterView);
    },

    defineBindings: function()
    {
      this.listenTo(this.planningOptions, 'change', function()
      {
        localStorage.setItem('PLANNING:OPTIONS', JSON.stringify(this.planningOptions.toJSON()));
      });

      this.listenTo(this.plan, 'change:_id', this.onDateFilterChanged);
      this.listenTo(this.plan, 'change:mrpFilter', this.onMrpFilterChanged);
      this.listenTo(this.plan, 'change:loading', this.onLoadingChanged);
    },

    load: function(when)
    {
      return when(
        ownMrps.load(this),
        this.loadStyles(),
        this.settings.fetch(),
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

      page.promised(page.settings.fetch()).then(
        function()
        {
          page.promised(page.plan.fetch()).then(
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
      var filter = this.plan.getFilter();

      this.broker.publish('router.navigate', {
        url: '/planning/plans/' + filter.date + '?mrp=' + filter.mrp,
        replace: true,
        trigger: false
      });
    },

    renderMrps: function()
    {
      var page = this;

      page.removeView('#-mrps');

      page.plan.serializeMrps().forEach(function(planMrp)
      {
        page.insertView('#-mrps', new PlanMrpView({model: planMrp})).render();
      });

      var anyMrps = this.$id('mrps')[0].childElementCount > 0;

      this.$id('empty').toggleClass('hidden', anyMrps);
      this.$id('mrps').toggleClass('hidden', !anyMrps);
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

    onMrpFilterChanged: function()
    {
      this.updateUrl();
      this.renderMrps();
    },

    onLoadingChanged: function()
    {
      if (!this.plan.get('loading'))
      {
        this.renderMrps();
      }
    }

  });
});
