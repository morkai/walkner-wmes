// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  '../i18n',
  '../time',
  '../core/Model',
  './PurchaseOrderItemCollection'
], function(
  _,
  t,
  time,
  Model,
  PurchaseOrderItemCollection
) {
  'use strict';

  return Model.extend({

    urlRoot: '/purchaseOrders',

    clientUrlRoot: '#purchaseOrders',

    topicPrefix: 'purchaseOrders',

    privilegePrefix: 'PURCHASE_ORDERS',

    nlsDomain: 'purchaseOrders',

    labelAttribute: '_id',

    defaults: {

    },

    getFirstScheduledQuantity: function(item)
    {
      return this.get('items').get(item).get('schedule')[0].qty;
    },

    parse: function(data, xhr)
    {
      data = Model.prototype.parse.call(this, data, xhr);

      data.items = new PurchaseOrderItemCollection(data.items);

      return data;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.docDate = time.getMoment(obj.docDate).utc().format('LL');

      if (obj.vendor && obj.vendor._id)
      {
        obj.vendorText = obj.vendor._id;

        if (obj.vendor.name.length)
        {
          obj.vendorText += ': ' + obj.vendor.name;
        }
      }
      else
      {
        obj.vendorText = obj.vendor;
      }

      obj.items = obj.items ? obj.items.invoke('serialize') : [];

      var minScheduleDate = this.get('items').getMinScheduleDate();

      obj.minScheduleDate = minScheduleDate
        ? time.getMoment(minScheduleDate).utc().format('YYYY-MM-DD')
        : null;

      obj.className = obj.open ? (obj.printed ? 'info' : '') : 'success';

      if (obj.importedAt)
      {
        obj.importedAtText = time.format(obj.importedAt, 'LLLL');
      }

      if (obj.createdAt)
      {
        obj.createdAtText = time.format(obj.createdAt, 'LLLL');
      }

      if (obj.updatedAt)
      {
        obj.updatedAtText = time.format(obj.updatedAt, 'LLLL');
      }

      if (obj.changes)
      {
        obj.changes = this.serializeChanges();
      }

      return obj;
    },

    serializeChanges: function()
    {
      var result = [];
      var model = this;
      var changeList = this.get('changes');
      var lastChangeIndex = changeList.length - 1;

      changeList.forEach(function(changes, i)
      {
        var properties = [];
        var newItems = [];

        Object.keys(changes.data).forEach(function(propertyName)
        {
          var values = changes.data[propertyName];
          var change = model.serializeChange(propertyName, values[0], values[1]);

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
        });

        if (newItems.length)
        {
          properties.push({
            key: 'newItems',
            name: t('purchaseOrders', 'changes:newItems'),
            oldValue: '-',
            newValue: model.serializeNewItems(newItems)
          });
        }

        result.push({
          visible: lastChangeIndex < 3 || i === 0 || i === lastChangeIndex,
          date: time.format(changes.date, 'LLLL'),
          properties: properties
        });
      });

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
          readablePropertyName = t('purchaseOrders', 'changes:itemProp', {
            item: readablePropertyName,
            prop: t('purchaseOrders', 'PROPERTY:item.' + nameParts[2])
          });
          propertyKey += '.' + nameParts[2];
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
        return this.serializeScheduleChangeValue(rawValue);
      }

      return _.escape(JSON.stringify(rawValue));
    },

    serializeScheduleChangeValue: function(rawSchedule)
    {
      if (!Array.isArray(rawSchedule))
      {
        return _.escape(JSON.stringify(rawSchedule));
      }

      var html = '<ul>';

      rawSchedule.forEach(function(schedule)
      {
        html += '<li>' + schedule.qty.toLocaleString() + ' @ ' + time.getMoment(schedule.date).utc().format('LL');
      });

      html += '</ul>';

      return html;
    },

    serializeItemChangeValue: function(rawItem)
    {
      return {
        _id: rawItem._id,
        nc12: rawItem.nc12,
        unit: rawItem.unit,
        qty: rawItem.qty.toLocaleString(),
        name: _.escape(rawItem.name),
        schedule: this.serializeScheduleChangeValue(rawItem.schedule)
      };
    },

    serializeNewItems: function(newItems)
    {
      var html = '<table class="table table-bordered table-hover"><thead><tr>';
      html += '<th>' + t('purchaseOrders', 'PROPERTY:item._id');
      html += '<th>' + t('purchaseOrders', 'PROPERTY:item.nc12');
      html += '<th>' + t('purchaseOrders', 'PROPERTY:item.unit');
      html += '<th>' + t('purchaseOrders', 'PROPERTY:item.qty');
      html += '<th>' + t('purchaseOrders', 'PROPERTY:item.name');
      html += '<th>' + t('purchaseOrders', 'PROPERTY:item.schedule');
      html += '<tbody>';

      newItems.forEach(function(item)
      {
        html += '<tr>';
        html += '<td>' + item._id;
        html += '<td>' + item.nc12;
        html += '<td>' + item.unit;
        html += '<td>' + item.qty;
        html += '<td class="pos-details-changes-item-name">' + item.name;
        html += '<td>' + item.schedule;
      });

      html += '</table>';

      return html;
    }

  });
});
