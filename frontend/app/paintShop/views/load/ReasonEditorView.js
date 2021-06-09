// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/time',
  'app/viewport',
  'app/core/View',
  'app/core/util/getShiftStartInfo',
  'app/paintShop/PaintShopLoad',
  'app/paintShop/PaintShopLoadCollection',
  'app/paintShop/PaintShopLoadReasonCollection',
  'app/paintShop/templates/load/reasonEditor'
], function(
  $,
  time,
  viewport,
  View,
  getShiftStartInfo,
  PaintShopLoad,
  PaintShopLoadCollection,
  PaintShopLoadReasonCollection,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click .psLoad-reasonEditor-load': function(e)
      {
        if (this.updating)
        {
          return;
        }

        this.$id('loads').find('.active').removeClass('active');
        e.currentTarget.classList.add('active');
      },

      'click .btn[data-key]': function(e)
      {
        var view = this;

        if (view.updating)
        {
          return;
        }

        var $load = view.$id('loads').find('.active');

        if (!$load.length)
        {
          return;
        }

        var newReason = e.currentTarget.dataset.key === '0' ? null : e.currentTarget.dataset.reason;
        var load = view.loads.get($load[0].dataset.id);

        if (load.get('reason') === newReason)
        {
          view.selectNext();

          return;
        }

        view.updating = true;

        view.$('.btn').prop('disabled', true);

        var $reason = $load.find('.psLoad-reasonEditor-reason');

        $reason.html('<i class="fa fa-spinner fa-spin"></i>');

        var req = view.ajax({
          method: 'PATCH',
          url: '/paintShop/load',
          data: JSON.stringify({
            time: load.get('time'),
            counter: load.get('counter'),
            reason: newReason
          })
        });

        req.fail(function()
        {
          view.updating = false;

          viewport.msg.show({
            type: 'error',
            time: 2500,
            text: view.t('core', 'MSG:SAVING_FAILURE')
          });
        });

        req.done(function()
        {
          view.updating = false;

          view.selectNext();
        });

        req.always(function()
        {
          $reason.find('.fa-spin').removeClass('fa-spin');
          view.$('.btn').prop('disabled', false);
        });
      }

    },

    remoteTopics: {

      'paintShop.load.updated': function(message)
      {
        var view = this;

        if (message.counter !== view.model.counter)
        {
          return;
        }

        message.items.forEach(function(item)
        {
          view.loads.add(PaintShopLoad.parse(item));
        });
      },

      'paintShop.load.edited': function(message)
      {
        var load = this.loads.get(Date.parse(message.model._id.ts) + ':' + message.model._id.c);

        if (load)
        {
          load.set(load.parse(message.model));
        }
      }

    },

    initialize: function()
    {
      this.loading = true;
      this.updating = false;
      this.reasons = new PaintShopLoadReasonCollection(null, {rqlQuery: 'sort(position)'});
      this.loads = new PaintShopLoadCollection(null, {rqlQuery: this.buildLoadsRql()});

      this.once('afterRender', function()
      {
        this.load();

        $(window)
          .on('resize.' + this.idPrefix, this.resize.bind(this))
          .on('keydown.' + this.idPrefix, this.onKeyDown.bind(this))
          .on('keyup.' + this.idPrefix, this.onKeyUp.bind(this));
      });

      this.listenTo(this.loads, 'change:reason', this.onReasonChanged);
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    getTemplateData: function()
    {
      return {
        height: this.calcHeight(),
        loading: this.loading,
        loads: this.serializeLoads(),
        reasons: this.serializeReasons()
      };
    },

    afterRender: function()
    {
      this.$('.psLoad-reasonEditor-load').first().click();
    },

    serializeLoads: function()
    {
      var view = this;
      var loads = [];

      view.loads.forEach(function(load)
      {
        var reasonId = load.get('reason');

        if (reasonId)
        {
          return;
        }

        var reason = view.reasons.get(reasonId);

        loads.push({
          id: load.id,
          time: time.format(load.get('time'), 'HH:mm:ss'),
          duration: time.toString(load.get('duration') / 1000, false, false),
          reason: reason ? reason.getLabel() : reasonId
        });
      });

      return loads;
    },

    serializeReasons: function()
    {
      return this.reasons
        .filter(function(r) { return r.get('active'); })
        .map(function(r) { return r.toJSON(); });
    },

    calcHeight: function()
    {
      var $dialog = this.$el.closest('.modal-dialog');
      var height = window.innerHeight
        - parseInt($dialog.css('margin-top') || 30, 10) * 2
        - ($dialog.find('.modal-header').outerHeight(true) || 55)
        - 76
        - 15 * 3;

      return height;
    },

    resize: function()
    {
      this.$id('loads').css('height', this.calcHeight() + 'px');
    },

    buildLoadsRql: function()
    {
      var now = Date.now();
      var delayedDuration = this.settings.getValue(`load.delayedDuration.${this.model.counter}`, 28800) * 1000;
      var timeWindow = 30 * 60 * 1000;
      var shiftInfo = getShiftStartInfo(now);
      var from = shiftInfo.startTime;

      if (now < (shiftInfo.startTime + timeWindow))
      {
        from -= 8 * 3600 * 1000;
      }

      return 'sort(_id.c,_id.ts)'
        + '&_id.c=' + this.model.counter
        + '&_id.ts=ge=' + from
        + '&d=gt=' + delayedDuration;
    },

    load: function()
    {
      var view = this;

      var req = $.when(
        view.promised(view.reasons.fetch({reset: true})),
        view.promised(view.loads.fetch({reset: true}))
      );

      req.fail(function()
      {
        view.$('.fa-spin').removeClass('fa-spin');
      });

      req.done(function()
      {
        view.loading = false;
        view.render();
      });
    },

    selectPrev: function()
    {
      if (this.updating)
      {
        return;
      }

      var $loads = this.$id('loads');
      var $active = $loads.find('.active');

      if (!$active.length)
      {
        return;
      }

      var $prev = $active.prev();

      if (!$prev.length)
      {
        $prev = $loads.children().last();
      }

      $prev.click().focus();
    },

    selectNext: function()
    {
      if (this.updating)
      {
        return;
      }

      var $loads = this.$id('loads');
      var $active = $loads.find('.active');

      if (!$active.length)
      {
        return;
      }

      var $next = $active.next();

      if (!$next.length)
      {
        $next = $loads.children().first();
      }

      $next.click().focus();
    },

    onKeyDown: function(e)
    {
      switch (e.key.toUpperCase())
      {
        case 'W':
        case 'A':
        case 'ARROWUP':
        case 'ARROWLEFT':
        {
          this.selectPrev();

          return false;
        }

        case 'S':
        case 'D':
        case 'ARROWDOWN':
        case 'ARROWRIGHT':
        {
          this.selectNext();

          return false;
        }

        case 'TAB':
        {
          if (e.shiftKey)
          {
            this.selectPrev();
          }
          else
          {
            this.selectNext();
          }

          return false;
        }
      }

      var $btn = this.$('.btn[data-key="' + e.key + '"]');

      if (!$btn.length || $btn.prop('disabled'))
      {
        return;
      }

      $btn.addClass('active');
    },

    onKeyUp: function(e)
    {
      var $btn = this.$('.active[data-key="' + e.key + '"]');

      if (!$btn.length)
      {
        return;
      }

      $btn.removeClass('active').click();
    },

    onReasonChanged: function(load)
    {
      var $load = this.$('.psLoad-reasonEditor-load[data-id="' + load.id + '"]');
      var reasonId = load.get('reason') || '?';
      var reason = this.reasons.get(reasonId);

      $load.find('.psLoad-reasonEditor-reason').text(reason ? reason.getLabel() : reasonId);
    }

  });
});
