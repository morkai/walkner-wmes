// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/core/templates/userInfo',
  'app/purchaseOrders/templates/changes',
  'app/purchaseOrders/templates/newItemsChange',
  'app/purchaseOrders/templates/itemScheduleChange',
  'app/purchaseOrders/templates/printsChange'
], function(
  _,
  $,
  t,
  time,
  View,
  renderUserInfo,
  template,
  renderNewItemsChange,
  renderItemScheduleChange,
  renderPrintsChange
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'mouseover .pos-changes-change-next': function(e)
      {
        this.highlightDateAndUserCell(e.currentTarget);
      },
      'mouseout .pos-changes-change-next': function(e)
      {
        this.highlightDateAndUserCell(e.currentTarget);
      },
      'mouseover .pos-changes-prints-item': function(e)
      {
        this.highlightPrintCells(e.currentTarget);
      },
      'mouseout .pos-changes-prints-item': function(e)
      {
        this.highlightPrintCells(e.currentTarget);
      },
      'click #-more': 'showAllChanges'
    },

    initialize: function()
    {
      this.hidden = true;
    },

    getTemplateData: function()
    {
      return {
        changes: this.serializeChanges(),
        hidden: this.hidden
      };
    },

    serializeChanges: function()
    {
      var result = [];
      var changes = this.model.get('changes');
      var lastChangeIndex = changes.length - 1;

      changes.forEach(function(changes, i)
      {
        var properties = [];
        var newItems = [];

        Object.keys(changes.data).forEach(function(propertyName)
        {
          var values = changes.data[propertyName];
          var change = this.serializeChange(propertyName, values[0], values[1]);

          if (change.key === 'item')
          {
            newItems.push(change.newValue);
          }
          else if (change.key === 'importedAt')
          {
            properties.unshift(change);
          }
          else
          {
            properties.push(change);
          }
        }, this);

        if (newItems.length)
        {
          properties.push({
            key: 'newItems',
            name: t('purchaseOrders', 'changes:newItems'),
            oldValue: '-',
            newValue: this.renderPartial(renderNewItemsChange, {items: newItems})
          });
        }

        result.push({
          visible: !this.hidden || lastChangeIndex < 3 || i === 0 || i === lastChangeIndex,
          date: time.format(changes.date, 'LLLL'),
          user: renderUserInfo({userInfo: changes.user}),
          properties: properties
        });
      }, this);

      return result;
    },

    serializeChange: function(propertyName, oldValue, newValue)
    {
      var nameParts = propertyName.split('/');
      var propertyKey = propertyName;
      var readablePropertyName = propertyName;

      if (nameParts.length === 1)
      {
        readablePropertyName = t('purchaseOrders', 'PROPERTY:' + propertyName);
      }
      else if (nameParts[0] === 'items')
      {
        readablePropertyName = t('purchaseOrders', 'PROPERTY:item', {itemNo: nameParts[1]});
        propertyKey = 'item';

        if (nameParts.length === 3)
        {
          propertyKey += '.' + nameParts[2];
          readablePropertyName = t('purchaseOrders', 'changes:itemProp', {
            item: readablePropertyName,
            prop: t('purchaseOrders', 'PROPERTY:' + propertyKey)
          });
        }
        else if (nameParts[4] === 'cancelled')
        {
          propertyKey += '.prints.' + nameParts[4];
          readablePropertyName = t('purchaseOrders', 'changes:itemProp', {
            item: readablePropertyName,
            prop: t('purchaseOrders', 'changes:printCancelled', {
              printIndex: parseInt(nameParts[3], 10) + 1
            })
          });
        }
      }

      return {
        key: propertyKey,
        name: readablePropertyName,
        oldValue: this.serializeChangeValue(propertyKey, oldValue),
        newValue: this.serializeChangeValue(propertyKey, newValue)
      };
    },

    serializeChangeValue: function(propertyKey, rawValue)
    {
      if (rawValue === null)
      {
        return '-';
      }

      var type = typeof rawValue;

      if (type === 'boolean')
      {
        return t('core', 'BOOL:' + rawValue);
      }

      if (type === 'number')
      {
        return rawValue.toLocaleString();
      }

      var timeValue = Date.parse(rawValue);

      if (!isNaN(timeValue))
      {
        return time.format(timeValue, 'LLLL');
      }

      if (type === 'string')
      {
        return _.escape(rawValue);
      }

      if (propertyKey === 'item')
      {
        return this.serializeItemChangeValue(rawValue);
      }

      if (propertyKey === 'item.schedule')
      {
        return this.renderPartialHtml(renderItemScheduleChange, {schedule: rawValue});
      }

      if (propertyKey === 'prints')
      {
        return this.renderPartialHtml(renderPrintsChange, {change: rawValue});
      }

      return _.escape(JSON.stringify(rawValue));
    },

    serializeItemChangeValue: function(rawItem)
    {
      return {
        _id: rawItem._id,
        nc12: rawItem.nc12,
        unit: rawItem.unit,
        qty: rawItem.qty.toLocaleString(),
        name: rawItem.name,
        schedule: this.renderPartialHtml(renderItemScheduleChange, {schedule: rawItem.schedule})
      };
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:changes', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:changes', this.render);

      this.$('.pos-changes-change').last().addClass('is-last');
    },

    highlightDateAndUserCell: function(rowEl)
    {
      this.$(rowEl)
        .prevAll('.pos-changes-change')
        .first()
        .find('[rowspan]')
        .toggleClass('is-hovered');
    },

    highlightPrintCells: function(itemRowEl)
    {
      this.$(itemRowEl)
        .parent()
        .children()
        .first()
        .find('[rowspan]')
        .toggleClass('is-hovered');
    },

    showAllChanges: function()
    {
      this.$id('more').remove();
      this.$('.hidden').removeClass('hidden');

      this.hidden = false;
    }

  });
});
