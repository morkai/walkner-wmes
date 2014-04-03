define([
  'underscore',
  'jquery',
  'app/time',
  'app/i18n',
  'app/viewport',
  'app/data/downtimeReasons',
  'app/data/prodLines',
  'app/core/Model',
  'app/core/views/FormView',
  'app/pressWorksheets/templates/form',
  'app/pressWorksheets/templates/ordersTable',
  'app/pressWorksheets/templates/ordersTableRow'
], function(
  _,
  $,
  time,
  t,
  viewport,
  downtimeReasons,
  prodLines,
  Model,
  FormView,
  formTemplate,
  renderOrdersTable,
  renderOrdersTableRow
) {
  'use strict';

  var SELECT2_USERS_AJAX = {
    cache: true,
    quietMillis: 500,
    url: function(term)
    {
      return '/users'
        + '?select(lastName,firstName)'
        + '&sort(lastName,firstName)'
        + '&limit(20)'
        + '&regex(lastName,' + encodeURIComponent('^' + term) + ',i)';
    },
    results: function(data)
    {
      return {
        results: (data.collection || []).map(function(user)
        {
          return {id: user._id, text: user.lastName + ' ' + user.firstName};
        })
      };
    }
  };

  return FormView.extend({

    template: formTemplate,

    idPrefix: 'pressWorksheetForm',

    events: {
      'keydown': function(e)
      {
        if (e.keyCode === 13)
        {
          return false;
        }
      },
      'submit': function(e)
      {
        this.removeIsOverlapping();

        return this.submitForm(e);
      },
      'blur .pressWorksheets-form-time': function(e)
      {
        var time = e.target.value.trim().replace(/[^0-9: \-]+/g, '');

        if (time.length === 0)
        {
          return;
        }

        var matches = time.match(/^([0-9]+)(?::| +|\-)+([0-9]+)$/);
        var hh = 0;
        var mm = 0;

        if (matches)
        {
          hh = parseInt(matches[1], 10);
          mm = parseInt(matches[2], 10);
        }
        else if (time.length === 4)
        {
          hh = parseInt(time.substr(0, 2), 10);
          mm = parseInt(time.substr(2), 10);
        }
        else if (time.length === 3)
        {
          hh = parseInt(time[0], 10);
          mm = parseInt(time.substr(1), 10);
        }
        else
        {
          mm = parseInt(time, 10);
        }

        var invalidH = isNaN(hh) || hh >= 24;
        var invalidM = isNaN(mm) || mm >= 60;

        if (invalidH)
        {
          hh = 0;
        }

        if (invalidM)
        {
          mm = 0;
        }

        e.target.value = (hh < 10 ? '0' : '') + hh.toString(10)
          + ':' + (mm < 10 ? '0' : '') + mm.toString(10);

        this.validateTimes(e.target);
      },
      'blur .pressWorksheets-form-count': function(e)
      {
        var num = parseInt(e.target.value, 10);

        e.target.value = isNaN(num) ? '' : num;

        if (e.target.classList.contains('is-downtime'))
        {
          this.validateTimes(e.target);
        }
      },
      'blur .pressWorksheets-form-quantityDone': function(e)
      {
        var num = parseInt(e.target.value, 10);

        e.target.value = isNaN(num) || num < 0 ? '' : num;
      },
      'focus input': function(e)
      {
        if (e.target.classList.contains('select2-focusser')
          && e.target.parentNode.classList.contains('pressWorksheets-form-part'))
        {
          this.$('.table-responsive').prop('scrollLeft', 0);
        }
        else if (e.target.classList.contains('pressWorksheets-form-time')
          && e.target.parentNode.classList.contains('form-group'))
        {
          this.paintShopTimeFocused = true;
        }
      },
      'focus .pressWorksheets-form-order input': function(e)
      {
        var $input = this.$(e.target);

        $input.closest('td').addClass('is-focused');

        if ($input.hasClass('select2-focusser'))
        {
          $input = $input.parent().next('.select2-offscreen');
        }

        if ($input[0].dataset.column)
        {
          this.$('th[data-column="' + $input[0].dataset.column + '"]').addClass('is-focused');
        }
      },
      'blur .pressWorksheets-form-order input': function(e)
      {
        this.$(e.target).closest('td').removeClass('is-focused');
        this.$('th.is-focused').removeClass('is-focused');
      },
      'change input[name=shift]': function()
      {
        this.checkShiftStartTimeValidity();
        this.validateTimes(null);
      },
      'change input[name=date]': 'checkShiftStartTimeValidity',
      'change input[name=type]': function()
      {
        this.togglePaintShop();

        if (!this.filling)
        {
          this.renderOrdersTable();
          this.addOrderRow();
        }
      }
    },

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.filling = false;
      this.lastOrderNo = -1;
      this.lossReasons = [];
      this.downtimeReasons = [];
      this.paintShopTimeFocused = false;
    },

    destroy: function()
    {
      this.$('.select2-offscreen[tabindex="-1"]').select2('destroy');
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.prodLinesData = prodLines
        .filter(function(prodLine)
        {
          var subdivision = prodLine.getSubdivision();

          return subdivision && subdivision.get('type') === 'press';
        })
        .map(function(prodLine)
        {
          return {
            id: prodLine.id,
            text: prodLine.id
          };
        });

      var $operators = this.$id('operators').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        minimumInputLength: 3,
        ajax: SELECT2_USERS_AJAX
      });

      $operators.on('change', function()
      {
        if (!$operator.select2('data'))
        {
          $operator.select2('data', $operators.select2('data')[0]);
        }
      });

      var $operator = this.$id('operator').select2({
        width: '100%',
        allowClear: true,
        minimumInputLength: 3,
        ajax: SELECT2_USERS_AJAX
      });

      this.$id('master').select2({
        width: '100%',
        allowClear: true,
        minimumInputLength: 3,
        ajax: SELECT2_USERS_AJAX
      });

      this.fillType();
      this.renderOrdersTable();
      this.fillModelData();
      this.addOrderRow();

      if (!this.model.id)
      {
        this.$id('type').focus();
      }
    },

    renderOrdersTable: function()
    {
      var optics = this.getType() === 'optics';
      var sortProperty = optics ? 'opticsPosition' : 'pressPosition';

      this.lossReasons = optics ? [] : this.model.lossReasons.toJSON();

      this.downtimeReasons = downtimeReasons
        .filter(function(downtimeReason)
        {
          return downtimeReason.get(sortProperty) >= 0;
        })
        .map(function(downtimeReason) { return downtimeReason.toJSON(); })
        .sort(function(a, b) { return a[sortProperty] - b[sortProperty]; });

      this.lastOrderNo = -1;

      this.$id('ordersTable').html(renderOrdersTable({
        rowspan: this.lossReasons.length || this.downtimeReasons.length ? 2 : 0,
        lossReasons: this.lossReasons,
        downtimeReasons: this.downtimeReasons
      }));
    },

    serializeForm: function(formData)
    {
      var $orders = this.$('.pressWorksheets-form-order');

      formData.orders = (formData.orders || [])
        .filter(function(order)
        {
          return order.part && order.part.length && order.operation && order.operation.length;
        })
        .map(this.serializeOrder.bind(this, $orders, this.model.lossReasons));

      formData.operators = this.$id('operators').select2('data').map(userDataToInfo);
      formData.operator = userDataToInfo(this.$id('operator').select2('data'));
      formData.master = userDataToInfo(this.$id('master').select2('data'));
      formData.shift = parseInt(formData.shift, 10);

      function userDataToInfo(userData)
      {
        return {
          id: userData.id,
          label: userData.text
        };
      }

      return formData;
    },

    serializeOrder: function($orders, lossReasons, order, i)
    {
      var $order = $orders.eq(i);
      var $part = $order.find('.pressWorksheets-form-part');

      var orderData = $part.select2('data').data;

      if (orderData._id)
      {
        orderData.nc12 = orderData._id;
        delete orderData._id;
      }

      var operationData = _.find(orderData.operations, function(operation)
      {
        return operation.no === order.operation;
      });

      var losses = [];

      if (order.losses)
      {
        Object.keys(order.losses).forEach(function(lossReason)
        {
          lossReason = lossReasons.get(lossReason);

          if (order.losses[lossReason.id] > 0)
          {
            losses.push({
              reason: lossReason.id,
              label: lossReason.get('label'),
              count: parseInt(order.losses[lossReason.id], 10)
            });
          }
        });
      }

      var downtimes = [];

      if (order.downtimes)
      {
        Object.keys(order.downtimes).forEach(function(downtimeReason)
        {
          var duration = parseInt(order.downtimes[downtimeReason], 10);

          if (duration > 0)
          {
            downtimeReason = downtimeReasons.get(downtimeReason);

            var $downtime = $order.find('.is-downtime[data-reason="' + downtimeReason.id + '"]');

            downtimes.push({
              prodDowntime: $downtime.attr('data-prodDowntime') || null,
              reason: downtimeReason.id,
              label: downtimeReason.get('label'),
              duration: duration
            });
          }
        });
      }

      return {
        prodShiftOrder: $part.attr('data-prodShiftOrder') || null,
        prodLine: order.prodLine,
        nc12: orderData.nc12,
        name: orderData.name,
        operationNo: operationData.no,
        operationName: operationData.name,
        orderData: orderData,
        quantityDone: order.quantityDone,
        startedAt: order.startedAt || null,
        finishedAt: order.finishedAt || null,
        losses: losses,
        downtimes: downtimes
      };
    },

    checkShiftStartTimeValidity: function()
    {
      var $date = this.$id('date');
      var shiftMoment = this.getShiftMoment();

      $date[0].setCustomValidity(
        shiftMoment.valueOf() > Date.now() ? t('pressWorksheets', 'FORM:ERROR:date') : ''
      );

      if (this.isPaintShop())
      {
        var $startedAt = this.$id('startedAt');
        var $finishedAt = this.$id('finishedAt');

        if (!shiftMoment.isValid())
        {
          return;
        }

        if (!this.paintShopTimeFocused)
        {
          $startedAt.val(shiftMoment.format('HH:mm'));
          $finishedAt.val(shiftMoment.add('hours', 8).format('HH:mm'));
        }
      }
    },

    getShiftMoment: function()
    {
      var $date = this.$id('date');
      var shift = parseInt(this.$('input[name=shift]:checked').val(), 10);

      return time.getMoment($date.val() + ' 06:00:00').add('h', (shift - 1) * 8);
    },

    getType: function()
    {
      return this.$('input[name=type]:checked').val();
    },

    isPaintShop: function()
    {
      return this.getType() === 'paintShop';
    },

    showFieldError: function($field, field)
    {
      if ($field.hasClass('select2-offscreen'))
      {
        $field.select2('focus');
      }
      else
      {
        $field.focus();
      }

      this.$errorMessage = viewport.msg.show({
        type: 'error',
        time: 3000,
        text: t('pressWorksheets', 'FORM:ERROR:' + field)
      });

      return false;
    },

    setUpOrderSelect2: function($order)
    {
      var view = this;

      $order.removeClass('form-control');

      $order.select2({
        allowClear: true,
        minimumInputLength: 6,
        ajax: {
          cache: true,
          quietMillis: 300,
          url: function(term)
          {
            return '/production/orders?nc12=' + encodeURIComponent(term);
          },
          results: function(results)
          {
            return {
              results: (results || []).map(function(order)
              {
                return {
                  id: order._id,
                  text: order._id + ' - ' + (order.name || '?'),
                  data: order
                };
              })
            };
          }
        }
      });

      $order.on('change', function(e)
      {
        var $row = $order.closest('.pressWorksheets-form-order');
        var last = view.isLastOrderRow($row);

        if (!e.added && !last)
        {
          ($row.next() || $row.prev()).find('.pressWorksheets-form-part').select2('focus');

          $row.fadeOut(function()
          {
            $row.remove();
            view.setUpPartValidation();
            view.recalcOrderNoColumn();
          });

          if (!e.added && view.$('.pressWorksheets-form-order').length === 2)
          {
            view.$('.message-warning').fadeOut();
          }

          return;
        }

        var operations =
          e.added && Array.isArray(e.added.data.operations) ? e.added.data.operations : [];
        var $operation = $row.find('.pressWorksheets-form-operation');

        view.setUpOperationSelect2($operation, operations.map(function(operation)
        {
          return {
            id: operation.no,
            text: operation.no + ' - ' + (operation.name || '?')
          };
        }));

        if (operations.length)
        {
          $operation.select2('val', operations[0].no).select2('focus');
        }
        else
        {
          $operation.select2('destroy');
          $operation.select2('destroy');
          $operation.addClass('form-control').val('');
          $order.select2('focus');
        }

        if (last)
        {
          view.addOrderRow($row);
        }
      });
    },

    setUpOperationSelect2: function($operation, data)
    {
      $operation.removeClass('form-control');

      $operation.select2({
        openOnEnter: null,
        allowClear: false,
        data: data || []
      });
    },

    setUpProdLineSelect2: function($prodLine, $lastRow)
    {
      $prodLine.removeClass('form-control');

      $prodLine.select2({
        width: '185px',
        openOnEnter: null,
        allowClear: false,
        data: this.prodLinesData
      });

      if ($lastRow)
      {
        $prodLine.select2('val', $lastRow.find('.pressWorksheets-form-prodLine').select2('val'));
      }
    },

    isLastOrderRow: function($row)
    {
      return this.$('.pressWorksheets-form-order:last-child')[0] === $row[0];
    },

    addOrderRow: function($lastRow, single)
    {
      single = single !== false;

      ++this.lastOrderNo;

      var $orderRow = $(renderOrdersTableRow({
        no: this.lastOrderNo,
        lossReasons: this.lossReasons,
        downtimeReasons: this.downtimeReasons
      }));

      if (this.lastOrderNo > 0 && single)
      {
        $orderRow.hide();
      }

      this.$('.pressWorksheets-form-prodLine:last-child').attr('required', true);
      this.$('.pressWorksheets-form-quantityDone:last-child').attr('required', true);

      if (!this.isPaintShop())
      {
        this.$('.pressWorksheets-form-startedAt:last-child').attr('required', true);
        this.$('.pressWorksheets-form-finishedAt:last-child').attr('required', true);
      }

      this.$('.pressWorksheets-form-orders > tbody').append($orderRow);

      if (this.lastOrderNo > 0 && single)
      {
        $orderRow.fadeIn();
      }

      this.setUpOrderSelect2($orderRow.find('.pressWorksheets-form-part'));
      this.setUpProdLineSelect2($orderRow.find('.pressWorksheets-form-prodLine'), $lastRow);

      var $warning = this.$('.message-warning');

      if (single)
      {
        if (this.lastOrderNo > 0)
        {
          $warning.fadeIn();
        }
        else
        {
          $warning.fadeOut();
        }
      }
      else
      {
        $warning.toggle(this.lastOrderNo > 0);
      }

      if (single)
      {
        this.setUpPartValidation();
        this.recalcOrderNoColumn();
      }

      return $orderRow;
    },

    setUpPartValidation: function()
    {
      var $allParts = this.$('input.pressWorksheets-form-part');

      $allParts.last().attr('required', $allParts.length === 1);
    },

    recalcOrderNoColumn: function()
    {
      this.$('.pressWorksheets-form-order > td:first-child').each(function(i)
      {
        this.innerHTML = (i + 1) + '.';
      });
    },

    togglePaintShop: function()
    {
      var isPaintShop = this.isPaintShop();

      this.$el.toggleClass('pressWorksheets-form-paintShop', isPaintShop);
      this.$('.pressWorksheets-form-group-paintShop input').attr('required', isPaintShop);
    },

    validateTimes: function(targetEl)
    {
      if (this.isPaintShop())
      {
        this.checkPaintShopValidity();
      }
      else
      {
        if (targetEl)
        {
          this.checkOrderTimesValidity(targetEl);
        }
        else
        {
          var view = this;

          this.$('.pressWorksheets-form-startedAt').each(function()
          {
            view.checkOrderTimesValidity(this);
          });
        }
      }
    },

    checkPaintShopValidity: function()
    {
      var $startedAt = this.$id('startedAt');
      var $finishedAt = this.$id('finishedAt');

      $startedAt[0].setCustomValidity('');
      $finishedAt[0].setCustomValidity('');

      this.checkTimesValidity(null, $startedAt, $finishedAt);
    },

    checkOrderTimesValidity: function(targetEl)
    {
      var $orderRow = this.$(targetEl).closest('.pressWorksheets-form-order');
      var $startedAt = $orderRow.find('.pressWorksheets-form-startedAt');
      var $finishedAt = $orderRow.find('.pressWorksheets-form-finishedAt');

      $startedAt[0].setCustomValidity('');
      $finishedAt[0].setCustomValidity('');

      if (!$startedAt.prop('required')
        || $startedAt.val() === ''
        || $finishedAt.val() === '')
      {
        return;
      }

      this.checkTimesValidity($orderRow, $startedAt, $finishedAt);
    },

    checkTimesValidity: function($orderRow, $startedAt, $finishedAt)
    {
      var date = this.$id('date').val();

      if (!date)
      {
        date = time.format(new Date(), 'YYYY-MM-DD');
      }

      var shiftMoment = this.getShiftMoment();
      var shiftStartTime = shiftMoment.valueOf();
      var shiftEndTime = shiftStartTime + 8 * 3600 * 1000;
      var startedAt = this.getTimeFromString(date, $startedAt.val(), false);
      var finishedAt = this.getTimeFromString(date, $finishedAt.val(), true);

      if (startedAt < shiftStartTime || startedAt > shiftEndTime)
      {
        return $startedAt[0].setCustomValidity(
          t('pressWorksheets', 'FORM:ERROR:startedAt:boundries')
        );
      }

      if (finishedAt < shiftStartTime || finishedAt > shiftEndTime)
      {
        return $finishedAt[0].setCustomValidity(
          t('pressWorksheets', 'FORM:ERROR:finishedAt:boundries')
        );
      }

      if (finishedAt <= startedAt)
      {
        return $finishedAt[0].setCustomValidity(
          t('pressWorksheets', 'FORM:ERROR:finishedAt:gt')
        );
      }

      var orderDuration = (finishedAt - startedAt) / 3600000;
      var downtimeDuration = this.countDowntimeDuration(this.isPaintShop() ? null : $orderRow);

      if (downtimeDuration >= orderDuration)
      {
        return $finishedAt[0].setCustomValidity(
          t('pressWorksheets', 'FORM:ERROR:finishedAt:downtime')
        );
      }
    },

    checkValidity: function()
    {
      var orderRowEls = this.el.querySelectorAll('.pressWorksheets-form-order');
      var lastIndex = orderRowEls.length - 1;
      var date = this.$id('date').val();
      var timesByProdLine = {};

      for (var i = 0; i < lastIndex; ++i)
      {
        var orderRowEl = orderRowEls[i];
        var prodLine = orderRowEl.querySelector('input.pressWorksheets-form-prodLine').value;

        if (!timesByProdLine[prodLine])
        {
          timesByProdLine[prodLine] = [];
        }

        timesByProdLine[prodLine].push({
          orderRowEl: orderRowEl,
          startedAt: this.getTimeFromString(
            date, orderRowEl.querySelector('.pressWorksheets-form-startedAt').value, false
          ),
          finishedAt: this.getTimeFromString(
            date, orderRowEl.querySelector('.pressWorksheets-form-finishedAt').value, false
          )
        });
      }

      var valid = true;
      var view = this;

      Object.keys(timesByProdLine).forEach(function(prodLine)
      {
        if (!valid)
        {
          return;
        }

        var allTimes = timesByProdLine[prodLine];

        while (allTimes.length)
        {
          var checkingTimes = allTimes.shift();

          for (var j = 0, l = allTimes.length; j < l; ++j)
          {
            var times = allTimes[j];

            if ((times.startedAt >= checkingTimes.startedAt
              && times.startedAt < checkingTimes.finishedAt)
              || (times.finishedAt > checkingTimes.startedAt
              && times.finishedAt <= checkingTimes.finishedAt))
            {
              valid = view.showOverlappingError(checkingTimes, times);

              return;
            }

            if ((checkingTimes.startedAt >= times.startedAt
              && checkingTimes.startedAt < times.finishedAt)
              || (checkingTimes.finishedAt > times.startedAt
              && checkingTimes.finishedAt <= times.finishedAt))
            {
              valid = view.showOverlappingError(times, checkingTimes);

              return;
            }
          }
        }
      });

      return valid;
    },

    showOverlappingError: function(a, b)
    {
      this.$errorMessage = viewport.msg.show({
        type: 'error',
        time: 5000,
        text: t('pressWorksheets', 'FORM:ERROR:overlapping')
      });

      a.orderRowEl.classList.add('is-overlapping');
      b.orderRowEl.classList.add('is-overlapping');

      this.timers.removeIsOverlapping = setTimeout(this.removeIsOverlapping.bind(this), 5000);

      return false;
    },

    removeIsOverlapping: function()
    {
      if (this.timers.removeIsOverlapping)
      {
        clearTimeout(this.timers.removeIsOverlapping);
        this.timers.removeIsOverlapping = null;
      }

      this.$('.is-overlapping').removeClass('is-overlapping');
    },

    countDowntimeDuration: function($orderRow)
    {
      var downtimeDuration = 0;

      ($orderRow || this.$el).find('.pressWorksheets-form-count.is-downtime').each(function()
      {
        var duration = parseInt(this.value, 10);

        downtimeDuration += isNaN(duration) || duration <= 0 ? 0 : duration;
      });

      return downtimeDuration / 60;
    },

    getTimeFromString: function(date, timeString, finish)
    {
      var timeMoment = time.getMoment(date + ' ' + timeString + ':00');

      if (finish && timeMoment.hours() === 6 && timeMoment.minutes() === 0)
      {
        timeMoment.hours(5).minutes(59).seconds(59).milliseconds(999);
      }

      if (timeMoment.hours() < 6)
      {
        timeMoment.add('days', 1);
      }

      return timeMoment.valueOf();
    },

    serializeToForm: function()
    {
      return {};
    },

    fillModelData: function()
    {
      this.filling = true;

      this.fillPersonnel();
      this.fillDateAndTimes();

      var orders = this.model.get('orders');

      if (Array.isArray(orders) && orders.length)
      {
        orders.forEach(this.fillOrder, this);
      }

      this.filling = false;
    },

    fillType: function()
    {
      this.$('input[name=type][value=' + this.model.get('type') + ']').trigger('click', true);
    },

    fillPersonnel: function()
    {
      var operators = this.model.get('operators');
      var operator = this.model.get('operator');
      var master = this.model.get('master');

      if (Array.isArray(operators) && operators.length)
      {
        this.$id('operators').select2('data', operators.map(userInfoToData));
      }

      if (operator)
      {
        this.$id('operator').select2('data', userInfoToData(operator));
      }

      if (master)
      {
        this.$id('master').select2('data', userInfoToData(master));
      }

      function userInfoToData(userInfo)
      {
        return {
          id: userInfo.id,
          text: userInfo.label
        };
      }
    },

    fillDateAndTimes: function()
    {
      this.$id('date').val(time.format(this.model.get('date'), 'YYYY-MM-DD'));
      this.$('input[name=shift][value=' + this.model.get('shift') + ']').click();

      if (this.model.get('type') === 'paintShop')
      {
        this.$id('startedAt').val(this.model.get('startedAt'));
        this.$id('finishedAt').val(this.model.get('finishedAt'));
      }
    },

    fillOrder: function(order)
    {
      var $orderRow = this.addOrderRow(null, false);
      var $part = $orderRow.find('.pressWorksheets-form-part');
      var $operation = $orderRow.find('.pressWorksheets-form-operation');

      $part.attr('data-prodShiftOrder', order.prodShiftOrder).select2('data', {
        id: order.nc12,
        text: order.nc12 + ' - ' + (order.name || '?'),
        data: order.orderData
      });

      this.setUpOperationSelect2($operation, _.map(order.orderData.operations, function(operation)
      {
        return {
          id: operation.no,
          text: operation.no + ' - ' + (operation.name || '?')
        };
      }));

      $operation.select2('val', order.operationNo);

      $orderRow.find('.pressWorksheets-form-prodLine').select2('val', order.prodLine);
      $orderRow.find('.pressWorksheets-form-quantityDone').val(order.quantityDone);

      if (Array.isArray(order.losses))
      {
        order.losses.forEach(this.fillLoss.bind(this, $orderRow));
      }

      if (Array.isArray(order.downtimes))
      {
        order.downtimes.forEach(this.fillDowntime.bind(this, $orderRow));
      }

      if (this.model.get('type') !== 'paintShop')
      {
        $orderRow.find('.pressWorksheets-form-startedAt').val(order.startedAt);
        $orderRow.find('.pressWorksheets-form-finishedAt').val(order.finishedAt);
      }
    },

    fillLoss: function($orderRow, loss)
    {
      $orderRow.find('.is-loss[data-reason="' + loss.reason + '"]').val(loss.count);
    },

    fillDowntime: function($orderRow, downtime)
    {
      var $downtime = $orderRow.find('.is-downtime[data-reason="' + downtime.reason + '"]');

      $downtime
        .attr('data-prodDowntime', downtime.prodDowntime)
        .val(downtime.duration);
    }

  });
});
