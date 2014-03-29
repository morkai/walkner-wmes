define([
  'underscore',
  'app/i18n',
  'app/viewport',
  'app/data/downtimeReasons',
  'app/data/aors',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/prodDowntimes/templates/editForm'
], function(
  _,
  t,
  viewport,
  downtimeReasons,
  aors,
  FormView,
  setUpUserSelect2,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'prodDowntimeEditForm',

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.setUpUserSelect2('master');
      this.setUpUserSelect2('leader');
      this.setUpUserSelect2('operator');
      this.setUpReasonSelect2();
      this.setUpAorSelect2();

      if (this.model.get('status') === 'undecided')
      {
        this.$('input[name=status]').attr('disabled', true);
        this.$id('decisionComment').attr('disabled', true);
      }

      this.$id('master').select2('focus');
    },

    setUpUserSelect2: function(personnelProperty)
    {
      var $user = setUpUserSelect2(this.$id(personnelProperty));

      var userInfo = this.model.get(personnelProperty);

      if (userInfo && userInfo.id && userInfo.label)
      {
        $user.select2('data', {
          id: userInfo.id,
          text: userInfo.label,
          name: userInfo.label
        });
      }
    },

    setUpReasonSelect2: function()
    {
      this.$id('reason').select2({
        data: downtimeReasons.map(function(downtimeReason)
        {
          return {
            id: downtimeReason.id,
            text: downtimeReason.id + ' - ' + downtimeReason.getLabel()
          };
        })
      });
    },

    setUpAorSelect2: function()
    {
      this.$id('aor').select2({
        data: aors.map(function(aor)
        {
          return {
            id: aor.id,
            text: aor.getLabel()
          };
        })
      });
    },

    serializeForm: function(formData)
    {
      formData.master = this.serializeUserInfo('master');
      formData.leader = this.serializeUserInfo('leader');
      formData.operator = this.serializeUserInfo('operator');
      formData.operators = formData.operator ? [formData.operator] : [];

      return formData;
    },

    serializeUserInfo: function(personnelProperty)
    {
      var userInfo = this.$id(personnelProperty).select2('data');

      if (userInfo === null)
      {
        return null;
      }

      return {
        id: userInfo.id,
        label: userInfo.name
      };
    },

    handleFailure: function(xhr)
    {
      if (xhr.responseJSON
        && xhr.responseJSON.error
        && xhr.responseJSON.error.message === 'INVALID_CHANGES')
      {
        this.$errorMessage = viewport.msg.show({
          type: 'warning',
          time: 5000,
          text: t('prodDowntimes', 'FORM:ERROR:INVALID_CHANGES')
        });
      }
      else
      {
        FormView.prototype.handleFailure.apply(this, arguments);
      }
    }

  });
});
