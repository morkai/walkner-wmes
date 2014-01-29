define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/data/downtimeReasons',
  'app/data/prodLines',
  'app/core/Model',
  'app/core/views/FormView',
  'app/pressWorksheets/templates/form',
  'app/pressWorksheets/templates/orderRow',
  'i18n!app/nls/pressWorksheets'
], function(
  _,
  $,
  t,
  viewport,
  downtimeReasons,
  prodLines,
  Model,
  FormView,
  formTemplate,
  renderOrderRow
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
      'submit': 'submitForm',
      'blur .pressWorksheets-form-time': function(e)
      {
        var time = e.target.value.trim().replace(/[^0-9: \-]+/g, '');

        var matches = time.match(/^([0-9]+)(?::| +|\-)([0-9]+)$/);
        var hh = 0;
        var mm = 0;

        if (matches)
        {
          hh = parseInt(matches[1], 10);
          mm = parseInt(matches[2], 10);
        }

        if (isNaN(hh) || hh >= 24)
        {
          hh = 0;
        }

        if (isNaN(mm) || mm >= 60)
        {
          mm = 0;
        }

        e.target.value = (hh < 10 ? '0' : '') + hh.toString(10)
          + ':' + (mm < 10 ? '0' : '') + mm.toString(10);
      },
      'blur .pressWorksheets-form-count': function(e)
      {
        var num = parseInt(e.target.value, 10);

        e.target.value = isNaN(num) ? '' : num;
      },
      'blur .pressWorksheets-form-quantityDone': function(e)
      {
        var num = parseInt(e.target.value, 10);

        e.target.value = isNaN(num) || num < 0 ? 0 : num;
      },
      'focus input': function(e)
      {
        if (e.target.classList.contains('select2-focusser')
          && e.target.parentNode.classList.contains('pressWorksheets-form-part'))
        {
          this.$('.table-responsive').prop('scrollLeft', 0);
        }
      }
    },

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.lastOrderNo = -1;

      this.lossReasons = [];

      this.downtimeReasons = downtimeReasons
        .filter(function(downtimeReason) { return downtimeReason.get('pressPosition') >= 0; })
        .map(function(downtimeReason) { return downtimeReason.toJSON(); })
        .sort(function(a, b) { return a.pressPosition - b.pressPosition; });
    },

    beforeRender: function()
    {
      this.lossReasons = this.model.lossReasons.toJSON();
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

      this.$id('operators').select2({
        width: '100%',
        allowClear: true,
        multiple: true,
        minimumInputLength: 3,
        ajax: SELECT2_USERS_AJAX
      });

      this.$id('operator').select2({
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

      this.addOrderRow();

      this.$id('operators').select2('focus');
    },

    serialize: function()
    {
      return _.extend(FormView.prototype.serialize.call(this), {
        rowspan: this.lossReasons.length || this.downtimeReasons.length ? 2 : 0,
        lossReasons: this.lossReasons,
        downtimeReasons: this.downtimeReasons
      });
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

      var orderData = $order.find('.pressWorksheets-form-part').select2('data').data;
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
              _id: lossReason.id,
              label: lossReason.get('label'),
              count: order.losses[lossReason.id]
            });
          }
        });
      }

      var downtimes = [];

      if (order.downtimes)
      {
        Object.keys(order.downtimes).forEach(function(downtimeReason)
        {
          downtimeReason = downtimeReasons.get(downtimeReason);

          if (order.downtimes[downtimeReason.id] > 0)
          {
            downtimes.push({
              _id: downtimeReason.id,
              label: downtimeReason.get('label'),
              count: order.downtimes[downtimeReason.id]
            });
          }
        });
      }

      return {
        prodLine: order.prodLine,
        nc12: orderData._id,
        name: orderData.name,
        operationNo: operationData.no,
        operationName: operationData.name,
        orderData: orderData,
        quantityDone: order.quantityDone,
        startedAt: order.startedAt,
        finishedAt: order.finishedAt,
        losses: losses,
        downtimes: downtimes
      };
    },

    checkValidity: function(formData)
    {
      // TODO: Make sure that the specified date is not in the future

      if (formData.orders.length === 0)
      {
        this.showFieldError(0, 'part');

        return false;
      }

      var view = this;

      return !formData.orders.some(function(order, i)
      {
        if (!order.prodLine || !order.prodLine.length)
        {
          return view.showFieldError(i, 'prodLine');
        }

        if (isNaN(parseInt(order.quantityDone, 10)))
        {
          return view.showFieldError(i, 'quantityDone');
        }

        if (!order.startedAt || !order.startedAt.length)
        {
          return view.showFieldError(i, 'startedAt');
        }

        if (!order.finishedAt || !order.finishedAt.length)
        {
          return view.showFieldError(i, 'finishedAt');
        }

        return false;
      });
    },

    showFieldError: function(row, field)
    {
      var $field = this.$('.pressWorksheets-form-order')
        .eq(row)
        .find('.pressWorksheets-form-' + field);

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

      return true;
    },

    setUpOrderSelect2: function($order)
    {
      var view = this;

      $order.removeClass('form-control');

      $order.select2({
        allowClear: true,
        minimumInputLength: 3,
        ajax: {
          cache: true,
          quietMillis: 500,
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

          $row.fadeOut(function() { $row.remove(); });

          return;
        }

        var operations =
          e.added && Array.isArray(e.added.data.operations) ? e.added.data.operations : [];
        var $operation = $row.find('.pressWorksheets-form-operation');

        view.setUpOperationSelect2($operation, operations.map(function(operation)
        {
          return {
            id: operation.no,
            text: operation.no + ' - ' + operation.name
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

    addOrderRow: function($lastRow)
    {
      ++this.lastOrderNo;

      var $orderRow = $(renderOrderRow({
        no: this.lastOrderNo,
        lossReasons: this.lossReasons,
        downtimeReasons: this.downtimeReasons
      }));

      if (this.lastOrderNo > 0)
      {
        $orderRow.hide();
      }

      this.$('.pressWorksheets-form-orders > tbody').append($orderRow);

      if (this.lastOrderNo > 0)
      {
        $orderRow.fadeIn();
      }

      this.setUpOrderSelect2($orderRow.find('.pressWorksheets-form-part'));
      this.setUpProdLineSelect2($orderRow.find('.pressWorksheets-form-prodLine'), $lastRow);
    }

  });
});
