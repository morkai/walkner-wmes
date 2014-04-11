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
      'visibility.visible': function()
      {
        this.updateCurrentTime();
      },
      'visibility.hidden': function()
      {
        clearTimeout(this.timers.updateCurrentTime);
      },
      'divisions.synced': 'updateOrgUnit',
      'subdivisions.synced': 'updateOrgUnit',
      'mrpControllers.synced': 'updateOrgUnit',
      'prodFlows.synced': 'updateOrgUnit',
      'workCenters.synced': 'updateOrgUnit',
      'prodLines.synced': 'updateOrgUnit',
      'socket.connected': 'fillPersonnelData'
    },

    events: {
      'click .production-property-master .btn-link': 'showMasterPickerDialog',
      'click .production-property-leader .btn-link': 'showLeaderPickerDialog',
      'click .production-property-operator .btn-link': 'showOperatorPickerDialog'
    },

    initialize: function()
    {
      this.updateCurrentTime = this.updateCurrentTime.bind(this);

      this.listenTo(this.model.prodLine, 'change:description', this.updatePageHeader);
      this.listenTo(this.model, 'change:shift', this.updateShift);
      this.listenTo(this.model, 'change:master', this.updateMaster);
      this.listenTo(this.model, 'change:leader', this.updateLeader);
      this.listenTo(this.model, 'change:operator', this.updateOperator);
      this.listenTo(this.model, 'locked unlocked', function()
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
      this.$('.production-pageHeader').text(this.model.getLabel());
    },

    updateCurrentTime: function()
    {
      this.$currentTime.text(this.model.getCurrentTime());

      this.scheduleCurrentTimeUpdate();
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
      this.$property('orgUnit').text(
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
      var userInfo = this.model.get(type);
      var label = userInfo && userInfo.label ? userInfo.label : null;
      var html;

      if (label)
      {
        var matches = label.match(/^(.*?) \(.*?\)$/);

        html = matches === null ? label : matches[1].trim();

        if (unlocked)
        {
          html += ' <button class="btn btn-link">'
            + t('production', 'property:' + type + ':change')
            + '</button>';
        }
      }
      else
      {
        html = t('production', 'property:' + type + ':noData:' + (unlocked ? 'un' : '') + 'locked');

        if (unlocked)
        {
          html = '<button class="btn btn-link">' + html + '</a>';
        }
      }

      this.$property(type).html(html);
    },

    scheduleCurrentTimeUpdate: function()
    {
      if (this.timers.updateCurrentTime != null)
      {
        clearTimeout(this.timers.updateCurrentTime);
      }

      this.timers.updateCurrentTime = setTimeout(
        function(model)
        {
          model.timers.updateCurrentTime = null;
          model.updateCurrentTime();
        },
        999,
        this
      );
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

      this.showPickerDialog('master', this.model.changeMaster.bind(this.model));
    },

    showLeaderPickerDialog: function(e)
    {
      if (e)
      {
        e.preventDefault();
        e.target.blur();
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

      this.showPickerDialog('operator', this.model.changeOperator.bind(this.model));
    },

    showPickerDialog: function(type, onUserPicked)
    {
      var personelPickerView = new PersonelPickerView();

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
