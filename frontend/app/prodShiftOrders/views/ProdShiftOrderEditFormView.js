// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/production/util/orderPickerHelpers',
  'app/prodShiftOrders/templates/editForm'
], function(
  _,
  t,
  time,
  viewport,
  FormView,
  setUpUserSelect2,
  orderPickerHelpers,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'prodShiftOrderEditForm',

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

      orderPickerHelpers.setUpOrderSelect2(this.$id('order'), this.$id('operation'), this.model);
      orderPickerHelpers.setUpOperationSelect2(this.$id('operation'), []);
      orderPickerHelpers.selectOrder(this.$id('order'), this.model);

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
      if (typeof formData.orderId !== 'string' || !formData.orderId.length)
      {
        return this.showErrorMessage('order');
      }

      if (typeof formData.operationNo !== 'string' || !formData.operationNo.length)
      {
        return this.showErrorMessage('operation');
      }

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
      formData.quantityDone = parseInt(formData.quantityDone, 10);
      formData.workerCount = parseInt(formData.workerCount, 10);

      if (isNaN(formData.quantityDone) || formData.quantityDone < 0)
      {
        formData.quantityDone = 0;
      }

      if (isNaN(formData.workerCount) || formData.workerCount < 1)
      {
        formData.workerCount = 1;
      }

      formData.operationNo = this.$id('operation').select2('val');
      formData.orderData = this.$id('order').select2('data');

      if (!formData.orderData)
      {
        formData.orderId = null;
      }
      else if (formData.orderData.sameOrder)
      {
        delete formData.sameOrder;

        formData.orderId = this.model.get('orderId');
      }
      else
      {
        orderPickerHelpers.prepareOrderInfo(this.model, formData.orderData);

        formData.mechOrder = formData.orderData.no === null;
        formData.orderId = formData.orderData[formData.mechOrder ? 'nc12' : 'no'];
      }

      formData.startedAt = new Date(formData.startedAtDate + ' ' + formData.startedAtTime);
      formData.finishedAt = new Date(formData.finishedAtDate + ' ' + formData.finishedAtTime);

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
        && xhr.responseJSON.error.message === 'INVALID_CHANGES')
      {
        this.$errorMessage = viewport.msg.show({
          type: 'warning',
          time: 5000,
          text: t('prodShiftOrders', 'FORM:ERROR:INVALID_CHANGES')
        });
      }
      else
      {
        FormView.prototype.handleFailure.apply(this, arguments);
      }
    }

  });
});
