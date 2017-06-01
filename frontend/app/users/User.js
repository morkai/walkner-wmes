// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../data/loadedModules',
  '../core/Model',
  './util/decorateUser'
], function(
  _,
  loadedModules,
  Model,
  decorateUser
) {
  'use strict';

  function parseMobileTime(time)
  {
    var parts = time.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);

    return {
      hours: hours,
      minutes: minutes,
      value: hours * 1000 + minutes
    };
  }

  return Model.extend({

    urlRoot: '/users',

    clientUrlRoot: '#users',

    topicPrefix: 'users',

    privilegePrefix: 'USERS',

    nlsDomain: 'users',

    labelAttribute: 'login',

    defaults: {},

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
    },

    getMobile: function()
    {
      var currentDate = new Date();
      var currentTimeValue = currentDate.getHours() * 1000 + currentDate.getMinutes();
      var mobile = this.get('mobile') || [];
      var number = mobile.length ? mobile[0].number : '';

      if (mobile.length > 1)
      {
        _.forEach(mobile, function(mobile)
        {
          var match = true;
          var fromTime = parseMobileTime(mobile.fromTime);
          var toTime = parseMobileTime(mobile.toTime === '00:00' ? '24:00' : mobile.toTime);

          if (toTime.value < fromTime.value)
          {
            match = currentTimeValue < toTime.value || currentTimeValue >= fromTime.value;
          }
          else if (fromTime.value < toTime.value)
          {
            match = currentTimeValue >= fromTime.value && currentTimeValue < toTime.value;
          }

          if (match)
          {
            number = mobile.number;
          }

          return match;
        });
      }

      if (number.length === 12)
      {
        return number.substr(0, 3) + ' ' + number.substr(3, 3) + ' ' + number.substr(6, 3) + ' ' + number.substr(9, 3);
      }

      if (number.length === 10)
      {
        return number.substr(0, 3) + ' ' + number.substr(3, 3) + ' ' + number.substr(6, 2) + ' ' + number.substr(8, 2);
      }

      return number;
    }

  });
});
