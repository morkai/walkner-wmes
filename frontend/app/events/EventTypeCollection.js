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

    parse: function(response)
    {
      return response.map(function(type)
      {
        return {value: type, label: t.bound('events', 'TYPE:' + type)};
      });
    }

  });
});
