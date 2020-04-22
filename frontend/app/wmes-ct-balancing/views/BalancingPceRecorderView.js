// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/Model',
  'app/core/View',
  'app/core/util/decimalSeparator',
  'app/wmes-ct-balancing/BalancingPce',
  'app/wmes-ct-balancing/templates/recorder',
  'css!app/wmes-ct-balancing/assets/recorder',
  'i18n!app/nls/wmes-ct-balancing'
], function(
  Model,
  View,
  decimalSeparator,
  BalancingPce,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {

      'click .ct-balancing-recorder-hd': function()
      {
        this.hide();
      },

      'click .ct-balancing-recorder-duration': function()
      {
        if (this.model.get('lastPce') && !this.model.get('recording'))
        {
          this.model.set('commenting', true);
        }
      },

      'click #-start': function()
      {
        this.start();
      },

      'click #-stop': function()
      {
        this.stop();
      },

      'click #-comment': function()
      {
        this.comment();
      }

    },

    initialize: function()
    {
      this.model = new Model();
      this.model.nlsDomain = 'wmes-ct-balancing';
      this.reset();

      this.listenTo(this.model, 'change:active', this.onActiveChange);
      this.listenTo(this.model, 'change:state', this.onStateChange);
      this.listenTo(this.model, 'change:recording', this.onRecordingChange);
      this.listenTo(this.model, 'change:commenting', this.onCommentingChange);
    },

    reset: function(newData)
    {
      this.model.set(Object.assign({
        state: 'idle',
        active: false,
        recording: null,
        commenting: false,
        lastPce: null,
        newOrder: null,
        order: null,
        startedAt: null,
        finishedAt: null
      }, newData));
    },

    updateOrder: function(order)
    {
      if (this.model.get('state') === 'started')
      {
        this.model.set('newOrder', order);
      }
      else
      {
        this.model.set('order', order);
      }
    },

    toggle: function(order)
    {
      if (this.model.get('active'))
      {
        this.hide();
      }
      else
      {
        this.show(order);
      }
    },

    show: function(order)
    {
      this.reset({
        active: true,
        order: order
      });

      this.center();
      this.updateValue();
    },

    hide: function()
    {
      clearInterval(this.timers.updateValue);
      this.timers.updateValue = null;

      this.reset();
    },

    start: function()
    {
      var newOrder = this.model.get('newOrder');

      if (newOrder)
      {
        this.model.set({
          newOrder: null,
          order: newOrder
        });
      }

      this.model.set({
        state: 'started',
        startedAt: new Date()
      });

      this.timers.updateValue = setInterval(this.updateValue.bind(this), 40);

      this.updateValue();
    },

    stop: function()
    {
      this.model.set({
        state: 'finished',
        finishedAt: new Date()
      });

      clearInterval(this.timers.updateValue);
      this.timers.updateValue = null;

      this.updateValue();
      this.recordValue();
    },

    comment: function()
    {
      var view = this;
      var lastPce = view.model.get('lastPce');
      var $text = view.$id('text');
      var oldComment = lastPce.get('comment') || '';
      var newComment = $text.val().trim();

      if (newComment.replace(/[^A-Za-z0-9]+/, '').length === 0)
      {
        newComment = '';
      }

      if (newComment === oldComment)
      {
        view.model.set({
          recording: null,
          commenting: false
        });

        return;
      }

      view.model.set('recording', 'started');

      $text.prop('disabled', true);

      var req = lastPce.save({comment: newComment}, {wait: true});

      req.fail(function()
      {
        view.model.set('recording', 'failure');

        view.timers.recorded = setTimeout(function()
        {
          view.model.set('recording', null);
          $text.prop('disabled', false).focus();
        }, 2000);
      });

      req.done(function()
      {
        view.model.set('recording', 'success');

        view.timers.recorded = setTimeout(function()
        {
          $text.prop('disabled', false);
          view.model.set({
            recording: null,
            commenting: false
          });
        }, 2000);
      });
    },

    updateValue: function()
    {
      var startedAt = this.model.get('startedAt');
      var value = 0;

      if (startedAt)
      {
        value = (Date.now() - startedAt.getTime()) / 1000;
      }

      var parts = value.toFixed(1).split('.');
      var html = parts[0]
        + '<span class="ct-balancing-recorder-duration-separator">'
        + decimalSeparator
        + '</span>'
        + parts[1];

      this.$id('value').html(html);
    },

    recordValue: function()
    {
      var view = this;

      view.model.set('recording', 'started');

      var lastPce = new BalancingPce({
        order: view.model.get('order'),
        line: window.WMES_LINE_ID,
        station: window.WMES_STATION,
        startedAt: view.model.get('startedAt'),
        finishedAt: view.model.get('finishedAt')
      });
      var req = lastPce.save();

      req.fail(function()
      {
        view.model.set('recording', 'failure');

        view.timers.recorded = setTimeout(view.model.set.bind(view.model, 'recording', null), 2000);
      });

      req.done(function()
      {
        view.model.set({
          recording: 'success',
          lastPce: lastPce
        });

        view.timers.recorded = setTimeout(view.model.set.bind(view.model, 'recording', null), 2000);
      });
    },

    center: function()
    {
      var box = this.el.getBoundingClientRect();

      this.el.style.marginLeft = (Math.round(box.width / 2) * -1) + 'px';
      this.el.style.marginTop = (Math.round(box.height / 2) * -1) + 'px';
    },

    onActiveChange: function()
    {
      this.$el.toggleClass('hidden', !this.model.get('active'));
    },

    onStateChange: function()
    {
      var state = this.model.get('state');

      this.$el[0].dataset.state = state;

      this.$id('title').html(this.t('balancing:title:' + state));
    },

    onRecordingChange: function()
    {
      var $btn = this.$id('record').removeClass('btn-danger btn-success btn-info');
      var $icon = $btn.find('.fa').removeClass('fa-thumbs-up fa-thumbs-down fa-spinner fa-spin');

      switch (this.model.get('recording'))
      {
        case 'started':
          $btn.addClass('btn-info');
          $icon.addClass('fa-spinner fa-spin');
          this.$el.addClass('is-recording');
          break;

        case 'failure':
          $btn.addClass('btn-danger');
          $icon.addClass('fa-thumbs-down');
          break;

        case 'success':
          $btn.addClass('btn-success');
          $icon.addClass('fa-thumbs-up');
          break;

        default:
          this.$el.removeClass('is-recording');
          break;
      }
    },

    onCommentingChange: function()
    {
      var commenting = this.model.get('commenting');

      this.$el.toggleClass('is-commenting', commenting);

      if (commenting)
      {
        this.$id('text').val(this.model.get('lastPce').get('comment') || '').select();
      }
    }

  });
});
