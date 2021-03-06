// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/i18n',
  'app/viewport',
  'app/user',
  'app/data/orderStatuses',
  'app/data/localStorage',
  'app/core/View',
  './OrderCommentFormView',
  './OperationListView',
  './DocumentListView',
  './ComponentListView',
  './NoteListView',
  '../Order',
  '../OrderCollection',
  '../OperationCollection',
  '../DocumentCollection',
  '../ComponentCollection',
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
  user,
  orderStatuses,
  localStorage,
  View,
  OrderCommentFormView,
  OperationListView,
  DocumentListView,
  ComponentListView,
  NoteListView,
  Order,
  OrderCollection,
  OperationCollection,
  DocumentCollection,
  ComponentCollection,
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
      'click .orders-changes-bom': 'toggleComponents',
      'click .orders-changes-notes': 'toggleNotes',
      'mouseover .orders-changes-noTimeAndUser': function(e)
      {
        var $tr = this.$(e.target).closest('tbody').children().first();

        $tr.find('.orders-changes-time').addClass('is-hovered');
        $tr.find('.orders-changes-user').addClass('is-hovered');
      },
      'mouseout .orders-changes-noTimeAndUser': function()
      {
        this.$('.is-hovered').removeClass('is-hovered');
      },
      'click #-toggleSystemChanges': function()
      {
        var $btn = this.$id('toggleSystemChanges').toggleClass('active');
        var active = $btn.hasClass('active');

        localStorage.setItem('WMES_NO_SYSTEM_CHANGES', active ? '1' : '0');
        this.$el.toggleClass('orders-no-system-changes', active);
      },
      'click .orders-changes-time-editable': function(e)
      {
        if (this.$(e.target).closest('form').length)
        {
          return;
        }

        this.hideTimeEditor();
        this.showTimeEditor(e.currentTarget);
      }
    },

    initialize: function()
    {
      this.renderChange = this.renderChange.bind(this);
      this.renderPropertyLabel = this.renderPropertyLabel.bind(this);
      this.renderValueChange = this.renderValueChange.bind(this);

      this.$lastToggle = null;
      this.toggleViews = {
        operations: null,
        documents: null,
        bom: null,
        notes: null
      };

      this.setView('#-commentForm', new OrderCommentFormView({
        model: this.model,
        delayReasons: this.delayReasons
      }));

      this.once('afterRender', function()
      {
        this.listenTo(this.model, 'push:change', this.onChangePush);
        this.listenTo(this.model, 'change:changes', this.render);
      });


      $(window).on('keydown.' + this.idPrefix, this.onKeyDown.bind(this));
    },

    destroy: function()
    {
      if (this.$lastToggle !== null)
      {
        this.$lastToggle.click();
        this.$lastToggle = null;
      }
    },

    getTemplateData: function()
    {
      return {
        showPanel: this.options.showPanel !== false,
        changes: this.serializeChanges(),
        canComment: OrderCollection.can.comment(),
        noSystemChanges: localStorage.getItem('WMES_NO_SYSTEM_CHANGES') === '1',
        renderChange: this.renderChange
      };
    },

    serializeChanges: function()
    {
      return (this.model.get('changes') || []).map(this.serializeChange, this);
    },

    serializeChange: function(change)
    {
      change = _.clone(change);

      if (!change.user)
      {
        change.user = {
          id: null,
          label: 'System'
        };
      }

      change.timeEditable = false;
      change.timeText = time.format(change.time, 'L<br>LTS');
      change.userText = renderUserInfo({userInfo: change.user});
      change.values = Object.keys(change.oldValues || {}).map(function(property)
      {
        change.timeEditable = change.timeEditable || property === 'statuses';

        return {
          property: property,
          oldValue: change.oldValues[property],
          newValue: change.newValues[property]
        };
      });
      change.comment = _.isEmpty(change.comment) ? '' : _.escape(change.comment.trim());

      if (change.source === 'ps')
      {
        change.comment = '<i class="fa fa-paint-brush"></i> ' + change.comment;
      }
      else if (change.source === 'wh')
      {
        change.comment = '<i class="fa fa-truck"></i> ' + change.comment;
      }

      change.rowSpan = change.values.length + (change.comment === '' ? 0 : 1);

      return change;
    },

    renderChange: function(change, i)
    {
      return this.renderPartialHtml(renderChange, {
        canEditTime: OrderCollection.can.editStatusChange(),
        renderPropertyLabel: this.renderPropertyLabel,
        renderValueChange: this.renderValueChange,
        change: change,
        i: i
      });
    },

    renderPropertyLabel: function(valueChange)
    {
      switch (valueChange.property)
      {
        case 'qtyMax':
          return this.t('changes:qtyMax', {operationNo: valueChange.newValue.operationNo});

        case 'change':
        {
          var no = valueChange.newValue.oldIndex + 1;

          if (no !== valueChange.newValue.newIndex + 1)
          {
            no += '->' + (valueChange.newValue.newIndex + 1);
          }

          return this.t('changes:change', {no: no});
        }

        default:
          return this.t('PROPERTY:' + valueChange.property);
      }
    },

    renderValueChange: function(valueChange, i, valueProperty)
    {
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
            + this.t('changes:operations', {count: value.length})
            + '</a>';

        case 'documents':
          return '<a class="orders-changes-documents" '
            + 'data-i="' + i + '" data-property="' + valueProperty + '">'
            + this.t('changes:documents', {count: value.length})
            + '</a>';

        case 'bom':
          return '<a class="orders-changes-bom" '
            + 'data-i="' + i + '" data-property="' + valueProperty + '">'
            + this.t('changes:bom', {count: value.length})
            + '</a>';

        case 'notes':
          return '<a class="orders-changes-notes" '
            + 'data-i="' + i + '" data-property="' + valueProperty + '">'
            + this.t('changes:notes', {count: value.length})
            + '</a>';

        case 'tags':
          return value.map(function(tag) { return tag._id; }).join(', ');

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

        case 'sapCreatedAt':
        case 'salesOrderDate':
          return time.format(value, 'LLL');

        case 'whTime':
          return time.format(value, 'HH:mm');

        case 'whStatus':
        case 'm4':
        case 'psStatus':
        case 'drillStatus':
          return this.t(valueChange.property + ':' + value);

        case 'qtyMax':
          return value.value.toLocaleString();

        case 'change':
          return time.format(value.time, 'L LTS');

        case 'etoCont':
          return t('core', 'BOOL:' + value);

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

      if (!e || this.$lastToggle[0] !== e.target)
      {
        this.$lastToggle.click();

        return true;
      }

      this.$lastToggle = null;

      var views = this.toggleViews;

      _.forEach(views, function(view, id)
      {
        if (view !== null)
        {
          view.remove();
          views[id] = null;
        }
      });

      return false;
    },

    toggleOperations: function(e)
    {
      if (this.hideLastToggle(e))
      {
        this.showLastToggle(e, OperationCollection, OperationListView, 'operations');
      }
    },

    toggleDocuments: function(e)
    {
      if (this.hideLastToggle(e))
      {
        this.showLastToggle(e, DocumentCollection, DocumentListView, 'documents');
      }
    },

    toggleComponents: function(e)
    {
      if (this.hideLastToggle(e))
      {
        this.showLastToggle(e, ComponentCollection, ComponentListView, 'bom');
      }
    },

    toggleNotes: function(e)
    {
      if (this.hideLastToggle(e))
      {
        this.showLastToggle(e, null, NoteListView, 'notes');
      }
    },

    showLastToggle: function(e, Collection, ListView, collectionProperty)
    {
      var $lastToggle = this.$(e.target);
      var i = $lastToggle.attr('data-i');
      var change = this.model.get('changes')[i];

      if (!change)
      {
        return;
      }

      var property = $lastToggle.attr('data-property') + 's';
      var value = change[property][collectionProperty];
      var collection = Collection ? new Collection(value) : value;
      var orderData = {};
      orderData[collectionProperty] = collection;
      var listView = new ListView({model: new Order(orderData)});

      var top = $lastToggle.closest('tr')[0].offsetTop
        + $lastToggle.closest('td').outerHeight()
        + (this.options.showPanel !== false ? this.$('.panel-heading').first().outerHeight() : 0);

      listView.render();
      listView.$el.css('top', top + 'px');

      this.$el.append(listView.$el);

      var rect = $lastToggle.closest('td')[0].getBoundingClientRect();
      var width = listView.$el.outerWidth();
      var left = Math.round(rect.left - width / 2);

      if (left < 0)
      {
        left = 0;
      }

      listView.$el.css('left', left + 'px');

      this.$lastToggle = $lastToggle;
      this.toggleViews[collectionProperty] = listView;
    },

    onChangePush: function(change)
    {
      var view = this;
      var $table = view.$id('table');
      var changes = view.model.get('changes');
      var changedChange = change.newValues.change;

      view.$id('empty').remove();

      if (changedChange)
      {
        changes[changedChange.oldIndex].time = new Date(changedChange.time).toISOString();

        var $time = view.$('tbody[data-index="' + changedChange.oldIndex + '"]').find('.orders-changes-time');

        if ($time.find('a').length)
        {
          $time = $time.find('a');
        }

        $time.html(time.format(changedChange.time, 'L<br>LTS'));

        if (changedChange.oldIndex !== changedChange.newIndex)
        {
          changes.sort(function(a, b) { return Date.parse(a.time) - Date.parse(b.time); });

          $table.find('tbody').remove();

          var html = '';
          var changeI = -1;

          changes.forEach(function(c, i)
          {
            if (c === change)
            {
              changeI = i;
            }

            html += view.renderChange(view.serializeChange(c), i);
          });

          $table
            .append(html)
            .find('tbody')
            .eq(changeI)
            .find('td')
            .addClass('highlight');

          return;
        }
      }

      var $change = $(view.renderChange(view.serializeChange(change), changes.length - 1));

      $change.appendTo($table).find('td').addClass('highlight');
    },

    onKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        this.hideTimeEditor();
        this.hideLastToggle();
      }
    },

    hideTimeEditor: function()
    {
      this.$('.orders-changes-time-editor').remove();
    },

    showTimeEditor: function(containerEl)
    {
      var view = this;
      var timeFormat = 'YYYY-MM-DD HH:mm:ss';
      var $container = view.$(containerEl);
      var i = +$container.closest('tbody')[0].dataset.index;
      var changes = view.model.get('changes');
      var change = changes[i];
      var prevChange = null;
      var nextChange = null;

      for (var p = i - 1; p >= 0; --p)
      {
        if (changes[p].oldValues.statuses)
        {
          prevChange = changes[p];

          break;
        }
      }

      for (var n = i + 1; n < changes.length; ++n)
      {
        if (changes[n].oldValues.statuses)
        {
          nextChange = changes[n];

          break;
        }
      }

      var curTime = time.getMoment(change.time);
      var minTime = time.getMoment(prevChange ? prevChange.time : view.model.get('importTs'));
      var maxTime = time.getMoment(nextChange ? nextChange.time : view.model.get('updatedAt'));

      var $form = $('<form class="orders-changes-time-editor"></form>');
      var $input = $('<input type="text" class="form-control" required>').val(curTime.format(timeFormat));
      var $submit = $('<button class="btn btn-primary"><i class="fa fa-save"></i></button>');

      $input.on('input', function()
      {
        $input[0].setCustomValidity('');
      });

      $form.on('submit', function(e)
      {
        e.preventDefault();

        var newTime = time.getMoment($input.val(), timeFormat);

        if (newTime.valueOf() === curTime.valueOf())
        {
          return view.hideTimeEditor();
        }

        if (!newTime.isValid())
        {
          return error('format');
        }

        if (newTime.valueOf() <= minTime.valueOf())
        {
          return error('min', {time: minTime.format(timeFormat)});
        }

        if (newTime.valueOf() >= maxTime.valueOf())
        {
          return error('max', {time: maxTime.format(timeFormat)});
        }

        viewport.msg.saving();

        var req = view.ajax({
          method: 'POST',
          url: '/orders/' + view.model.id,
          data: JSON.stringify({
            change: {
              index: i,
              time: newTime.valueOf()
            }
          })
        });

        req.fail(function()
        {
          viewport.msg.savingFailed();
        });

        req.done(function()
        {
          viewport.msg.saved();

          view.hideTimeEditor();
        });
      });

      $form.append($input).append($submit).appendTo($container);
      $input.focus();

      function error(reason, data)
      {
        $input[0].setCustomValidity(view.t('changes:timeEditor:error:' + reason, data));

        setTimeout(function() { $submit.click(); });
      }
    }

  });
});
