define([
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/data/views/renderOrgUnitPath',
  './PersonelPickerView',
  'app/production/templates/header'
], function(
  t,
  viewport,
  View,
  renderOrgUnitPath,
  PersonelPickerView,
  headerTemplate
) {
  'use strict';

  // TODO: Sync missing personel data on connect

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
      'prodLines.synced': 'updateOrgUnit'
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
      this.$property('shift').text(this.model.get('shift'));
    },

    updateOrgUnit: function()
    {
      this.$property('orgUnit').text(
        renderOrgUnitPath(this.model.prodLine.getSubdivision(), false, false) || '?'
      );
    },

    updateMaster: function()
    {
      this.updatePersonel('master');
    },

    updateLeader: function()
    {
      this.updatePersonel('leader');
    },

    updateOperator: function()
    {
      this.updatePersonel('operator');
    },

    updatePersonel: function(type)
    {
      var unlocked = !this.model.isLocked();
      var userInfo = this.model.get(type);
      var label = userInfo && userInfo.label ? userInfo.label : null;
      var html;

      if (label)
      {
        html = label;

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
      }

      this.showPickerDialog('master', this.model.changeMaster.bind(this.model));
    },

    showLeaderPickerDialog: function(e)
    {
      if (e)
      {
        e.preventDefault();
      }

      this.showPickerDialog('leader', this.model.changeLeader.bind(this.model));
    },

    showOperatorPickerDialog: function(e)
    {
      if (e)
      {
        e.preventDefault();
      }

      this.showPickerDialog('operator', this.model.changeOperator.bind(this.model));
    },

    showPickerDialog: function(type, onUserPicked)
    {
      var personelPickerView = new PersonelPickerView();

      this.listenTo(personelPickerView, 'userPicked', function(userInfo)
      {
        viewport.closeDialog();

        onUserPicked(userInfo);

        this.$('.production-property-' + type + ' .btn-link').focus();
      });

      viewport.showDialog(personelPickerView, t('production', 'personelPicker:title:' + type));
    }

  });
});
