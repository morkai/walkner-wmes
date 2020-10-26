// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'app/i18n',
  'app/core/Model'
], function(
  require,
  _,
  t,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/osh/companies',

    clientUrlRoot: '#osh/companies',

    topicPrefix: 'osh.companies',

    privilegePrefix: 'OSH:DICTIONARIES',

    nlsDomain: 'wmes-osh-companies',

    labelAttribute: 'shortName',

    defaults: {
      active: true,
      external: true,
      employer: false
    },

    getLabel: function({long, link} = {})
    {
      const label = this.get(long ? 'longName' : 'shortName');

      if (link)
      {
        return `<a href="${this.genClientUrl()}">${_.escape(label)}</a>`;
      }

      return label;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      obj.active = t('core', `BOOL:${obj.active}`);
      obj.external = t('core', `BOOL:${obj.external}`);
      obj.employer = t('core', `BOOL:${obj.employer}`);

      return obj;
    }

  });
});
