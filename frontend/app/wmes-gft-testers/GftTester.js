// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/Model'
], function(
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/gft/testers',

    clientUrlRoot: '#gft/testers',

    privilegePrefix: 'GFT',

    topicPrefix: 'gft.testers',

    nlsDomain: 'wmes-gft-testers',

    labelAttribute: 'name',

    serialize: function()
    {
      const obj = this.toJSON();

      obj.active = t('core', `BOOL:${obj.active}`);

      return obj;
    },

    serializeRow: function()
    {
      const obj = this.serialize();

      obj.host += `:${obj.port}`;
      obj.line = t(this.nlsDomain, 'LIST:line', {line: obj.line, station: obj.station});

      return obj;
    }

  });
});
