// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/util/transliterate',
  'app/settings/SettingCollection',
  './Setting'
], function(
  t,
  transliterate,
  SettingCollection,
  Setting
) {
  'use strict';

  return SettingCollection.extend({

    model: Setting,

    idPrefix: 'osh.',

    topicSuffix: 'osh.**',

    prepareValue: function(id, newValue) // eslint-disable-line no-unused-vars
    {
      if (id.includes('rewards.ignoredUsers'))
      {
        return Array.isArray(newValue) ? newValue : [];
      }

      if (id.includes('rewards.companies'))
      {
        return this.parseRewardsCompaniesValue(newValue);
      }

      if (id.includes('rewards'))
      {
        return Math.round(this.prepareFloatValue(newValue, 0, 1000, 0) * 100) / 100;
      }
    },

    prepareFormValue: function(id, value)
    {
      if (id.includes('rewards.ignoredUsers'))
      {
        return value.map(u => u.id).join(',');
      }

      if (id.includes('rewards.companies'))
      {
        return this.prepareRewardsCompaniesValue(value);
      }

      return value;
    },

    prepareRewardsCompaniesValue: function(value)
    {
      return (value || []).map(v => `${v.text}: ${v.patterns.join('; ')}`).join('\n');
    },

    parseRewardsCompaniesValue: function(value)
    {
      let other = null;

      const companies = (value || '')
        .split('\n')
        .map(line =>
        {
          const parts = line.split(':');
          const text = parts.shift().trim();
          const patterns = parts.join(':').split(';').map(v => v.trim()).filter(v => !!v);

          if (!text)
          {
            return null;
          }

          const company = {
            id: transliterate(text).toUpperCase().replace(/[^A-Z0-9_]+/g, '_'),
            text,
            patterns
          };

          if (company.patterns.some(p => p === '*'))
          {
            other = company;
          }

          return company;
        })
        .filter(v => !!v && v !== other);

      if (!other)
      {
        other = {id: '', text: 'Inne', patterns: ['*']};
      }

      other.id = 'OTHER';

      companies.push(other);

      return companies;
    }

  });
});
