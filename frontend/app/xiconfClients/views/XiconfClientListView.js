// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/core/views/DialogView',
  'app/licenses/views/LicensePickerView',
  '../XiconfClientCollection',
  'app/xiconfClients/templates/restartDialog',
  'app/xiconfClients/templates/updateDialog'
], function(
  _,
  t,
  time,
  user,
  viewport,
  ListView,
  DialogView,
  LicensePickerView,
  XiconfClientCollection,
  restartDialogTemplate,
  updateDialogTemplate
) {
  'use strict';

  return ListView.extend({

    className: 'xiconfClients-list is-colored',

    remoteTopics: {
      'xiconf.clients.**': 'refreshCollection'
    },

    events: _.assign({
      'click a.licenses-id': function(e)
      {
        e.currentTarget.blur();

        var xiconfClient = this.getModelFromEvent(e);
        var license = xiconfClient.get('license');

        if (license && license._id)
        {
          license = license._id;
        }

        var licensePickerView = new LicensePickerView({
          model: {
            appId: 'walkner-xiconf',
            unused: true,
            currentLicenseId: license,
            usedLicenses: new XiconfClientCollection(null, {
              rqlQuery: 'select(license)&limit(999)'
            })
          }
        });

        this.listenToOnce(licensePickerView, 'licensePicked', function(license)
        {
          viewport.closeDialog();

          this.socket.emit('xiconf.configure', {
            socket: xiconfClient.get('socket'),
            settings: {
              licenseKey: license.get('key')
            }
          });
        });

        viewport.showDialog(licensePickerView, t('xiconfClients', 'licensePicker:title'));

        return false;
      },
      'click .action-restart': function(e)
      {
        e.currentTarget.blur();

        var model = this.getModelFromEvent(e);
        var dialogView = new DialogView({
          template: restartDialogTemplate,
          model: {
            client: model.id,
            nlsDomain: model.getNlsDomain()
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
        var model = this.getModelFromEvent(e);

        if (!e.originalEvent)
        {
          e.currentTarget.classList.add('disabled');

          this.socket.emit('xiconf.update', {socket: model.get('socket')});

          return false;
        }

        e.currentTarget.blur();

        var dialogView = new DialogView({
          template: updateDialogTemplate,
          model: {
            client: model.id,
            nlsDomain: model.getNlsDomain()
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

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.listenTo(this.settings, 'change', function(setting)
      {
        if (setting.id === 'xiconf.appVersion')
        {
          this.render();
        }
      });
    },

    columns: [
      {id: '_id', className: 'is-min', tdClassName: 'text-mono'},
      {id: 'prodLine', className: 'is-min', tdClassName: 'text-mono'},
      {id: 'orderLink', className: 'is-min', label: t.bound('xiconfClients', 'PROPERTY:order')},
      {id: 'lastSeenAt', className: 'is-min'},
      {id: 'appVersion', className: 'is-min'},
      {id: 'mowVersion', className: 'is-min'},
      {id: 'coreScannerDriver', className: 'is-min'},
      {id: 'shortLicense', className: 'is-min', label: t.bound('xiconfClients', 'PROPERTY:license')},
      'features',
      {id: 'remoteAddress', className: 'is-min', tdClassName: 'text-mono'}
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
          href: url + ';goTo?page=',
          icon: 'external-link',
          label: t.bound('xiconfClients', 'list:goToDashboard')
        }, {
          id: 'goToSettings',
          href: url + ';goTo?page=settings',
          icon: 'cog',
          label: t.bound('xiconfClients', 'list:goToSettings')
        }, {
          id: 'update',
          icon: 'forward',
          label: t.bound('xiconfClients', 'list:update'),
          className: !connected || row.appVersionCmp !== -1 || /^rpi/.test(row._id) ? 'disabled' : ''
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
    },

    serializeRows: function()
    {
      return this.collection.invoke('serialize', {
        appVersion: this.settings.getValue('appVersion')
      });
    }

  });
});
