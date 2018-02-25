// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/core/View',
  'app/sapLaborTimeFixer/templates/page',
  'app/sapLaborTimeFixer/data'
], function(
  t,
  View,
  template,
  data
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        t.bound('sapLaborTimeFixer', 'BREADCRUMBS:base')
      ];
    },

    initialize: function()
    {
      var page = this;

      page.properties = {};

      data.forEach(function(d)
      {
        d.laborTimes.forEach(function(laborTime)
        {
          Object.keys(laborTime.conditions).forEach(function(property)
          {
            var values = laborTime.conditions[property];

            if (Array.isArray(values))
            {
              values.forEach(function(value)
              {
                page.addProperty(property, value);
              });
            }
            else
            {
              page.addProperty(property, values);
            }
          });
        });
      });
    },

    addProperty: function(name, value)
    {
      var key = name.substring(name.indexOf('_') + 1);
      var prop = this.properties[key];

      if (!prop)
      {
        prop = this.properties[key] = {
          name: name,
          condition: '',
          values: []
        };
      }

      var matches = value.match(/^(=|>|<>?)?'?(.*?)'?$/);

      if (!matches)
      {
        return;
      }

      prop.condition = matches[1] || '=';

      if (prop.values.indexOf(matches[2]) === -1)
      {
        prop.values.push(matches[2]);
      }
    },

    afterRender: function()
    {
      this.$id('json').html(JSON.stringify(this.properties, null, 2));
    }

  });
});
