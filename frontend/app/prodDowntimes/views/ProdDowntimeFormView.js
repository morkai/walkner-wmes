// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/data/downtimeReasons',
  'app/data/aors',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/prodDowntimes/templates/form'
], function(
  t,
  time,
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
          text: userInfo.label
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

    showErrorMessage: function(message)
    {
      this.$errorMessage = viewport.msg.show({
        type: 'error',
        text: t('prodShiftOrders', 'FORM:ERROR:' + message)
      });

      return false;
    },

    checkValidity: function(formData)
    {
      if (formData.finishedAt <= formData.startedAt)
      {
        return this.showErrorMessage('times');
      }

      return this.checkTimeValidity(formData, 'startedAt')
        && this.checkTimeValidity(formData, 'finishedAt');
    },

    checkTimeValidity: function(formData, timeProperty)
    {
      var time = formData[timeProperty].getTime();
      var shiftStartTime = Date.parse(this.model.get('date'));
      var shiftEndTime = shiftStartTime + 8 * 3600 * 1000;

      if (time === shiftEndTime)
      {
        time -= 1;
      }

      if (time < shiftStartTime || time >= shiftEndTime)
      {
        return this.showErrorMessage(timeProperty);
      }

      return true;
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.startedAtDate = time.format(formData.startedAt, 'YYYY-MM-DD');
      formData.startedAtTime = time.format(formData.startedAt, 'HH:mm:ss');
      formData.finishedAtDate = time.format(formData.finishedAt, 'YYYY-MM-DD');
      formData.finishedAtTime = time.format(formData.finishedAt, 'HH:mm:ss');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.master = this.serializeUserInfo('master');
      formData.leader = this.serializeUserInfo('leader');
      formData.operator = this.serializeUserInfo('operator');
      formData.operators = formData.operator ? [formData.operator] : [];
      formData.startedAt =
        time.getMoment(formData.startedAtDate + ' ' + formData.startedAtTime).toDate();
      formData.finishedAt =
        time.getMoment(formData.finishedAtDate + ' ' + formData.finishedAtTime).toDate();

      delete formData.startedAtDate;
      delete formData.startedAtTime;
      delete formData.finishedAtDate;
      delete formData.finishedAtTime;

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
        label: userInfo.text
      };
    },

    handleFailure: function(xhr)
    {
      if (xhr.responseJSON
        && xhr.responseJSON.error
        && t.has('prodDowntimes', 'FORM:ERROR:' + xhr.responseJSON.error.message))
      {
        this.showErrorMessage(xhr.responseJSON.error.message);
      }
      else
      {
        FormView.prototype.handleFailure.apply(this, arguments);
      }
    }

  });
});
