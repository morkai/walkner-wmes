define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/users',

    clientUrlRoot: '#users',

    topicPrefix: 'users',

    privilegePrefix: 'USERS',

    nlsDomain: 'users',

    labelAttribute: 'login',

    defaults: {
      login: '',
      email: '',
      mobile: '',
      privileges: null
    },

    initialize: function()
    {
      if (!Array.isArray(this.get('privileges')))
      {
        this.set('privileges', []);
      }
    }

  });
});
