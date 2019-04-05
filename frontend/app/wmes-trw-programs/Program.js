// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  '../core/Model'
], function(
  _,
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

    url: function()
    {
      var url = Model.prototype.url.apply(this, arguments);

      if (this.isNew())
      {
        return url;
      }

      return url + '?populate(tester)';
    },

    serialize: function()
    {
      var obj = this.toJSON();

      if (obj.tester && obj.tester.name)
      {
        obj.tester = obj.tester.name;
      }

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serialize();
      var tester = this.get('tester');
      var ioNames = {};

      (tester && tester.io || []).forEach(function(io)
      {
        ioNames[io._id] = io.name;
      });

      obj.steps = obj.steps.map(function(step)
      {
        return _.defaults({
          name: colorize(step.name),
          description: colorize(step.description),
          setIo: step.setIo.map(function(ioId) { return '▪ ' + (ioNames[ioId] || ioId); }).join(' &nbsp; '),
          checkIo: step.checkIo.map(function(ioId) { return '▪ ' + (ioNames[ioId] || ioId); }).join(' &nbsp; ')
        }, step);
      });

      return obj;
    },

    serializeForm: function()
    {
      var formData = this.toJSON();

      if (formData.tester && formData.tester._id)
      {
        formData.tester = formData.tester._id;
      }

      formData.steps = (formData.steps || []).map(function(step)
      {
        return {
          name: step.name,
          description: step.description,
          setIo: step.setIo.join(','),
          checkIo: step.checkIo.join(',')
        };
      });

      return formData;
    }

  }, {

    colorize: colorize

  });
});
