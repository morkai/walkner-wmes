// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/data/prodLog',
  'app/data/views/renderOrgUnitPath',
  'app/users/UserCollection',
  './PersonelPickerView',
  'app/production/templates/header'
], function(
  t,
  viewport,
  View,
  prodLog,
  renderOrgUnitPath,
  UserCollection,
  PersonelPickerView,
  headerTemplate
) {
  'use strict';

  return View.extend({

    template: headerTemplate,

    localTopics: {
      'divisions.synced': 'updateOrgUnit',
      'subdivisions.synced': 'updateOrgUnit',
      'mrpControllers.synced': 'updateOrgUnit',
      'prodFlows.synced': 'updateOrgUnit',
      'workCenters.synced': 'updateOrgUnit',
      'prodLines.synced': 'updateOrgUnit',
      'socket.connected': 'fillPersonnelData'
    },

    events: {
      'click #-master': 'showMasterPickerDialog',
      'click #-leader': 'showLeaderPickerDialog',
      'click #-operator': 'showOperatorPickerDialog'
    },

    initialize: function()
    {
      var model = this.model;

      this.listenTo(model.prodLine, 'change:description', this.updatePageHeader);
      this.listenTo(model, 'second', this.updateCurrentTime);
      this.listenTo(model, 'change:shift', this.updateShift);
      this.listenTo(model, 'change:master', this.updateMaster);
      this.listenTo(model, 'change:leader', this.updateLeader);
      this.listenTo(model, 'change:operator', this.updateOperator);
      this.listenTo(model, 'locked unlocked', function()
      {
        this.updateMaster();
        this.updateLeader();
        this.updateOperator();
      });
    },

    afterRender: function()
    {
      this.$currentTime = this.$property('currentTime');

      this.updatePageHeader();
      this.updateCurrentTime();
      this.updateShift();
      this.updateOrgUnit();
      this.updateMaster();
      this.updateLeader();
      this.updateOperator();

      if (this.socket.isConnected())
      {
        this.fillPersonnelData();
      }
    },

    updatePageHeader: function()
    {
      this.$('.production-pageHeader').text(
        this.model.prodLine.get('description') || this.model.prodLine.id || '?'
      );
    },

    updateCurrentTime: function()
    {
      if (this.$currentTime)
      {
        this.$currentTime.text(this.model.getCurrentTime());
      }
    },

    updateShift: function()
    {
      var shift = this.model.get('shift');

      if (typeof shift === 'number')
      {
        shift = t('core', 'SHIFT:' + shift);
      }
      else
      {
        shift = '?';
      }

      this.$property('shift').text(shift);
    },

    updateOrgUnit: function()
    {
      this.$property('orgUnit').html(
        renderOrgUnitPath(this.model.prodLine.getSubdivision(), false, false) || '?'
      );
    },

    updateMaster: function()
    {
      this.updatePersonnel('master');
    },

    updateLeader: function()
    {
      this.updatePersonnel('leader');
    },

    updateOperator: function()
    {
      this.updatePersonnel('operator');
    },

    updatePersonnel: function(type)
    {
      var unlocked = !this.model.isLocked();
      var html;

      if (!unlocked)
      {
        html = '?';
      }
      else
      {
        var userInfo = this.model.get(type);
        var label = userInfo && userInfo.label ? userInfo.label : null;

        if (label)
        {
          var matches = label.match(/^(.*?) \(.*?\)$/);

          html = (matches === null ? label : matches[1].trim())
            + ' <button class="btn btn-link">'
            + t('production', 'property:' + type + ':change')
            + '</button>';
        }
        else
        {
          html = '<button class="btn btn-link">' + t('production', 'property:' + type + ':noData:unlocked') + '</a>';
        }
      }

      this.$property(type).html(html);
    },

    $property: function(propertyName)
    {
      return this.$('.production-property-' + propertyName + ' .production-property-value');
    },

    showMasterPickerDialog: function(e)
    {
      if (e)
      {
        e.preventDefault();
        e.target.blur();
      }

      if (viewport.currentDialog)
      {
        return;
      }

      this.showPickerDialog('master', this.model.changeMaster.bind(this.model));
    },

    showLeaderPickerDialog: function(e)
    {
      if (e)
      {
        e.preventDefault();
        e.target.blur();
      }

      if (viewport.currentDialog)
      {
        return;
      }

      this.showPickerDialog('leader', this.model.changeLeader.bind(this.model));
    },

    showOperatorPickerDialog: function(e)
    {
      if (e)
      {
        e.preventDefault();
        e.target.blur();
      }

      if (viewport.currentDialog)
      {
        return;
      }

      this.showPickerDialog('operator', this.model.changeOperator.bind(this.model));
    },

    showPickerDialog: function(type, onUserPicked)
    {
      var personelPickerView = new PersonelPickerView({
        type: type,
        model: this.model
      });

      this.listenTo(personelPickerView, 'userPicked', function(userInfo)
      {
        viewport.closeDialog();

        var currentUserInfo = this.model.get(type);

        if (currentUserInfo === null)
        {
          if (userInfo !== null)
          {
            onUserPicked(userInfo);
          }
        }
        else if (currentUserInfo !== userInfo
          || (userInfo
            && (userInfo.id !== currentUserInfo.id || userInfo.label !== currentUserInfo.label)))
        {
          onUserPicked(userInfo);
        }

        this.$('.production-property-' + type + ' .btn-link').focus();
      });

      viewport.showDialog(personelPickerView, t('production', 'personelPicker:title:' + type));
    },

    fillPersonnelData: function()
    {
      var missingPersonellIds = [];
      var missingPersonnelProperties = [];
      var model = this.model;

      ['master', 'leader', 'operator'].forEach(function(personnelProperty)
      {
        var userInfo = model.get(personnelProperty);

        if (userInfo && userInfo.id === null && userInfo.label.trim().length > 0)
        {
          missingPersonellIds.push(userInfo.label);
          missingPersonnelProperties.push(personnelProperty);
        }
      });

      if (missingPersonellIds.length > 0)
      {
        this.fillUserInfo(missingPersonellIds, missingPersonnelProperties);
      }
    },

    fillUserInfo: function(missingPersonellIds, missingPersonnelProperties)
    {
      if (prodLog.isSyncing())
      {
        return this.broker
          .subscribe('production.synced', this.fillPersonnelData.bind(this))
          .setLimit(1);
      }

      var users = new UserCollection(null, {
        rqlQuery: {
          fields: {
            firstName: 1,
            lastName: 1,
            personellId: 1
          },
          selector: {
            name: missingPersonellIds.length > 1 ? 'in' : 'eq',
            args: [
              'personellId',
              missingPersonellIds.length > 1 ? missingPersonellIds : missingPersonellIds[0]
            ]
          }
        }
      });

      var model = this.model;

      this.promised(users.fetch()).then(function()
      {
        var updates = 0;

        missingPersonellIds.forEach(function(personellId, i)
        {
          var user = users.findWhere({personellId: personellId});

          if (user)
          {
            model.set(missingPersonnelProperties[i], {
              id: user.id,
              label: user.get('firstName') + ' ' + user.get('lastName')
            });
          }
        });

        if (updates)
        {
          model.saveLocalData();
        }
      });
    }

  });
});
