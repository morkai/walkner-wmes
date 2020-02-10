// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'require',
  'underscore',
  '../i18n',
  '../user',
  '../core/Model'
], function(
  require,
  _,
  t,
  user,
  Model
) {
  'use strict';

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
        steps: [],
        messages: []
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
    },

    getCluster: function(clusterId)
    {
      var base = this.get('base');

      if (!base)
      {
        return null;
      }

      return _.find(base.clusters, function(cluster) { return cluster._id === clusterId; });
    },

    getMessage: function(id)
    {
      return _.find(this.attributes.messages, function(message) { return message._id === id; });
    }

  }, {

    can: {
      manage: function()
      {
        return user.isAllowedTo('TRW:PROGRAM', 'TRW:MANAGE');
      }
    },

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

    ENDPOINT_TO_ANCHOR: {
      top: 'Top',
      left: 'Left',
      right: 'Right',
      bottom: 'Bottom'
    },

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
    },

    formatEndpointUuid: function(endpoint)
    {
      return [endpoint.cluster, endpoint.row, endpoint.col, endpoint.endpoint].join(':');
    },

    formatMessage: function(message, editable)
    {
      var className = [];
      var outerStyle = [];
      var innerStyle = [
        'align-items: ' + message.vAlign,
        'justify-content: ' + message.hAlign
      ];

      if (message.hAlign === 'top')
      {
        innerStyle.push('text-align: left');
      }
      else if (message.hAlign === 'end')
      {
        innerStyle.push('text-align: right');
      }

      if (editable)
      {
        className.push('is-editable');
      }

      if (message.top === null)
      {
        className.push('is-centered-top');
      }
      else
      {
        outerStyle.push('top: ' + message.top + 'px');
      }

      if (message.left === null)
      {
        className.push('is-centered-left');
      }
      else
      {
        outerStyle.push('left: ' + message.left + 'px');
      }

      if (message.width !== null)
      {
        innerStyle.push('width: ' + message.width + 'px');
      }

      if (message.height !== null)
      {
        innerStyle.push('height: ' + message.height + 'px');
      }

      if (message.fontSize)
      {
        innerStyle.push('font-size: ' + message.fontSize + 'px');
      }

      if (message.fontColor)
      {
        innerStyle.push('color: ' + message.fontColor);
      }

      if (message.bgColor)
      {
        innerStyle.push('background: ' + message.bgColor);
      }

      if (message.borderColor)
      {
        innerStyle.push('border-color: ' + message.borderColor);
      }

      if (message.borderWidth)
      {
        outerStyle.push('outline-offset: -' + message.borderWidth + 'px');
        innerStyle.push(
          'border-width: ' + message.borderWidth + 'px',
          'border-style: solid'
        );
      }

      return {
        id: message._id,
        text: message.text,
        className: className.join(' '),
        outerStyle: outerStyle.join('; '),
        innerStyle: innerStyle.join('; '),
        editable: editable
      };
    }

  });
});
