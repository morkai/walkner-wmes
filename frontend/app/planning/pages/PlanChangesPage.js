// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  'app/core/templates/userInfo',
  'app/orderStatuses/util/renderOrderStatusLabel',
  'app/planning-orderGroups/OrderGroupCollection',
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
  OrderGroupCollection,
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
          label: this.t('BREADCRUMB:base'),
          href: '#planning/plans'
        },
        {
          label: this.collection.getDate('LL'),
          href: '#planning/plans/' + this.collection.getDate('YYYY-MM-DD')
        },
        {
          label: this.t('BREADCRUMB:changes')
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
          className: 'planning-mrp-popover',
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
          })
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

        Object.keys(changes).forEach(property =>
        {
          var oldValue = view.formatValue(property, changes[property][0]);
          var newValue = view.formatValue(property, changes[property][1]);

          content += '<tr><th>' + this.t('orders:' + property) + '</th>'
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
          className: 'planning-mrp-popover',
          content: content
        }).popover('show');
      }

    },

    initialize: function()
    {
      this.expanded = {};

      this.collection = bindLoadingMessage(this.collection, this);
      this.orderGroups = bindLoadingMessage(new OrderGroupCollection(null, {rqlQuery: 'limit(0)'}), this);

      this.listenTo(this.collection, 'add', this.renderChange);
    },

    load: function(when)
    {
      return when(
        this.orderGroups.fetch({reset: true}),
        this.collection.fetch({reset: true})
      );
    },

    afterRender: function()
    {
      this.collection.forEach(this.renderChange, this);
    },

    renderChange: function(change)
    {
      var data = change.get('data');
      var what = Object.keys(data)
        .map(type =>
        {
          return {
            type,
            label: this.t('changes:what:' + type, {count: data[type].length})
          };
        });
      var templateData = {
        id: change.id,
        hd: this.t('changes:hd', {
          when: time.format(change.get('date'), 'LL LTS'),
          who: renderUserInfo(change.get('user') || {label: 'System'}),
          what: what.map(d => d.label).join(', ')
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
      var html = orders.map((order, i) =>
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
      var html = removedOrders.map(removedOrder =>
      {
        var label = removedOrder.reason === 'REQUIRED_STATUS'
          ? 'success'
          : removedOrder.reason === 'IGNORED_STATUS'
            ? 'danger'
            : 'default';
        var title = this.t(`changes:removedOrders:${removedOrder.reason}`, removedOrder.data);

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
            this.t('settings:' + change.property) + ': ',
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
            this.t('changes:settings:' + change.type, {
              mrp: change.mrp && change.mrp._id || change.mrp,
              line: change.line && change.line._id || change.line,
              property: this.t('settings:' + change.property)
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
            this.t('changes:settings:' + change.type, {
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
        return t('core', `BOOL:${value}`);
      }

      switch (property)
      {
        case 'kind':
          return this.t(`orderPriority:${value}`);

        case 'source':
          return this.t(`orders:source:${value}`);

        case 'orderPriority':
          return value.map(v => this.t(`orderPriority:${v}`)).join('; ');

        case 'statuses':
        case 'ignoredStatuses':
        case 'requiredStatuses':
        case 'completedStatuses':
          return value.map(renderOrderStatusLabel).join(' ');

        case 'lines':
        case 'extraShiftSeconds':
        case 'mrpPriority':
        case 'linePriority':
          return value.length === 0 ? '-' : value.join('; ');

        case 'workerCount':
          return Array.isArray(value)
            ? value.map(v => v.toLocaleString()).join('; ')
            : value.toLocaleString();

        case 'operation':
          return value.no + '. ' + value.name + ' - ' + value.laborTime.toLocaleString();

        case 'groups':
          return value.length;

        case 'activeTime':
          return value.length === 0 ? '06:00-06:00' : value
            .map(activeTime => `${activeTime.from}-${activeTime.to}`)
            .join(', ');

        case 'orderGroupPriority':
          return value
            .map(id =>
            {
              var orderGroup = this.orderGroups.get(id);

              return orderGroup ? orderGroup.getLabel() : id;
            })
            .join('; ');

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
