// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/production/templates/sequence'
], function(
  _,
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    remoteTopics: function()
    {
      var topics = {};

      if (this.model.prodLine)
      {
        topics['old.wh.problems.' + this.model.prodLine.id + '.*'] = 'onProblem';
      }

      return topics;
    },

    initialize: function()
    {
      var render = _.debounce(this.render.bind(this), 1);

      this.once('afterRender', function()
      {
        this.listenTo(this.model.execution, 'change', render);
        this.listenTo(this.model.prodShiftOrder, 'change', render);
      });
    },

    getTemplateData: function()
    {
      return {
        rows: this.serializeRows()
      };
    },

    serializeRows: function()
    {
      var view = this;
      var currentPsoKey = view.model.prodShiftOrder.get('orderId') + view.model.prodShiftOrder.get('operationNo');
      var whProblems = view.model.execution.get('whProblems') || [];
      var remainingQuantities = {};

      (view.model.execution.get('doneOrders') || []).forEach(function(o)
      {
        var key = o.orderId + o.operationNo;

        if (!remainingQuantities[key])
        {
          remainingQuantities[key] = 0;
        }

        remainingQuantities[key] += o.quantityDone;
      });

      var orderToLastRow = {};

      var rows = (view.model.execution.get('todoOrders') || []).map(function(o)
      {
        var key = o.orderId + o.operationNo;
        var quantityTodo = o.quantityDone;
        var quantityDone = 0;

        if (remainingQuantities[key] >= quantityTodo)
        {
          quantityDone = quantityTodo;
          remainingQuantities[key] -= quantityTodo;
        }
        else
        {
          quantityDone = remainingQuantities[key] || 0;
          remainingQuantities[key] = 0;
        }

        if (!remainingQuantities[key])
        {
          delete remainingQuantities[key];
        }

        var row = {
          className: 'default',
          shift: view.t('core', 'SHIFT:' + o.shift),
          order: o.orderId,
          quantityDone: quantityDone,
          quantityTodo: quantityTodo
        };

        if (key === currentPsoKey)
        {
          row.className = 'info';
        }
        else if (quantityDone >= quantityTodo)
        {
          row.className = 'success';
        }
        else if (whProblems.indexOf(o.orderId) !== -1)
        {
          row.className = 'danger';
        }
        else if (quantityDone)
        {
          row.className = 'warning';
        }

        orderToLastRow[key] = row;

        return row;
      });

      Object.keys(remainingQuantities).forEach(function(key)
      {
        if (orderToLastRow[key])
        {
          orderToLastRow[key].quantityDone += remainingQuantities[key];
        }
      });

      return rows;
    },

    afterRender: function()
    {
      var $row = this.$('.info');

      if (!$row.length)
      {
        $row = this.$('.default').first();
      }

      if ($row.length)
      {
        this.$('.table-responsive')[0].scrollTop = $row[0].offsetTop;
      }
    },

    onProblem: function(problem)
    {
      if (!problem.order || problem.state === null)
      {
        this.reloadWhProblems();

        return;
      }

      var whProblems = this.model.execution.get('whProblems') || [];

      if (problem.state)
      {
        this.model.execution.set('whProblems', whProblems.concat([problem.order]));
      }
      else
      {
        this.model.execution.set('whProblems', whProblems.filter(function(o) { return o !== problem.order; }));
      }
    },

    reloadWhProblems: function()
    {
      var view = this;

      if (view.reloadReq)
      {
        return;
      }

      view.reloadReq = view.ajax({
        url: '/old/wh/orders?select(order)&status=problem&lines._id=' + encodeURIComponent(this.model.prodLine.id)
      });

      view.reloadReq.done(function(res)
      {
        var orders = {};

        (res.collection || []).forEach(function(o)
        {
          orders[o.order] = 1;
        });

        view.model.execution.set({whProblems: Object.keys(orders)});
      });

      view.reloadReq.always(function()
      {
        view.reloadReq = null;
      });
    }

  });
});
