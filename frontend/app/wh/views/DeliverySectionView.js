// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/time',
  'app/core/View',
  'app/wh/templates/delivery/section',
  'app/wh/templates/delivery/item',
  'app/wh/templates/resolveAction'
], function(
  _,
  time,
  View,
  template,
  itemTemplate,
  resolveActionTemplate
) {
  'use strict';

  return View.extend({

    template: template,

    nlsDomain: 'wh',

    events: {
      'click #-forceLine': function()
      {
        this.trigger('forceLineClicked');
      },
      'click .wh-delivery-item': function(e)
      {
        if (this.options.status !== 'delivering')
        {
          return;
        }

        var deliveringBy = this.setCarts.get(e.currentTarget.dataset.id).get('deliveringBy');

        this.model.trigger('continueDelivery', {
          user: deliveringBy,
          setCarts: this.setCarts
            .filter(function(c) { return c.get('deliveringBy').id === deliveringBy.id; })
            .map(function(c) { return c.id; })
        });
      },
      'submit .wh-pa-resolveAction': function()
      {
        if (document.activeElement)
        {
          document.activeElement.blur();
        }

        var personnelId = this.$('.wh-pa-resolveAction').find('.form-control').val();

        this.model.trigger('resolveAction', personnelId);

        return false;
      }
    },

    initialize: function()
    {
      this.listenTo(this.setCarts, 'reset', this.onReset);
      this.listenTo(this.setCarts, 'remove', this.onRemoved);
      this.listenTo(this.setCarts, 'add', this.onAdded);
      this.listenTo(this.setCarts, 'change', this.onChanged);

      if (this.options.actions)
      {
        this.listenTo(this.model, 'change:personnelId', this.onPersonnelIdChanged);
      }
    },

    getTemplateData: function()
    {
      return {
        kind: this.options.kind,
        status: this.options.status,
        renderItem: this.renderPartialHtml.bind(this, itemTemplate),
        items: this.serializeItems(),
        actions: !!this.options.actions,
        resolveAction: !this.options.actions ? '' : this.renderPartialHtml(resolveActionTemplate, {
          pattern: window.ENV === 'development' ? '' : '^[0-9]{5,}$'
        })
      };
    },

    afterRender: function()
    {
      if (this.options.resolveAction)
      {
        this.onPersonnelIdChanged();
      }
    },

    serializeItems: function()
    {
      var view = this;
      var rows = [];

      view.setCarts.forEach(function(setCart)
      {
        rows.push(view.serializeItem(setCart));
      });

      return rows;
    },

    serializeItem: function(setCart)
    {
      var obj = setCart.toJSON();

      obj.model = setCart;
      obj.className = this.getStatusClassName(setCart);
      obj.line = this.serializeItemLine(setCart);
      obj.date = time.utc.format(obj.date, 'L');
      obj.startTime = time.utc.format(obj.startTime, 'HH:mm:ss');
      obj.set = this.t('delivery:set', {set: obj.set});
      obj.sapOrders = {};
      obj.orders.forEach(function(o) { obj.sapOrders[o.sapOrder] = 1; });
      obj.sapOrders = Object.keys(obj.sapOrders);

      return obj;
    },

    serializeItemLine: function(setCart)
    {
      var line = setCart.get('line');
      var lines = setCart.get('lines');
      var redirLine = setCart.get('redirLine');
      var redirLines = setCart.get('redirLines');
      var actualLength = line.length;
      var veryLongLength = 23;
      var longLength = 19;

      if (this.options.status === 'completed')
      {
        veryLongLength = 16;
        longLength = 12;
      }

      var title = '';
      var className = '';
      var label = _.escape(line);

      if (redirLine)
      {
        actualLength += 2;
        label = '<i class="fa fa-arrow-right"></i>' + label;

        if (this.options.status !== 'completed')
        {
          actualLength += redirLine.length;
          label = _.escape(redirLine) + label;
        }

        if (lines.length === 1)
        {
          title = redirLine + ' ➜ ' + line;
        }
        else
        {
          title = line + ':';

          lines.forEach(function(line, i)
          {
            if (line === redirLines[i])
            {
              title += '\n - ' + line;
            }
            else
            {
              title += '\n - ' + redirLines[i] + ' ➜ ' + line;
            }
          });
        }
      }

      if (actualLength > veryLongLength)
      {
        className = 'wh-is-very-long';
      }
      else if (actualLength > longLength)
      {
        className = 'wh-is-long';
      }

      return {
        title: title,
        className: className,
        label: label
      };
    },

    getStatusClassName: function(setCart)
    {
      if (setCart.get('status') === 'delivering')
      {
        return 'wh-status-delivering';
      }

      var lateDeliveryTime = this.whSettings.getLateDeliveryTime();
      var minTimeForDelivery = this.whSettings.getMinTimeForDelivery();
      var lines = setCart.get('lines');
      var className = this.options.status === 'pending' ? 'wh-status-pending' : '';

      for (var lineI = 0; lineI < lines.length; ++lineI)
      {
        var line = this.lines.get(lines[lineI]);

        if (!line)
        {
          continue;
        }

        // TODO Change based on kind?
        var remainingTime = line.get('components').time;

        if (remainingTime < lateDeliveryTime)
        {
          className = 'wh-status-late';

          break;
        }

        if (remainingTime < minTimeForDelivery)
        {
          className = 'wh-status-deliverable';
        }
      }

      return className;
    },

    highlight: function()
    {
      var view = this;

      view.setCarts.forEach(function(setCart)
      {
        var className = view.getStatusClassName(setCart);
        var $item = view.$item(setCart.id);

        if ($item.hasClass(className))
        {
          return;
        }

        $item
          .removeClass('wh-status-pending wh-status-deliverable wh-status-late wh-status-delivering')
          .addClass(className);
      });
    },

    $item: function(id)
    {
      return this.$('.wh-delivery-item[data-id="' + id + '"]');
    },

    renderItem: function(setCart)
    {
      return this.renderPartialHtml(itemTemplate, {
        item: this.serializeItem(setCart)
      });
    },

    onReset: function()
    {
      var view = this;
      var $items = view.$id('items');
      var html = '';

      view.setCarts.forEach(function(setCart)
      {
        html += view.renderItem(setCart);
      });

      html += $items.find('tfoot')[0].outerHTML;

      $items.html(html);
    },

    onRemoved: function(setCart)
    {
      this.$item(setCart.id).remove();
    },

    onAdded: function(setCart)
    {
      this.$id('items').append(this.renderItem(setCart));
    },

    onChanged: function(setCart)
    {
      this.$item(setCart.id).replaceWith(this.renderItem(setCart));
    },

    onPersonnelIdChanged: function()
    {
      this.$('.wh-pa-resolveAction').find('.form-control').val(this.model.get('personnelId') || '');
    }

  });
});
