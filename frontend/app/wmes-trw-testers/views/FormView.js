// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/views/FormView',
  '../Tester',
  'app/wmes-trw-testers/templates/form'
], function(
  _,
  FormView,
  Tester,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    events: _.assign({

      'click #-addIo': function()
      {
        this.addIo();
      },

      'click [data-action="removeIo"]': function(e)
      {
        var $row = this.$(e.currentTarget).closest('tr');

        $row.fadeOut('fast', function() { $row.remove(); });
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.ioI = 0;
    },

    afterRender: function()
    {
      (this.model.get('io') || []).forEach(this.addIo, this);

      FormView.prototype.afterRender.call(this);

      this.addIo();

      if (this.options.editMode)
      {
        this.$id('_id').prop('readonly', true);
        this.$id('name').focus();
      }
      else
      {
        this.$id('_id').focus();
      }
    },

    serialize: function()
    {
      return _.assign(FormView.prototype.serialize.apply(this, arguments), {
        ioTypes: Tester.IO_TYPES
      });
    },

    serializeForm: function(formData)
    {
      if (!formData.io)
      {
        formData.io = [];
      }

      formData.io.forEach(function(io)
      {
        if (!io.name)
        {
          io.name = io._id;
        }

        io.device = parseInt(io.device, 10);
        io.channel = parseInt(io.channel, 10);
        io.min = parseInt(io.min, 10) || 0;
        io.max = parseInt(io.max, 10) || 0;
      });

      formData.io = formData.io.filter(function(io) { return !!io._id && io.device >= 0 && io.channel >= 0; });

      formData.io.sort(function(a, b)
      {
        if (a.device === b.device)
        {
          return a.channel - b.channel;
        }

        return a.device - b.device;
      });

      return formData;
    },

    addIo: function()
    {
      var $io = this.$id('io');

      if (!this.ioTemplate)
      {
        this.ioTemplate = $io.html();

        $io.html('');
      }

      var html = this.ioTemplate.replace(/io\[]/g, 'io[' + this.ioI + ']');

      $io.append(html);

      ++this.ioI;
    }

  });
});
