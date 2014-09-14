// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'jquery',
  'underscore',
  'js2form',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/buttonGroup',
  'app/factoryLayout/views/OrgUnitPickerView',
  'app/factoryLayout/templates/displayOptions'
], function(
  $,
  _,
  js2form,
  t,
  viewport,
  View,
  buttonGroup,
  OrgUnitPickerView,
  displayOptionsTemplate
) {
  'use strict';

  return View.extend({

    template: displayOptionsTemplate,

    events: {
      'submit': function(e)
      {
        e.preventDefault();
      },
      'change [name="statuses[]"]': function()
      {
        this.model.set('statuses', buttonGroup.getValue(this.$id('statuses')));
      },
      'change [name="states[]"]': function()
      {
        this.model.set('states', buttonGroup.getValue(this.$id('states')));
      },
      'change [name="blacklisted"]': function()
      {
        this.model.set('blacklisted', buttonGroup.getValue(this.$id('blacklisted')) === '1');
      },
      'click #-showPicker': function()
      {
        var orgUnitPickerView = new OrgUnitPickerView({
          model: {
            orgUnitType: this.model.get('orgUnitType'),
            orgUnitIds: this.model.get('orgUnitIds')
          }
        });

        this.listenTo(orgUnitPickerView, 'picked', function(orgUnitType, orgUnitIds)
        {
          viewport.closeDialog();

          this.model.set({
            orgUnitType: orgUnitType,
            orgUnitIds: orgUnitIds
          });
        });

        viewport.showDialog(orgUnitPickerView, t('factoryLayout', 'picker:title'));
      },
      'click #-save': function()
      {
        this.model.save();

        viewport.msg.show({
          type: 'success',
          time: 1000,
          text: t('factoryLayout', 'options:saved')
        });
      }
    },

    afterRender: function()
    {
      js2form(this.el, this.serializeFormData());

      buttonGroup.toggle(this.$id('statuses'));
      buttonGroup.toggle(this.$id('states'));
      buttonGroup.toggle(this.$id('blacklisted'));
    },

    serializeFormData: function()
    {
      return {
        statuses: this.model.get('statuses'),
        states: this.model.get('states'),
        blacklisted: this.model.get('blacklisted') ? '1': '0'
      };
    }

  });
});
