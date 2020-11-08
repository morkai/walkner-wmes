// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'app/i18n',
  'app/time',
  'app/core/Model',
  'app/core/templates/userInfo',
  'app/wmes-osh-common/Entry'
], function(
  require,
  t,
  time,
  Model,
  userInfoTemplate,
  Entry
) {
  'use strict';

  return Model.extend({

    idAttribute: 'rid',

    getModelType: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');

      return dictionaries.PREFIX_TO_TYPE[this.get('rid').charAt(0)];
    },

    getRelation: function()
    {
      return {
        _id: this.get('_id'),
        rid: this.get('rid'),
        type: this.getModelType()
      };
    },

    handleUpdate: function(change)
    {
      const Model = this.constructor;
      const newData = {};

      Object.keys(change.data).forEach(prop =>
      {
        const changeHandler = Entry.changeHandlers[prop];
        const oldValue = change.data[prop][0];
        const newValue = change.data[prop][1];

        if (changeHandler)
        {
          const handlerOptions = {
            prop,
            newData,
            newValue,
            oldValue,
            change,
            Model,
            model: this
          };

          if (typeof changeHandler === 'string')
          {
            Entry.changeHandlers[changeHandler](handlerOptions);
          }
          else
          {
            changeHandler(handlerOptions);
          }
        }
        else
        {
          newData[prop] = newValue;
        }
      });

      this.set(newData);
    },

    serialize: function()
    {
      const dictionaries = require('app/wmes-osh-common/dictionaries');
      const obj = this.toJSON();

      obj.creator = userInfoTemplate(obj.creator, {noIp: true});
      obj.status = t('wmes-osh-common', `status:${obj.status}`);
      obj.url = `#osh/${dictionaries.TYPE_TO_MODULE[this.getModelType()]}/${this.get('_id')}`;

      return obj;
    },

    serializePopover: function()
    {
      const obj = this.serialize();

      obj.createdAt = obj.createdAt ? time.format(obj.createdAt, 'LLLL') : '';
      obj.implementers = !obj.implementers ? [] : obj.implementers.map(u => userInfoTemplate(u, {noIp: true}));

      return obj;
    },

    serializeRow: function()
    {
      const obj = this.serialize();

      obj.className = Entry.STATUS_TO_CLASS[this.get('status')];
      obj.createdAt = obj.createdAt ? time.format(obj.createdAt, 'L LT') : '';

      if (obj.implementers && obj.implementers.length)
      {
        obj.implementers = userInfoTemplate(obj.implementers[0], {noIp: true})
          + (obj.implementers.length > 1 ? ` +${obj.implementers.length - 1}` : '');
      }
      else
      {
        obj.implementers = '';
      }

      return obj;
    }

  });
});
