// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/data/prodFunctions',
  'app/core/Model',
  'app/core/util/idAndLabel',
  'app/core/util/uuid',
  'app/core/templates/userInfo',
  'app/settings/views/SettingsView',
  'app/users/util/setUpUserSelect2',
  './QuickUsersFormView',
  'app/wmes-fap-entries/templates/settings',
  'app/wmes-fap-entries/templates/quickUsersTable'
], function(
  viewport,
  prodFunctions,
  Model,
  idAndLabel,
  uuid,
  userInfoTemplate,
  SettingsView,
  setUpUserSelect2,
  QuickUsersFormView,
  template,
  quickUsersTableTemplate
) {
  'use strict';

  return SettingsView.extend({

    clientUrl: '#fap/settings',

    template: template,

    events: Object.assign({
      'change input[data-setting]': function(e)
      {
        this.updateSetting(e.target.name, this.getValueFromSettingField(e.target));
      },
      'click #-addQuickUser': function()
      {
        this.showQuickUserDialog({
          _id: uuid(),
          label: '',
          funcs: [],
          users: []
        });
      },
      'click .btn[data-action="editQuickUser"]': function(e)
      {
        const id = this.$(e.target).closest('tr')[0].dataset.id;
        const qu = this.settings.getValue('quickUsers', []).find(qu => qu._id === id);

        if (qu)
        {
          this.showQuickUserDialog(qu);
        }
      },
      'click .btn[data-action="removeQuickUser"]': function(e)
      {
        const $tr = this.$(e.target).closest('tr');
        const id = $tr[0].dataset.id;

        $tr.fadeOut('fast', () => $tr.remove());

        this.updateSetting('fap.quickUsers', this.settings.getValue('quickUsers', []).filter(qu => qu._id !== id));
      }
    }, SettingsView.prototype.events),

    afterRender: function()
    {
      SettingsView.prototype.afterRender.apply(this, arguments);

      this.setUpFunctions();
      this.renderQuickUsers();
    },

    setUpFunctions: function()
    {
      this.$id('pendingFunctions').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        data: prodFunctions.map(idAndLabel)
      });

      this.$id('categoryFunctions').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        data: prodFunctions.map(idAndLabel)
      });

      this.updateSettingField(this.settings.get('fap.pendingFunctions'));
      this.updateSettingField(this.settings.get('fap.categoryFunctions'));
    },

    shouldAutoUpdateSettingField: function(setting)
    {
      return !/(Functions|quickUsers)$/i.test(setting.id);
    },

    updateSettingField: function(setting)
    {
      if (!setting)
      {
        return;
      }

      if (/Functions$/i.test(setting.id))
      {
        this.$id(setting.id.split('.')[1]).select2('data', (setting.getValue() || []).map(f =>
        {
          const prodFunction = prodFunctions.get(f);

          return {
            id: f,
            text: prodFunction ? prodFunction.getLabel() : f
          };
        }));
      }

      if (setting.id === 'fap.quickUsers')
      {
        this.renderQuickUsers();
      }
    },

    renderQuickUsers: function()
    {
      this.$id('quickUsers').replaceWith(this.renderPartialHtml(quickUsersTableTemplate, {
        quickUsers: this.settings.getValue('quickUsers', []).map(quickUser =>
        {
          return {
            _id: quickUser._id,
            label: quickUser.label,
            funcs: quickUser.funcs.map(f => prodFunctions.getLabel(f)).join(', '),
            users: quickUser.users.map(u => userInfoTemplate(u)).join(', ')
          };
        })
      }));
    },

    showQuickUserDialog: function(inputQu)
    {
      const dialogView = new QuickUsersFormView({
        model: new Model(inputQu)
      });

      viewport.showDialog(dialogView);

      this.listenTo(dialogView, 'save', outputQu =>
      {
        viewport.closeDialog();

        const quickUsers = [].concat(this.settings.getValue('quickUsers', []));
        const quickUserI = quickUsers.findIndex(qu => qu._id === outputQu._id);

        if (quickUserI === -1)
        {
          if (outputQu.funcs.length || outputQu.users.length)
          {
            quickUsers.push(outputQu);
          }
        }
        else if (outputQu.funcs.length || outputQu.users.length)
        {
          quickUsers[quickUserI] = outputQu;
        }
        else
        {
          quickUsers.splice(quickUserI, 1);
        }

        this.updateSetting('fap.quickUsers', quickUsers);

        this.renderQuickUsers();
      });
    }

  });
});
