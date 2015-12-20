// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/i18n',
  'app/viewport',
  'app/data/orderStatuses',
  'app/core/View',
  './OrderCommentFormView',
  './OperationListView',
  './DocumentListView',
  '../Order',
  '../OperationCollection',
  '../DocumentCollection',
  'app/orders/templates/change',
  'app/orders/templates/changes',
  'app/orderStatuses/util/renderOrderStatusLabel',
  'app/core/templates/userInfo'
], function(
  _,
  $,
  time,
  t,
  viewport,
  orderStatuses,
  View,
  OrderCommentFormView,
  OperationListView,
  DocumentListView,
  Order,
  OperationCollection,
  DocumentCollection,
  renderChange,
  template,
  renderOrderStatusLabel,
  renderUserInfo
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click .orders-changes-operations': 'toggleOperations',
      'click .orders-changes-documents': 'toggleDocuments',
      'mouseover .orders-changes-noTimeAndUser': function(e)
      {
        var $tr = this.$(e.target).closest('tbody').children().first();

        $tr.find('.orders-changes-time').addClass('is-hovered');
        $tr.find('.orders-changes-user').addClass('is-hovered');
      },
      'mouseout .orders-changes-noTimeAndUser': function()
      {
        this.$('.is-hovered').removeClass('is-hovered');
      }
    },

    initialize: function()
    {
      this.$lastToggle = null;
      this.operationListView = null;
      this.documentListView = null;
      this.renderValueChange = this.renderValueChange.bind(this);

      this.setView('.orders-commentForm-container', new OrderCommentFormView({
        model: this.model,
        delayReasons: this.delayReasons
      }));

      this.listenTo(this.model, 'push:change', this.onChangePush);
    },

    destroy: function()
    {
      if (this.$lastToggle !== null)
      {
        this.$lastToggle.click();
        this.$lastToggle = null;
      }
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        showPanel: this.options.showPanel !== false,
        changes: this.serializeChanges(),
        renderChange: renderChange,
        renderValueChange: this.renderValueChange
      };
    },

    serializeChanges: function()
    {
      return (this.model.get('changes') || []).map(this.serializeChange, this);
    },

    serializeChange: function(change)
    {
      change.timeText = time.format(change.time, 'YYYY-MM-DD<br>HH:mm:ss');
      change.userText = renderUserInfo({userInfo: change.user});
      change.values = Object.keys(change.oldValues || {}).map(function(property)
      {
        return {
          property: property,
          oldValue: change.oldValues[property],
          newValue: change.newValues[property]
        };
      });
      change.comment = _.isEmpty(change.comment) ? '' : change.comment.trim();
      change.rowSpan = change.values.length + (change.comment === '' ? 0 : 1);

      return change;
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:changes', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:changes', this.render);
    },

    renderValueChange: function(valueChange, i, valueProperty)
    {
      /*jshint -W015*/

      var value = valueChange[valueProperty];

      if (value == null || value.length === 0)
      {
        return '-';
      }

      switch (valueChange.property)
      {
        case 'operations':
          return '<a class="orders-changes-operations" '
            + 'data-i="' + i + '" data-property="' + valueProperty + '">'
            + t('orders', 'CHANGES:operations', {count: value.length})
            + '</a>';

        case 'documents':
          return '<a class="orders-changes-documents" '
            + 'data-i="' + i + '" data-property="' + valueProperty + '">'
            + t('orders', 'CHANGES:documents', {count: value.length})
            + '</a>';

        case 'statuses':
          return orderStatuses.findAndFill(value).map(renderOrderStatusLabel).join(' ');

        case 'delayReason':
        {
          var delayReason = this.delayReasons.get(value);

          return delayReason ? _.escape(delayReason.getLabel()) : value;
        }

        case 'startDate':
        case 'finishDate':
        case 'scheduledStartDate':
        case 'scheduledFinishDate':
          return time.format(value, 'LL');

        default:
          return _.escape(String(value));
      }
    },

    hideLastToggle: function(e)
    {
      if (this.$lastToggle === null)
      {
        return true;
      }

      if (this.$lastToggle[0] !== e.target)
      {
        this.$lastToggle.click();

        return true;
      }

      if (this.operationListView !== null)
      {
        this.operationListView.remove();
        this.operationListView = null;
      }

      if (this.documentListView !== null)
      {
        this.documentListView.remove();
        this.documentListView = null;
      }

      this.$lastToggle = null;

      return false;
    },

    toggleOperations: function(e)
    {
      if (this.hideLastToggle(e))
      {
        this.showLastToggle(e, OperationCollection, OperationListView, 'operations', 'operationListView');
      }
    },

    toggleDocuments: function(e)
    {
      if (this.hideLastToggle(e))
      {
        this.showLastToggle(e, DocumentCollection, DocumentListView, 'documents', 'documentListView');
      }
    },

    showLastToggle: function(e, Collection, ListView, collectionProperty, listViewProperty)
    {
      var $lastToggle = this.$(e.target);
      var i = $lastToggle.attr('data-i');
      var property = $lastToggle.attr('data-property') + 's';
      var collection = new Collection(this.model.get('changes')[i][property][collectionProperty]);
      var orderData = {};
      orderData[collectionProperty] = collection;
      var listView = new ListView({model: new Order(orderData)});

      var top = $lastToggle.closest('tr')[0].offsetTop
        + $lastToggle.closest('td').outerHeight()
        + (this.options.showPanel !== false ? this.$('.panel-heading').first().outerHeight() : 0);

      listView.render();
      listView.$el.css('top', top);

      this.$el.append(listView.$el);

      this.$lastToggle = $lastToggle;
      this[listViewProperty] = listView;
    },

    onChangePush: function(change)
    {
      var $change = $(renderChange({
        renderValueChange: this.renderValueChange,
        change: this.serializeChange(change),
        i: this.model.get('changes').length
      }));

      this.$id('empty').remove();
      this.$id('table').append($change);

      $change.find('td').addClass('highlight');
    }

  });
});
