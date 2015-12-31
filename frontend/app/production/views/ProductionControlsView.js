// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/View',
  'app/production/templates/controls',
  './UnlockDialogView',
  './LockDialogView'
], function(
  t,
  user,
  viewport,
  View,
  template,
  UnlockDialogView,
  LockDialogView
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
      'socket.*': function(message, topic)
      {
        var color = SOCKET_TOPIC_TO_COLOR[topic];

        if (color)
        {
          this.$syncControl.css('color', color);
        }
      },
      'production.syncing': function()
      {
        this.$syncControl.addClass('fa-spin');
      },
      'production.synced': function()
      {
        this.$syncControl.removeClass('fa-spin');
      }
    },

    events: {
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

    unlock: function()
    {
      if (!this.socket.isConnected())
      {
        return viewport.msg.show({
          type: 'warning',
          time: 2000,
          text: t('production', 'controls:msg:sync:noConnection')
        });
      }

      if (!this.model.isLocked())
      {
        return;
      }

      viewport.showDialog(new UnlockDialogView({model: this.model}), t('production', 'unlockDialog:title:unlock'));
    },

    lock: function()
    {
      if (!this.socket.isConnected())
      {
        return viewport.msg.show({
          type: 'warning',
          time: 2000,
          text: t('production', 'controls:msg:sync:noConnection')
        });
      }

      if (this.model.isLocked())
      {
        return;
      }

      viewport.showDialog(new LockDialogView({model: this.model}), t('production', 'unlockDialog:title:lock'));
    }

  });
});
