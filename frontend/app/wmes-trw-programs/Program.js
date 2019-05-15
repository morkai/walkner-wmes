// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  '../i18n',
  '../core/Model'
], function(
  require,
  _,
  t,
  Model
) {
  'use strict';

  function colorize(text)
  {
    return (text || '').replace(/<(#.*?)>(.*?)<\/>/g, function(match, attrs, inner)
    {
      var styles = [];

      attrs.split(/\s+/).forEach(function(attr, i)
      {
        if (/^#([A-F0-9]{3}|[A-F0-9]{6})$/.test(attr))
        {
          styles.push((i === 0 ? 'color: ' : 'background-color: ') + attr);
        }
        else if (/^#[a-z]+$/.test(attr))
        {
          styles.push((i === 0 ? 'color: ' : 'background-color: ') + attr.substring(1));
        }
        else if (attr === 'bold')
        {
          styles.push('font-weight: bold');
        }
        else if (attr === 'italic' || attr === 'oblique')
        {
          styles.push('font-style: ' + attr);
        }
        else if (attr === 'line-through' || attr === 'underline' || attr === 'overline')
        {
          styles.push('text-decoration: ' + attr);
        }
      });

      return '<span style="' + styles.join('; ') + '">' + inner + '</span>';
    });
  }

  return Model.extend({

    urlRoot: '/trw/programs',

    clientUrlRoot: '#trw/programs',

    topicPrefix: 'trw.programs',

    privilegePrefix: 'TRW',

    nlsDomain: 'wmes-trw-programs',

    labelAttribute: 'name',

    defaults: function()
    {
      return {
        steps: []
      };
    },

    url: function()
    {
      var url = Model.prototype.url.apply(this, arguments);

      if (this.isNew())
      {
        return url;
      }

      return url + '?populate(base)';
    },

    serialize: function()
    {
      var obj = this.toJSON();

      if (obj.base && obj.base.name)
      {
        obj.base = obj.base.name;
      }
      else
      {
        var dictionaries = require('app/wmes-trw-tests/dictionaries');
        var base = dictionaries.bases.get(obj.base);

        if (base)
        {
          obj.base = base.get('name');
        }
      }

      return obj;
    },

    serializeDetails: function()
    {
      var Program = this.constructor;
      var obj = this.serialize();
      var base = this.get('base');

      obj.steps = obj.steps.map(function(step)
      {
        return {
          source: Program.formatEndpoint(step.source, base),
          target: Program.formatEndpoint(step.target, base),
          color: Program.formatColor(step.color, '?'),
          length: Program.formatLength(step.length, '?')
        };
      });

      return obj;
    },

    serializeForm: function()
    {
      var formData = this.toJSON();

      if (formData.base && formData.base._id)
      {
        formData.base = formData.base._id;
      }

      return formData;
    },

    getStep: function(id)
    {
      return _.find(this.attributes.steps, function(step) { return step._id === id; });
    },

    getStepIndex: function(id)
    {
      return _.findIndex(this.attributes.steps, function(step) { return step._id === id; });
    }

  }, {

    colorize: colorize,

    COLORS: [
      'white',
      'brown',
      'black',
      'red',
      'purple',
      'blue',
      'orange',
      'pink',
      'grey',
      'green',
      'yellow'
    ],

    formatColor: function(color, defaultValue)
    {
      if (!color.length)
      {
        return defaultValue || '';
      }

      if (color.length === 1)
      {
        return t('wmes-trw-programs', 'colors:' + color[0]);
      }

      return color
        .map(function(c, i)
        {
          return t('wmes-trw-programs', 'colors:' + c + (i + 1 === color.length ? '' : ':multi'));
        })
        .join('-');
    },

    formatLength: function(length, defaultValue)
    {
      return length > 0 ? (length + 'mm') : (defaultValue || '');
    },

    formatEndpoint: function(endpoint, base)
    {
      if (!endpoint)
      {
        return '?';
      }

      if (!base)
      {
        return this.formatUnknownEndpoint(endpoint);
      }

      var cluster = _.find(base.clusters, function(cluster) { return cluster._id === endpoint.cluster; });

      if (!cluster || !cluster.rows[endpoint.row] || !cluster.rows[endpoint.row][endpoint.col])
      {
        return this.formatUnknownEndpoint(endpoint);
      }

      var cell = cluster.rows[endpoint.row][endpoint.col];
      var label = cluster.label.text + (/[0-9]$/.test(cluster.label.text) ? ':' : '') + cell.label;

      return label || this.formatUnknownEndpoint(endpoint);
    },

    formatUnknownEndpoint: function(endpoint)
    {
      if (!endpoint.cluster)
      {
        return '?';
      }

      return [endpoint.cluster, endpoint.row, endpoint.col].join(':');
    }

  });
});
