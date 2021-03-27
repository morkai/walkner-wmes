// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  '../i18n',
  '../core/Collection',
  './EventType'
], function(
  t,
  Collection,
  EventType
) {
  'use strict';

  return Collection.extend({

    model: EventType,

    comparator: 'text',

    parse: function(res)
    {
      return res.map(function(type)
      {
        return {
          _id: type,
          text: t('events', 'TYPE:' + type)
        };
      });
    }

  });
});
