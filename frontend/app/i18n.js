// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'moment',
  'select2',
  'app/broker'
], function(
  _,
  moment,
  select2,
  broker
) {
  'use strict';

  var allDomains = {};
  var allModules = [];

  /**
   * @param {string} domain
   * @param {string} key
   * @param {object.<string, string|number>} [data]
   * @returns {string}
   */
  function translate(domain, key, data)
  {
    try
    {
      return allDomains[domain][key](data);
    }
    catch (err)
    {
      if (allDomains[domain] && allDomains[domain][key])
      {
        throw err;
      }

      broker.publish('i18n.missingKey', {
        domain: domain,
        key: key
      });

      return key;
    }
  }

  /**
   * @param {string} domain
   * @param {object.<string, function>} keys
   * @param {string} [moduleId]
   */
  function register(domain, keys, moduleId)
  {
    allDomains[domain] = keys;

    if (typeof moduleId === 'string')
    {
      allModules.push(moduleId);
    }

    broker.publish('i18n.registered', {
      domain: domain,
      keys: keys,
      moduleId: moduleId
    });
  }

  /**
   * @param {string} newLocale
   * @param {function} [done]
   */
  function reload(newLocale, done)
  {
    var oldLocale = 'en';

    if (_.isObject(translate.config))
    {
      oldLocale = translate.config.locale;
      translate.config.locale = newLocale;
    }

    allModules.forEach(require.undef);

    var modules = [].concat(allModules);

    if (newLocale !== 'en')
    {
      modules.unshift('moment-lang/' + newLocale);
    }

    modules.unshift('select2-lang/' + newLocale);

    require(modules, function()
    {
      moment.locale(newLocale);
      select2.lang(newLocale);

      broker.publish('i18n.reloaded', {
        oldLocale: oldLocale,
        newLocale: newLocale
      });

      if (_.isFunction(done))
      {
        done();
      }
    });
  }

  /**
   * @param {string} domain
   * @param {string} key
   * @param {object.<string, string|number>} [data]
   * @returns {function(): string}
   */
  function bound(domain, key, data)
  {
    function boundTranslate()
    {
      return translate(domain, key, data);
    }

    boundTranslate.toString = boundTranslate;

    return boundTranslate;
  }

  /**
   * @param {string} domain
   * @param {string} key
   * @returns {boolean}
   */
  function has(domain, key)
  {
    return typeof allDomains[domain] !== 'undefined'
      && typeof allDomains[domain][key] === 'function';
  }

  translate.config = null;
  translate.translate = translate;
  translate.register = register;
  translate.reload = reload;
  translate.bound = bound;
  translate.has = has;

  window.i18n = translate;

  return translate;
});
