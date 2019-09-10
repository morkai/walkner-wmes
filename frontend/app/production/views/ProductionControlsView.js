// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/mor/Mor',
  'app/mor/views/MorView',
  './UnlockDialogView',
  './LockDialogView',
  'app/production/templates/controls'
], function(
  t,
  user,
  viewport,
  View,
  Mor,
  MorView,
  UnlockDialogView,
  LockDialogView,
  template
) {
  'use strict';

  var SOCKET_TOPIC_TO_COLOR = {
    'socket.connected': '#5BB75B',
    'socket.disconnected': '#DA4F49',
    'socket.connectFailed': '#DA4F49',
    'socket.connecting': '#F0AD4E'
  };

  return View.extend({

    template: template,

    localTopics: {
      'socket.connected': function()
      {
        if (this.mor)
        {
          this.promised(this.mor.fetch());
        }
      },
      'socket.*': function(message, topic)
      {
        var color = SOCKET_TOPIC_TO_COLOR[topic];

        if (color && this.$syncControl)
        {
          this.$syncControl.css('color', color);
        }
      },
      'production.syncing': function()
      {
        if (this.$syncControl)
        {
          this.$syncControl.addClass('is-syncing');
        }
      },
      'production.synced': function()
      {
        if (this.$syncControl)
        {
          this.$syncControl.removeClass('is-syncing');
        }
      }
    },

    events: {
      'click #-mor': 'showMor',
      'click a.production-controls-addNearMiss': 'addNearMiss',
      'click a.production-controls-addSuggestion': 'addSuggestion',
      'click a.production-controls-addObservation': 'addObservation',
      'click a.production-controls-lock': 'lock',
      'click a.production-controls-unlock': 'unlock',
      'mouseover a.production-controls-lock': function(e)
      {
        this.$(e.target).removeClass('fa-unlock').addClass('fa-lock');
      },
      'mouseout a.production-controls-lock': function(e)
      {
        this.$(e.target).removeClass('fa-lock').addClass('fa-unlock');
      },
      'mouseover a.production-controls-unlock': function(e)
      {
        this.$(e.target).removeClass('fa-lock').addClass('fa-unlock');
      },
      'mouseout a.production-controls-unlock': function(e)
      {
        this.$(e.target).removeClass('fa-unlock').addClass('fa-lock');
      }
    },

    initialize: function()
    {
      this.mor = null;
    },

    afterRender: function()
    {
      this.$syncControl = this.$('.production-controls-sync');

      this.$syncControl.css(
        'color',
        SOCKET_TOPIC_TO_COLOR[
          this.socket.isConnected() ? 'socket.connected' : 'socket.disconnected'
        ]
      );
    },

    addNearMiss: function()
    {
      this.addImprovement('/#kaizenOrders;add');
    },

    addSuggestion: function()
    {
      this.addImprovement('/#suggestions;add');
    },

    addObservation: function()
    {
      this.addImprovement('/#behaviorObsCards;add');
    },

    addImprovement: function(url)
    {
      var operator = this.model.get('operator');

      if (operator && operator.id)
      {
        operator = {
          id: operator.id,
          text: operator.label.replace(/\s+\(.*?\)$/, '')
        };
      }
      else
      {
        operator = null;
      }

      url += '?standalone=1&operator=' + btoa(encodeURIComponent(JSON.stringify(operator)));

      var screen = window.screen;
      var width = screen.availWidth > 1350 ? 1300 : screen.availWidth * 0.7;
      var height = screen.availHeight * 0.8;
      var left = Math.floor((screen.availWidth - width) / 2);
      var top = Math.min(100, Math.floor((screen.availHeight - height) / 2));
      var features = 'resizable,scrollbars,location=no'
        + ',top=' + top
        + ',left=' + left
        + ',width=' + Math.floor(width)
        + ',height=' + Math.floor(height);

      var win = window.open(url, 'WMES_IMPROVEMENT', features);

      if (!win)
      {
        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: this.t('controls:msg:popup')
        });
      }
    },

    unlock: function()
    {
      if (!this.model.isLocked())
      {
        return;
      }

      if (!this.socket.isConnected())
      {
        return viewport.msg.show({
          type: 'warning',
          time: 2000,
          text: this.t('controls:msg:sync:noConnection')
        });
      }

      var dialogView = new UnlockDialogView({
        model: this.model,
        embedded: this.options.embedded,
        vkb: this.options.vkb
      });

      viewport.showDialog(dialogView, this.t('unlockDialog:title:unlock'));
    },

    lock: function()
    {
      if (!this.socket.isConnected())
      {
        return viewport.msg.show({
          type: 'warning',
          time: 2000,
          text: this.t('controls:msg:sync:noConnection')
        });
      }

      if (this.model.isLocked())
      {
        return;
      }

      var dialogView = new LockDialogView({
        model: this.model,
        embedded: this.options.embedded,
        vkb: this.options.vkb
      });

      viewport.showDialog(dialogView, this.t('unlockDialog:title:lock'));
    },

    showMor: function()
    {
      var mor = this.mor || new Mor();
      var morView = new MorView({
        editable: false,
        model: mor
      });

      if (mor.users.length)
      {
        return viewport.showDialog(morView);
      }

      var $mor = this.$id('mor').addClass('disabled');

      $mor.find('.fa').removeClass('fa-group').addClass('fa-spinner fa-spin');

      this.promised(mor.fetch())
        .done(function()
        {
          viewport.showDialog(morView);
        })
        .always(function()
        {
          $mor.removeClass('disabled').find('.fa').removeClass('fa-spinner fa-spin').addClass('fa-group');
        });

      this.mor = mor;
    }

  });
});
