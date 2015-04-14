// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/core/views/DialogView',
  'app/xiconfClients/templates/restartDialog',
  'app/xiconfClients/templates/updateDialog',
  'i18n!app/nls/licenses'
], function(
  _,
  t,
  time,
  user,
  viewport,
  ListView,
  DialogView,
  restartDialogTemplate,
  updateDialogTemplate
) {
  'use strict';

  return ListView.extend({

    className: 'is-colored',

    remoteTopics: {
      'xiconf.clients.**': 'refreshCollection'
    },

    events: _.extend({
      'click .action-restart': function(e)
      {
        e.currentTarget.blur();

        var model = this.getModelFromEvent(e);
        var dialogView = new DialogView({
          template: restartDialogTemplate,
          model: {
            client: model.id
          }
        });

        this.listenTo(dialogView, 'answered', function(answer)
        {
          if (answer === 'yes')
          {
            e.currentTarget.classList.add('disabled');

            this.socket.emit('xiconf.restart', {socket: model.get('socket')});
          }
        });

        viewport.showDialog(dialogView, t('xiconfClients', 'restartDialog:title'));

        return false;
      },
      'click .action-update': function(e)
      {
        e.currentTarget.blur();

        var model = this.getModelFromEvent(e);
        var dialogView = new DialogView({
          template: updateDialogTemplate,
          model: {
            client: model.id
          }
        });

        this.listenTo(dialogView, 'answered', function(answer)
        {
          if (answer === 'yes')
          {
            e.currentTarget.classList.add('disabled');

            this.socket.emit('xiconf.update', {socket: model.get('socket')});
          }
        });

        viewport.showDialog(dialogView, t('xiconfClients', 'updateDialog:title'));

        return false;
      }
    }, ListView.prototype.events),

    columns: [
      {id: '_id', className: 'is-min'},
      {id: 'prodLine', className: 'is-min'},
      {id: 'shortLicense', className: 'is-min', label: t.bound('xiconfClients', 'PROPERTY:license')},
      {id: 'features', className: 'is-min'},
      {id: 'appVersion', className: 'is-min'},
      {id: 'mowVersion', className: 'is-min'},
      {id: 'orderLink', className: 'is-min', label: t.bound('xiconfClients', 'PROPERTY:order')},
      'lastSeenAt'
    ],

    serializeActions: function()
    {
      var collection = this.collection;
      var canManage = user.isAllowedTo('XICONF:MANAGE');

      return function(row)
      {
        var model = collection.get(row._id);
        var url = model.url();
        var connected = row.connectedAt !== null;
        var actions = [{
          href: url + ';downloadVNC',
          icon: 'desktop',
          label: t.bound('xiconfClients', 'list:downloadVNC')
        }, {
          href: url + ';goToSettings',
          icon: 'cog',
          label: t.bound('xiconfClients', 'list:goToSettings')
        }, {
          id: 'update',
          icon: 'forward',
          label: t.bound('xiconfClients', 'list:update'),
          className: connected ? '' : 'disabled'
        }];

        if (canManage)
        {
          if (connected)
          {
            actions.push({
              id: 'restart',
              icon: 'refresh',
              label: t.bound('xiconfClients', 'list:restart')
            });
          }
          else
          {
            actions.push(ListView.actions.delete(model));
          }
        }

        return actions;
      };
    }

  });
});
