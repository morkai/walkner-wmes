// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'select2',
  'app/time',
  'app/viewport',
  'app/core/views/FormView',
  'app/data/orgUnits',
  'app/orgUnits/util/setUpOrgUnitSelect2',
  'app/wh-deliveredOrders/templates/redir'
], function(
  select2,
  time,
  viewport,
  FormView,
  orgUnits,
  setUpOrgUnitSelect2,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: Object.assign({

      'input #-sapOrder': function()
      {
        this.loadOrder();
      },

      'change #-sourceLine': function()
      {
        this.updateSourceInfo();
        this.checkLineValidity();
      },

      'change #-targetLine': function()
      {
        this.checkLineValidity();
      },

      'change #-targetPceTime': function(e)
      {
        var sec = time.toSeconds(e.target.value);

        e.target.value = sec > 0 ? time.toString(sec, true, false) : '';
      },

      'click #-sourceQty': function()
      {
        this.$id('targetQty').val(+this.$id('sourceQty')[0].dataset.value || '');
      },

      'click #-sourcePceTime': function()
      {
        this.$id('targetPceTime').val(this.$id('sourcePceTime')[0].dataset.value || '');
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      this.orderNo = null;
      this.orders = [];
      this.req = null;
    },

    handleSuccess: function()
    {
      viewport.closeDialog();
    },

    getFailureText: function()
    {
      return this.t('redir:error:failure');
    },

    serializeToForm: function()
    {
      return {
        sapOrder: this.model.get('sapOrder') || '',
        sourceLine: this.model.get('line') || '',
        targetLine: '',
        targetQty: ''
      };
    },

    serializeForm: function(formData)
    {
      formData.pceTime = time.toSeconds(formData.pceTime) * 1000;
      formData.targetQty = parseInt(formData.targetQty, 10);

      return formData;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.setUpSourceLineSelect2();

      setUpOrgUnitSelect2(this.$id('targetLine'), {
        idOnly: true,
        itemFilter: function(item)
        {
          var sd = orgUnits.getSubdivisionFor(item.model);

          return sd && sd.get('type') === 'assembly';
        }
      });

      this.loadOrder();
    },

    loadOrder: function()
    {
      var view = this;
      var orderNo = view.$id('sapOrder').val().trim();

      if (orderNo === view.orderNo || !/^[0-9]{9}$/.test(orderNo))
      {
        return;
      }

      viewport.msg.loading();

      view.orderNo = orderNo;

      view.$id('sourceLine').val('').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: []
      });

      view.$id('sourceQty').text('?').attr('data-value', '');
      view.$id('sourcePceTime').text('?').attr('data-value', '');
      view.$id('targetQty').val('');
      view.$id('targetPceTime').val('');

      view.checkLineValidity();

      if (view.req)
      {
        view.req.abort();
      }

      var req = view.ajax({
        url: '/old/wh/deliveredOrders?sapOrder=string:' + orderNo
      });

      req.fail(function()
      {
        if (req.statusText === 'abort')
        {
          viewport.msg.loaded();
        }
        else
        {
          viewport.msg.loadingFailed();
        }
      });

      req.done(function(res)
      {
        view.orders = res.collection || [];

        view.setUpSourceLineSelect2();
        view.updateSourceInfo();

        viewport.msg.loaded();
      });

      req.always(function()
      {
        view.req = null;
      });

      view.req = req;
    },

    setUpSourceLineSelect2: function()
    {
      var lines = {};

      this.orders.forEach(function(o)
      {
        lines[o.line] = 1;
      });

      var data = [];

      Object.keys(lines).forEach(function(line)
      {
        data.push({id: line, text: line});
      });

      if (lines[this.model.get('line')])
      {
        this.$id('sourceLine').val(this.model.get('line'));
      }

      this.$id('sourceLine').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: data,
        formatResult: function(item, $container, query, e)
        {
          var html = ['<span class="text-mono">'];

          if (query.term.length)
          {
            select2.util.markMatch(item.id, query.term, html, e);
          }
          else
          {
            html.push(e(item.id));
          }

          html.push('</span>');

          return html.join('');
        }
      });

      this.checkLineValidity();
    },

    updateSourceInfo: function()
    {
      var sourceLine = this.$id('sourceLine').val();
      var minPceTime = Number.MAX_SAFE_INTEGER;
      var maxPceTime = Number.MIN_SAFE_INTEGER;
      var qtyDone = 0;
      var qtyTodo = 0;

      this.$id('noSourceMsg').toggleClass('hidden', !!sourceLine);

      this.orders.forEach(function(o)
      {
        if (!sourceLine || o.line === sourceLine)
        {
          qtyDone += o.qtyDone;
          qtyTodo += o.qtyTodo;
          minPceTime = Math.min(minPceTime, o.pceTime);
          maxPceTime = Math.max(maxPceTime, o.pceTime);
        }
      });

      this.$id('sourceQty').text(qtyDone + '/' + qtyTodo).attr('data-value', qtyTodo - qtyDone);

      if (qtyDone)
      {
        this.$id('sourceQty').append(' <a href="javascript:void(0)"><i class="fa fa-copy"></i></a>');
      }

      if (minPceTime === Number.MAX_SAFE_INTEGER)
      {
        this.$id('pceTime').text('?').attr('data-value', '');
      }
      else
      {
        minPceTime = time.toString(minPceTime / 1000, true, false);
        maxPceTime = time.toString(maxPceTime / 1000, true, false);

        var pceTime = minPceTime;

        if (maxPceTime !== minPceTime)
        {
          pceTime += ' - ' + maxPceTime;
        }

        this.$id('sourcePceTime')
          .text(pceTime)
          .attr('data-value', maxPceTime)
          .append(' <a href="javascript:void(0)"><i class="fa fa-copy"></i></a>');
      }
    },

    checkLineValidity: function()
    {
      var sourceLine = this.$id('sourceLine').val();
      var targetLine = this.$id('targetLine').val();
      var error = '';

      if (sourceLine && targetLine && sourceLine === targetLine)
      {
        error = this.t('redir:error:sameLines');
      }

      this.$id('targetLine')[0].setCustomValidity(error);
    },

    request: function(formData)
    {
      return this.promised(this.ajax({
        method: 'POST',
        url: '/old/wh/deliveredOrders;redir',
        data: JSON.stringify(formData)
      }));
    }

  });
});
