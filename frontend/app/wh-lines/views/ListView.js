// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/user',
  'app/viewport',
  'app/core/views/ListView',
  'app/planning/util/shift',
  'app/wh-deliveredOrders/WhDeliveredOrderCollection',
  'app/wh-deliveredOrders/views/ListView',
  'app/wh/WhOrderCollection',
  '../WhLineCollection',
  './RedirLineDialogView',
  './EditStartedPlanDialogView',
  './PickupOrderListView',
  'app/wh-lines/templates/list',
  'app/wh-lines/templates/row'
], function(
  $,
  user,
  viewport,
  ListView,
  shiftUtil,
  WhDeliveredOrderCollection,
  WhDeliveredOrderListView,
  WhOrderCollection,
  WhLineCollection,
  RedirLineDialogView,
  EditStartedPlanDialogView,
  PickupOrderListView,
  listTemplate,
  rowTemplate
) {
  'use strict';

  return ListView.extend({

    template: listTemplate,

    localTopics: {
      'socket.connected': function() { this.refreshCollectionNow(); }
    },

    remoteTopics: function()
    {
      var topics = {};

      topics[this.collection.getTopicPrefix() + '.updated'] = 'onUpdated';

      return topics;
    },

    events: Object.assign({

      'click a[data-action="redirLine"]': function(e)
      {
        this.redirLine(this.$(e.currentTarget).closest('.list-item')[0].dataset.id);
      },

      'click a[data-action="editStartedPlan"]': function(e)
      {
        this.editStartedPlan(this.$(e.currentTarget).closest('.list-item')[0].dataset.id);
      },

      'mousedown td[data-details]': function(e)
      {
        if (e.button === 1)
        {
          e.preventDefault();
        }
      },

      'mouseup td[data-details]': function(e)
      {
        var td = e.currentTarget;
        var type = td.dataset.details;
        var line = td.parentNode.dataset.id;

        if (e.button === 2 || type !== 'available' || document.getSelection().toString() !== '')
        {
          return;
        }

        td.dataset.mouseup = Math.round(e.timeStamp).toString();

        if (e.button === 1 || (e.button === 0 && (e.ctrlKey || e.shiftKey)))
        {
          var url = '/#wh/deliveredOrders'
            + '?sort(date,set,startTime)&limit(-1337)'
            + '&status=in=(todo,blocked)'
            + '&line=' + encodeURIComponent(line);

          window.open(url);

          return false;
        }

        if (e.button === 0)
        {
          this.collection.setDetails(type, line);

          return false;
        }
      },

      'click td[data-details]': function(e)
      {
        var td = e.currentTarget;

        if (document.getSelection().toString() !== ''
          || td.dataset.mouseup === Math.round(e.timeStamp).toString())
        {
          return false;
        }

        this.collection.setDetails(td.dataset.details, td.parentNode.dataset.id);
      }

    }, ListView.prototype.events),

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.once('afterRender', function()
      {
        this.listenTo(this.collection, 'filtered', this.onFiltered);
        this.listenTo(this.collection, 'detailed', this.onDetailed);
        this.listenTo(this.collection, 'add change', this.onChanged);
      });

      $(window).on('keydown.' + this.idPrefix, this.onWindowKeyDown.bind(this));
    },

    destroy: function()
    {
      ListView.prototype.destroy.apply(this, arguments);

      $(window).off('.' + this.idPrefix);
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.apply(this, arguments);

      this.toggleDetails();
    },

    onUpdated: function(message)
    {
      this.promised(this.collection.handleUpdate(message));
    },

    getTemplateData: function()
    {
      return {
        renderRow: this.renderPartialHtml.bind(this, rowTemplate),
        canManage: WhLineCollection.can.manage()
      };
    },

    serializeRows: function()
    {
      var view = this;
      var rows = [];
      var options = {
        currentPlan: shiftUtil.getPlanDate(Date.now(), true).valueOf()
      };

      view.collection.forEach(function(line)
      {
        if (view.collection.isVisible(line))
        {
          rows.push(line.serializeRow(options));
        }
      });

      return rows;
    },

    renderRow: function(line)
    {
      var $oldRow = this.$row(line.id);

      if (!this.collection.isVisible(line))
      {
        if ($oldRow.length)
        {
          $oldRow.remove();
        }

        return;
      }

      var $newRow = this.renderPartial(rowTemplate, {
        row: line.serializeRow(),
        canManage: WhLineCollection.can.manage()
      });

      var details = this.collection.getDetails();

      if (details.type && details.line === line.id)
      {
        var $details = $newRow.find('td[data-details="' + details.type + '"]');

        if ($details.length)
        {
          $details.addClass('wh-lines-details-active');
        }
      }

      if ($oldRow.length)
      {
        $oldRow.replaceWith($newRow);
      }
      else
      {
        var tds = this.$('.list-item > td:first-child').get();
        var lines = tds.map(function(td) { return td.textContent.trim(); });

        lines.push(line.id);

        lines.sort(function(a, b)
        {
          return a.localeCompare(b, undefined, {numeric: true, ignorePunctuation: true});
        });

        var pos = lines.indexOf(line.id);

        if (tds[pos])
        {
          $newRow.insertBefore(tds[pos].parentNode);
        }
        else
        {
          this.$('tbody').append($newRow);
        }
      }
    },

    redirLine: function(sourceLineId)
    {
      var sourceLine = this.collection.get(sourceLineId);

      if (!sourceLine)
      {
        return;
      }

      if (viewport.currentDialog instanceof RedirLineDialogView
        && viewport.currentDialog.model.sourceLine.id === sourceLineId)
      {
        return;
      }

      var dialogView = new RedirLineDialogView({
        model: sourceLine
      });

      viewport.showDialog(
        dialogView,
        this.t('redirLine:title:' + (sourceLine.get('redirLine') ? 'stop' : 'start'))
      );
    },

    editStartedPlan: function(lineId)
    {
      var dialogView = new EditStartedPlanDialogView({
        model: this.collection.get(lineId)
      });

      viewport.showDialog(dialogView, this.t('editStartedPlan:title'));
    },

    onWindowKeyDown: function(e)
    {
      if (e.key !== 'Escape'
        || viewport.currentDialog
        || this.$id('details-inner').find('.popover').length)
      {
        return;
      }

      this.collection.setDetails(null, null);

      return false;
    },

    onFiltered: function()
    {
      var view = this;
      var details = view.collection.getDetails();

      if (details.line)
      {
        var line = view.collection.get(details.line);

        if (!line || !view.collection.isVisible(line))
        {
          view.collection.setDetails(null, null);
        }
      }

      view.collection.forEach(function(line)
      {
        view.renderRow(line);
      });
    },

    onDetailed: function()
    {
      this.toggleDetails();
    },

    onChanged: function(line)
    {
      this.renderRow(line);
    },

    toggleDetails: function()
    {
      var details = this.collection.getDetails();
      var line = this.collection.get(details.line);
      var $line = this.$row(details.line);
      var $outer = this.$id('details-outer');
      var $inner = this.$id('details-inner');

      this.$('.wh-lines-details-active').removeClass('wh-lines-details-active');

      if (!line || !$line.length)
      {
        $outer.addClass('hidden');

        this.removeView('#-details-outer');

        return;
      }

      $line.find('td[data-details="' + details.type + '"]').addClass('wh-lines-details-active');

      $inner.html('<i class="fa fa-spinner fa-spin"></i><span>');

      $outer.insertAfter($line).removeClass('hidden');

      if (details.type === 'available')
      {
        this.loadDeliveredOrders();
      }
      else
      {
        this.loadPickupOrders(details.type);
      }
    },

    loadDeliveredOrders: function()
    {
      var view = this;
      var details = view.collection.getDetails();
      var deliveredOrders = new WhDeliveredOrderCollection([], {
        paginate: false,
        rqlQuery: {
          selector: {
            name: 'and',
            args: [
              {name: 'in', args: ['status', ['todo', 'blocked']]},
              {name: 'eq', args: ['line', details.line]}
            ]
          }
        }
      });

      this.loadDetails(new WhDeliveredOrderListView({
        collection: deliveredOrders,
        showLineColumn: false
      }));
    },

    loadPickupOrders: function(status)
    {
      var details = this.collection.getDetails();
      var whOrders = new WhOrderCollection([], {
        paginate: false,
        date: null,
        rqlQuery: {
          selector: {
            name: 'and',
            args: [
              {name: 'in', args: ['status', ['started', 'finished', 'problem']]},
              {name: 'eq', args: ['lines._id', details.line]},
              {name: 'eq', args: ['distStatus', 'pending']},
              {name: 'ne', args: ['set', null]}
            ]
          },
          sort: {
            date: 1,
            set: 1,
            startTime: 1
          }
        }
      });

      this.loadDetails(new PickupOrderListView({
        collection: whOrders,
        status: status,
        line: details.line
      }));
    },

    loadDetails: function(detailsView)
    {
      var view = this;
      var req = detailsView.promised(detailsView.collection.fetch({reset: true}));

      req.done(function()
      {
        view.setView('#-details-inner', detailsView).render();
      });

      req.fail(function()
      {
        detailsView.remove();

        view.$id('details-inner')
          .find('.fa-spin')
          .removeClass('fa-spin')
          .css('color', 'red');
      });
    }

  });
});
