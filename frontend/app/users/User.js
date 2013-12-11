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
      login: null,
      email: null,
      prodFunction: 'unspecified',
      privileges: null,
      aors: null,
      company: null,
      kdDivision: null,
      personellId: null,
      card: null,
      firstName: null,
      lastName: null,
      registerDate: null,
      kdPosition: null,
      active: true
    },

    initialize: function()
    {
      if (!Array.isArray(this.get('privileges')))
      {
        this.set('privileges', []);
      }

      if (!Array.isArray(this.get('aors')))
      {
        this.set('aors', []);
      }
    },

    getLabel: function()
    {
      var lastName = this.get('lastName') || '';
      var firstName = this.get('firstName') || '';

      return lastName.length && firstName.length ? (lastName + ' ' + firstName) : this.get('login');
    }

  });
});
