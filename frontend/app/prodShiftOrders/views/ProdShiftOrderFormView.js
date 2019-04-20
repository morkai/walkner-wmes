// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/prodChangeRequests/util/isChangeRequest',
  'app/production/util/orderPickerHelpers',
  'app/prodShiftOrders/templates/form'
], function(
  _,
  t,
  user,
  time,
  viewport,
  FormView,
  setUpUserSelect2,
  isChangeRequest,
  orderPickerHelpers,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.call(this), {
        isChangeRequest: isChangeRequest()
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.setUpUserSelect2('master');
      this.setUpUserSelect2('leader');
      this.setUpUserSelect2('operators', true);

      orderPickerHelpers.setUpOrderSelect2(this.$id('order'), this.$id('operation'), this.model);
      orderPickerHelpers.setUpOperationSelect2(this.$id('operation'), []);
      orderPickerHelpers.selectOrder(this.$id('order'), this.model);

      this.$id('master').select2('focus');
    },

    setUpUserSelect2: function(personnelProperty, multiple)
    {
      var $user = setUpUserSelect2(this.$id(personnelProperty), {
        multiple: !!multiple
      });

      var userInfo = this.model.get(personnelProperty);

      if (Array.isArray(userInfo))
      {
        $user.select2('data', userInfo.map(function(u)
        {
          return {
            id: u.id,
            text: u.label
          };
        }));
      }
      else if (userInfo && userInfo.id && userInfo.label)
      {
        $user.select2('data', {
          id: userInfo.id,
          text: userInfo.label
        });
      }
    },

    showErrorMessage: function(message)
    {
      if (t.has('prodShiftOrders', 'FORM:ERROR:' + message))
      {
        message = t('prodShiftOrders', 'FORM:ERROR:' + message);
      }

      return FormView.prototype.showErrorMessage.call(this, message);
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
      formData.requestComment = '';

      return formData;
    },

    serializeForm: function(formData)
    {
      formData.master = this.serializeUserInfo('master');
      formData.leader = this.serializeUserInfo('leader');
      formData.operators = this.serializeUserInfo('operators');
      formData.operator = formData.operators.length ? formData.operators[0] : null;
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

      formData.startedAt = time.getMoment(formData.startedAtDate + ' ' + formData.startedAtTime).toDate();
      formData.finishedAt = time.getMoment(formData.finishedAtDate + ' ' + formData.finishedAtTime).toDate();

      delete formData.startedAtDate;
      delete formData.startedAtTime;
      delete formData.finishedAtDate;
      delete formData.finishedAtTime;

      return formData;
    },

    serializeUserInfo: function(personnelProperty)
    {
      var userInfo = this.$id(personnelProperty).select2('data');

      if (Array.isArray(userInfo))
      {
        return userInfo.map(function(u)
        {
          return {
            id: u.id,
            label: u.text
          };
        });
      }

      if (userInfo === null)
      {
        return null;
      }

      return {
        id: userInfo.id,
        label: userInfo.text
      };
    },

    handleSuccess: function()
    {
      if (isChangeRequest())
      {
        if (this.options.editMode)
        {
          return this.handleEditSuccess();
        }

        viewport.msg.show({
          type: 'success',
          time: 2500,
          text: t('prodShiftOrders', 'changeRequest:msg:success:add')
        });
      }

      FormView.prototype.handleSuccess.apply(this, arguments);
    },

    handleEditSuccess: function()
    {
      this.model.set(this.model.previousAttributes());

      if (viewport.currentDialog === this)
      {
        showMessage();
      }
      else
      {
        this.broker.subscribe('router.executing').setLimit(1).on('message', showMessage);
      }

      return FormView.prototype.handleSuccess.apply(this, arguments);

      function showMessage()
      {
        viewport.msg.show({
          type: 'success',
          time: 5000,
          text: t('prodShiftOrders', 'changeRequest:msg:success:edit')
        });
      }
    },

    handleFailure: function(xhr)
    {
      var json = xhr.responseJSON;

      if (json && json.error && t.has('prodShiftOrders', 'FORM:ERROR:' + json.error.message))
      {
        this.showErrorMessage(json.error.message);
      }
      else if (isChangeRequest())
      {
        this.showErrorMessage(t(
          'prodShiftOrders',
          'changeRequest:msg:failure:' + (this.options.editMode ? 'edit' : 'add')
        ));
      }
      else
      {
        FormView.prototype.handleFailure.apply(this, arguments);
      }
    }

  });
});
