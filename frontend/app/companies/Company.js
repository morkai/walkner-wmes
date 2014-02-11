define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/companies',

    clientUrlRoot: '#companies',

    topicPrefix: 'companies',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'companies',

    labelAttribute: 'name',

    defaults: {
      name: null,
      fteMasterPosition: -1,
      fteLeaderPosition: -1
    },

    toJSON: function()
    {
      var company = Model.prototype.toJSON.call(this);

      if (!company.name)
      {
        company.name = company._id;
      }

      return company;
    }

  });
});
