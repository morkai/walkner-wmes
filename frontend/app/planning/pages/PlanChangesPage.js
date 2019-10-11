// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/templates/userInfo',
  'app/orderStatuses/util/renderOrderStatusLabel',
  'app/planning/templates/change',
  'app/planning/templates/orderPopover'
], function(
  _,
  t,
  time,
  View,
  bindLoadingMessage,
  renderUserInfo,
  renderOrderStatusLabel,
  changeTemplate,
  orderPopoverTemplate
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('planning', 'BREADCRUMBS:base'),
          href: '#planning/plans'
        },
        {
          label: this.collection.getDate('LL'),
          href: '#planning/plans/' + this.collection.getDate('YYYY-MM-DD')
        },
        {
          label: t.bound('planning', 'BREADCRUMBS:changes')
        }
      ];
    },

    actions: function()
    {
      return [
        {
          icon: 'chevron-down',
          label: this.t('PAGE_ACTION:toggleChanges:expand'),
          callback: this.toggleChanges.bind(this, true)
        },
        {
          icon: 'chevron-up',
          label: this.t('PAGE_ACTION:toggleChanges:collapse'),
          callback: this.toggleChanges.bind(this, false)
        }
      ];
    },

    remoteTopics: {

      'planning.changes.created': function(change)
      {
        if (time.utc.format(change.plan, 'X') === this.collection.getDate('X'))
        {
          this.collection.unshift(change);
        }
      }

    },

    events: {

      'click .planning-change-hd': function(e)
      {
        var $el = this.$(e.currentTarget);
        var type = $el.parent().attr('data-type');

        if (type
          && $el.next()[0].childElementCount === 0
          && !$el.hasClass('is-expanded'))
        {
          this.renderDetails(
            $el.next(),
            type,
            this.collection.get($el.closest('.planning-change').attr('data-id')).get('data')[type]
          );
        }

        $el.toggleClass('is-expanded');
      },

      'mouseenter .planning-change-addedOrder': function(e)
      {
        var $order = this.$(e.currentTarget);
        var $change = $order.closest('.planning-change');
        var changeId = $change.attr('data-id');
        var changeI = $order.attr('data-i');
        var order = this.collection.get(changeId).get('data').addedOrders[changeI];

        $order.popover({
          trigger: 'hover',
          html: true,
          placement: 'top',
          content: orderPopoverTemplate({
            order: {
              _id: order.id,
              nc12: order.nc12,
              name: order.name,
              kind: order.kind,
              incomplete: order.incomplete,
              quantityTodo: order.quantityTodo,
              quantityDone: order.quantityDone,
              quantityPlan: order.quantityPlan,
              statuses: order.statuses.map(renderOrderStatusLabel),
              manHours: order.manHours,
              laborTime: order.operation && order.operation.laborTime || 0,
              lines: order.lines || []
            }
          }),
          template: '<div class="popover planning-mrp-popover">'
          + '<div class="arrow"></div>'
          + '<div class="popover-content"></div>'
          + '</div>'
        }).popover('show');
      },

      'mouseenter .planning-change-changedOrder': function(e)
      {
        var view = this;
        var $order = view.$(e.currentTarget);
        var $change = $order.closest('.planning-change');
        var changeId = $change.attr('data-id');
        var changeI = $order.attr('data-i');
        var changes = view.collection.get(changeId).get('data').changedOrders[changeI].changes;
        var content = '<table>';

        Object.keys(changes).forEach(function(property)
        {
          var oldValue = view.formatValue(property, changes[property][0]);
          var newValue = view.formatValue(property, changes[property][1]);

          content += '<tr><th>' + t('planning', 'orders:' + property) + '</th>'
            + '<td>' + oldValue
            + ' <i class="fa fa-arrow-right"></i> '
            + (property === 'statuses' || property === 'operation' ? '<br>' : '')
            + newValue + '</td>'
            + '</tr>';
        });

        content += '</table>';

        $order.popover({
          trigger: 'hover',
          html: true,
          placement: 'top',
          content: content,
          template: '<div class="popover planning-mrp-popover">'
          + '<div class="arrow"></div>'
          + '<div class="popover-content"></div>'
          + '</div>'
        }).popover('show');
      }

    },

    initialize: function()
    {
      this.expanded = {};

      this.collection = bindLoadingMessage(this.collection, this);

      this.listenTo(this.collection, 'add', this.renderChange);
    },

    load: function(when)
    {
      return when(this.collection.fetch({reset: true}));
    },

    afterRender: function()
    {
      this.collection.forEach(this.renderChange, this);
    },

    renderChange: function(change)
    {
      var data = change.get('data');
      var what = Object.keys(data)
        .map(function(type)
        {
          return {
            type: type,
            label: t('planning', 'changes:what:' + type, {count: data[type].length})
          };
        });
      var templateData = {
        id: change.id,
        hd: t('planning', 'changes:hd', {
          when: time.format(change.get('date'), 'LL LTS'),
          who: renderUserInfo({userInfo: change.get('user') || {label: 'System'}}),
          what: what.map(function(d) { return d.label; }).join(', ')
        }),
        what: what
      };

      this.$el.append(changeTemplate(templateData));
    },

    renderDetails: function($bd, type, data)
    {
      switch (type)
      {
        case 'addedOrders':
          this.renderOrders('addedOrder', $bd, data);
          break;

        case 'changedOrders':
          this.renderOrders('changedOrder', $bd, data);
          break;

        case 'removedOrders':
          this.renderRemovedOrders($bd, data);
          break;

        case 'settings':
          this.renderSettings($bd, data);
          break;

        case 'changedLines':
          $bd.html(_.pluck(data, '_id').join('; '));
          break;

        default:
          $bd.html('<pre>' + JSON.stringify(data, null, 2) + '</pre>');
          break;
      }
    },

    renderOrders: function(type, $bd, orders)
    {
      var html = orders.map(function(order, i)
      {
        return '<a class="label label-default planning-change-' + type + '" href="#orders/' + order._id + '"'
          + ' target="_blank" data-i="' + i + '">'
          + order._id
          + '</a> ';
      });

      $bd.html(html.join(''));
    },

    renderRemovedOrders: function($bd, removedOrders)
    {
      var html = removedOrders.map(function(removedOrder)
      {
        var label = removedOrder.reason === 'REQUIRED_STATUS'
          ? 'success'
          : removedOrder.reason === 'IGNORED_STATUS'
            ? 'danger'
            : 'default';
        var title = t('planning', 'changes:removedOrders:' + removedOrder.reason, removedOrder.data);

        return '<a class="label label-' + label + '" title="' + title + '" '
          + 'href="#orders/' + removedOrder._id + '" target="_blank">'
          + removedOrder._id
          + '</a> ';
      });

      $bd.html(html.join(''));
    },

    renderSettings: function($bd, settings)
    {
      var html = ['<ul>'];

      settings.forEach(this.renderSetting.bind(this, html));

      html.push('</ul>');

      $bd.html(html.join(''));
    },

    renderSetting: function(html, change)
    {
      switch (change.type)
      {
        case 'change':
          html.push(
            '<li><i class="fa fa-minus planning-change-icon"></i> ',
            t('planning', 'settings:' + change.property) + ': ',
            this.formatValue(change.property, change.oldValue),
            ' <i class="fa fa-arrow-right"></i> ',
            this.formatValue(change.property, change.newValue),
            '</li>'
          );
          break;

        case 'lines:change':
        case 'mrps:change':
        case 'mrpLines:change':
          html.push(
            '<li><i class="fa fa-minus planning-change-icon"></i> ',
            t('planning', 'changes:settings:' + change.type, {
              mrp: change.mrp && change.mrp._id || change.mrp,
              line: change.line && change.line._id || change.line,
              property: t('planning', 'settings:' + change.property)
            }),
            this.formatValue(change.property, change.oldValue),
            ' <i class="fa fa-arrow-right"></i> ',
            this.formatValue(change.property, change.newValue),
            '</li>'
          );
          break;

        default:
          html.push(
            '<li><i class="fa fa-minus planning-change-icon"></i> ',
            t('planning', 'changes:settings:' + change.type, {
              mrp: change.mrp && change.mrp._id || change.mrp,
              line: change.line && change.line._id || change.line
            }),
            '</li>'
          );
          break;
      }
    },

    formatValue: function(property, value)
    {
      if (value === '' || value == null)
      {
        return '-';
      }

      if (typeof value === 'number')
      {
        return value.toLocaleString();
      }

      if (typeof value === 'boolean')
      {
        return t('core', 'BOOL:' + value);
      }

      switch (property)
      {
        case 'kind':
          return t('planning', 'orderPriority:' + value);

        case 'orderPriority':
          return value.map(function(v) { return t('planning', 'orderPriority:' + v); }).join(', ');

        case 'statuses':
        case 'ignoredStatuses':
        case 'requiredStatuses':
        case 'completedStatuses':
          return value.map(renderOrderStatusLabel).join(' ');

        case 'lines':
        case 'extraShiftSeconds':
        case 'mrpPriority':
          return value.length === 0 ? '-' : value.join(', ');

        case 'workerCount':
          return Array.isArray(value)
            ? value.map(function(v) { return v.toLocaleString(); }).join('; ')
            : value.toLocaleString();

        case 'operation':
          return value.no + '. ' + value.name + ' - ' + value.laborTime.toLocaleString();

        case 'groups':
          return value.length;

        case 'activeTime':
          return value.length === 0 ? '06:00-06:00' : value
            .map(function(activeTime) { return activeTime.from + '-' + activeTime.to; })
            .join(', ');

        default:
          return String(value);
      }
    },

    toggleChanges: function(state)
    {
      this.$('.planning-change-hd').each(function()
      {
        if (state)
        {
          if (this.classList.contains('is-expanded'))
          {
            return;
          }

          this.click();
        }
        else
        {
          this.classList.remove('is-expanded');
        }
      });
    }

  });
});
