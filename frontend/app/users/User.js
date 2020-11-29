// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  'app/i18n',
  'app/core/Model',
  'app/data/loadedModules',
  'app/data/aors',
  'app/data/companies',
  'app/data/prodFunctions',
  'app/data/orgUnits',
  'app/orgUnits/util/renderOrgUnitPath'
], function(
  require,
  _,
  t,
  Model,
  loadedModules,
  aors,
  companies,
  prodFunctions,
  orgUnits,
  renderOrgUnitPath
) {
  'use strict';

  var NOTIFICATIONS = ['fap_sms', 'fm24_sms', 'fm24_email'];

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
      var obj = this.toJSON();
      var company = companies.get(obj.company);

      obj.name = '';

      if (obj.lastName)
      {
        obj.name = obj.lastName;
      }

      if (obj.firstName)
      {
        if (obj.name)
        {
          obj.name += ' ';
        }

        obj.name += obj.firstName;
      }

      obj.company = company ? company.getLabel() : '';

      obj.active = t('users', 'active:' + obj.active);

      if (Array.isArray(obj.aors))
      {
        obj.aors = obj.aors
          .map(function(aorId)
          {
            var aor = aors.get(aorId);

            return aor ? aor.getLabel() : null;
          })
          .filter(function(aorLabel)
          {
            return !!aorLabel;
          });
      }
      else
      {
        obj.aors = [];
      }

      var prodFunction = prodFunctions.get(obj.prodFunction);

      obj.prodFunction = prodFunction ? prodFunction.getLabel() : '';

      if (obj.orgUnitType && obj.orgUnitId)
      {
        var orgUnitModel = orgUnits.getByTypeAndId(obj.orgUnitType, obj.orgUnitId);

        if (orgUnitModel)
        {
          obj.orgUnit = renderOrgUnitPath(orgUnitModel, false, false);
        }
      }
      else
      {
        obj.orgUnit = '';
      }

      if (obj.vendor)
      {
        if (obj.vendor.name)
        {
          obj.vendor = obj.vendor.name + ' (' + obj.vendor._id + ')';
        }
        else if (obj.vendor._id)
        {
          obj.vendor = obj.vendor._id;
        }
      }

      if (loadedModules.isLoaded('wmes-osh'))
      {
        var oshDictionaries = require('app/wmes-osh-common/dictionaries');

        obj.oshWorkplace = oshDictionaries.getLabel('workplace', obj.oshWorkplace, {long: true});
        obj.oshDivision = oshDictionaries.getLabel('division', obj.oshDivision, {long: true});
      }

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serialize();

      obj.notifications = [];

      NOTIFICATIONS.forEach(function(pref)
      {
        if (obj.preferences && obj.preferences[pref])
        {
          obj.notifications.push(pref);
        }
      });

      obj.mrps = _.isEmpty(obj.mrps) ? '' : obj.mrps.join('; ');

      return obj;
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

  }, {

    NOTIFICATIONS: NOTIFICATIONS

  });
});
