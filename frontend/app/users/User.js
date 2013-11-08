define([
  'app/core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/users',

    clientUrlRoot: '#users',

    labelProperty: 'login',

    nlsDomain: 'users',

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
