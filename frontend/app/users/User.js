// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  '../data/loadedModules',
  '../core/Model',
  './util/decorateUser'
], function(
  loadedModules,
  Model,
  decorateUser
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
      prodFunction: null,
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
      active: true,
      vendor: null,
      gender: null
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
    },

    url: function()
    {
      var url = Model.prototype.url.apply(this, arguments);

      if (this.isNew() || !loadedModules.isLoaded('vendors'))
      {
        return url;
      }

      return url + '?populate(vendor)';
    },

    serialize: function()
    {
      return decorateUser(this);
    }

  });
});
