// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../views/DailyMrpPlanFilterView',
  '../views/DailyMrpPlanView',
  '../views/DailyMrpPlanImportView',
  'app/hourlyPlans/templates/dailyMrpPlans/page'
], function(
  _,
  $,
  t,
  time,
  viewport,
  View,
  bindLoadingMessage,
  DailyMrpPlanFilterView,
  DailyMrpPlanView,
  DailyMrpPlanImportView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    actions: null,

    breadcrumbs: [
      {href: '#hourlyPlans', label: t.bound('hourlyPlans', 'BREADCRUMBS:browse')},
      t.bound('hourlyPlans', 'BREADCRUMBS:planning')
    ],

    events: {



    },

    initialize: function()
    {
      var idPrefix = this.idPrefix;
      var handleDragEvent = this.handleDragEvent.bind(this);

      this.model = bindLoadingMessage(this.model.subscribe(this.pubsub), this);

      this.filterView = new DailyMrpPlanFilterView({model: this.model});

      this.setView('#' + idPrefix + '-filter', this.filterView);

      this.listenTo(this.model, 'import', this.onImport);
      this.listenTo(this.model, 'reset', _.after(1, this.onReset));
      this.listenTo(this.model.options, 'change:wrap', this.onWrapChange);

      $('body')
        .on('paste.' + idPrefix, this.onBodyPaste.bind(this))
        .on('keydown.' + idPrefix, this.onBodyKeyDown.bind(this));

      $(document)
        .on('dragstart.' + idPrefix, handleDragEvent)
        .on('dragenter.' + idPrefix, handleDragEvent)
        .on('dragleave.' + idPrefix, handleDragEvent)
        .on('dragover.' + idPrefix, handleDragEvent)
        .on('drop.' + idPrefix, this.onDrop.bind(this));
    },

    destroy: function()
    {
      $('body').off('.' + this.idPrefix).css('overflow-x', '');
      $(document).off('.' + this.idPrefix);
    },

    load: function(when)
    {
      if (this.model.hasRequiredFilters())
      {
        return when(this.loadStyles(), this.model.fetch({reset: true}));
      }

      return when(this.loadStyles());
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        wrap: !!this.model.options.get('wrap')
      };
    },

    loadStyles: function()
    {
      var deferred = $.Deferred();
      var $head = $('head');

      if ($head.find('link[href$="planning.css"]').length)
      {
        deferred.resolve();
      }
      else
      {
        $('<link rel="stylesheet" href="/app/hourlyPlans/assets/planning.css">')
          .on('load', function() { deferred.resolve(); })
          .appendTo($head);
      }

      return deferred.promise();
    },

    afterRender: function()
    {
      $('body').css('overflow-x', 'hidden');

      this.renderPlans();
      this.toggleMessages();
    },

    toggleMessages: function()
    {
      var hasRequiredFilters = this.model.hasRequiredFilters();

      this.$id('msg-filter').toggleClass('hidden', hasRequiredFilters);
      this.$id('msg-empty').toggleClass('hidden', this.model.length > 0);
    },

    renderPlans: function()
    {
      var view = this;
      var selector = '#' + view.idPrefix + '-plans';

      view.removeView(selector);

      view.model.forEach(function(dailyMrpPlan)
      {
        var planView = new DailyMrpPlanView({model: dailyMrpPlan});

        view.insertView(selector, planView);

        planView.render();
      });
    },

    onImport: function(data)
    {
      this.model.rqlQuery.selector.args = [
        {name: 'eq', args: ['date', data.date]},
        {name: 'in', args: ['mrp', data.mrps]}
      ];

      this.filterView.render();
    },

    onReset: function()
    {
      this.updateClientUrl();
      this.renderPlans();
      this.toggleMessages();
    },

    onWrapChange: function()
    {
      this.$el.toggleClass('wrap', !!this.model.options.get('wrap'));
    },

    updateClientUrl: function()
    {
      this.broker.publish('router.navigate', {
        url: '/hourlyPlans;planning?' + this.model.rqlQuery,
        trigger: false,
        replace: true
      });
    },

    handleDragEvent: function(e)
    {
      if (e.type === 'dragstart')
      {
        this.sortableDragged = e.target.classList.contains('select2-search-choice');

        return;
      }

      e.preventDefault();
      e.stopPropagation();
    },

    onDrop: function(e)
    {
      if (this.sortableDragged)
      {
        this.sortableDragged = false;

        return;
      }

      e = e.originalEvent;

      e.preventDefault();
      e.stopPropagation();

      if (!e.dataTransfer.files.length)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('hourlyPlans', 'planning:msg:filesOnly')
        });
      }

      var file = _.find(e.dataTransfer.files, function(file)
      {
        return /vnd.ms-excel.sheet|spreadsheetml.sheet/.test(file.type) && /\.xls(x|m)$/.test(file.name);
      });

      if (!file)
      {
        return viewport.msg.show({
          type: 'warning',
          time: 3000,
          text: t('hourlyPlans', 'planning:msg:invalidFile')
        });
      }

      viewport.msg.loading();

      var formData = new FormData();

      formData.append('plan', file);

      var view = this;
      var req = view.ajax({
        type: 'POST',
        url: '/dailyMrpPlans;parse',
        data: formData,
        processData: false,
        contentType: false
      });

      req.fail(function()
      {
        viewport.msg.loadingFailed();
      });

      req.done(function(mrpToOrdersMap)
      {
        viewport.msg.loaded();

        view.showImportDialog(mrpToOrdersMap);
      });
    },

    onBodyKeyDown: function(e)
    {
      if (e.keyCode === 27)
      {
        this.$('.is-selected').click();
      }
      else if (e.keyCode === 13)
      {
        var $popover = this.$('.dailyMrpPlan-popover-editable');

        if ($popover.length)
        {
          this.saveChanges($popover);
        }
      }
    },

    onBodyPaste: function(e)
    {
      if (e.target.tagName === 'INPUT')
      {
        return;
      }

      var input = e.originalEvent.clipboardData.getData('text/plain') || '';
      var mrpToOrdersMap = this.parseInput(input);

      this.showImportDialog(mrpToOrdersMap);
    },

    parseInput: function(input)
    {
      var mrpToOrdersMap = {
        __DATE__: this.filterView.$id('date').val() || null
      };
      var currentMrp = null;
      var orderProps = ['_id', 'nc12', 'name', 'qty', 'rbh', 'operators', 'shifts'];
      var date = null;

      input.split('\n').forEach(function(line)
      {
        if (!date)
        {
          var dateMatches = line.match(/([0-9]{1,2}[^0-9][0-9]{1,2}[^0-9][0-9]{4})/);

          if (dateMatches)
          {
            date = dateMatches[1];

            return;
          }
        }

        line = ' ' + line + ' ';

        if (/\s+[0-9]{9}\s+/.test(line))
        {
          var order = {};
          var propI = 0;

          line.trim().split('\t').forEach(function(part)
          {
            if (propI === orderProps.length)
            {
              return;
            }

            part = part.trim();

            if (propI === 0)
            {
              if (/^[0-9]{9}$/.test(part))
              {
                order._id = part;
                propI += 1;
              }

              return;
            }

            if (/^[0-9](,[0-9]+)?$/.test(part))
            {
              part = parseFloat(part.replace(',', '.'));
            }

            order[orderProps[propI]] = part;
            propI += 1;
          });

          if (!mrpToOrdersMap[currentMrp])
          {
            mrpToOrdersMap[currentMrp] = [];
          }

          mrpToOrdersMap[currentMrp].push(order);

          return;
        }

        var mrpMatches = line.match(/\s+([A-Z][A-Z0-9]{2})\s+/);

        if (mrpMatches)
        {
          currentMrp = mrpMatches[1];

          if (!mrpToOrdersMap[currentMrp])
          {
            mrpToOrdersMap[currentMrp] = [];
          }

          return;
        }
      });

      var moment = time.getMoment(date, 'DD.MM.YYYY');

      if (moment.isValid())
      {
        mrpToOrdersMap.__DATE__ = moment.format('YYYY-MM-DD');
      }

      return mrpToOrdersMap;
    },

    showImportDialog: function(mrpToOrdersMap)
    {
      if (viewport.currentDialog)
      {
        return;
      }

      var date = mrpToOrdersMap.__DATE__;

      delete mrpToOrdersMap.__DATE__;

      if (_.isEmpty(mrpToOrdersMap))
      {
        return;
      }

      var importDialog = new DailyMrpPlanImportView({
        model: {
          dailyMrpPlans: this.model,
          date: date,
          mrpToOrdersMap: mrpToOrdersMap
        }
      });

      this.listenToOnce(importDialog, 'imported', function()
      {
        viewport.closeDialog();
      });

      viewport.showDialog(importDialog, t('hourlyPlans', 'planning:import:title'));
    },

    saveChanges: function($popover)
    {
      var plan = this.model.get($popover.attr('data-plan'));

      if (!plan)
      {
        return;
      }

      var itemType = $popover.attr('data-item-type');

      if (itemType === 'order')
      {
        plan.orders.trigger('saveChangesRequested');
      }
      else if (itemType === 'line')
      {
        plan.lines.trigger('saveChangesRequested');
      }
    }

  });
});
