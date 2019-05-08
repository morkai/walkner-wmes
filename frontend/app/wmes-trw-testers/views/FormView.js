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
      },

      'click .trw-testers-form-tearDown': function(e)
      {
        if (e.target.tagName === 'TD')
        {
          var checkboxEl = e.currentTarget.querySelector('input');

          if (!checkboxEl.disabled)
          {
            checkboxEl.checked = !checkboxEl.checked;
          }
        }
      },

      'change input[name$=".type"]': function(e)
      {
        this.toggleIo(this.$(e.currentTarget).closest('tr'));
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.ioI = 0;
    },

    afterRender: function()
    {
      var view = this;

      (view.model.get('io') || []).forEach(view.addIo, view);

      FormView.prototype.afterRender.call(view);

      view.$id('io').children().each(function()
      {
        view.toggleIo(view.$(this));
      });

      view.addIo();

      if (view.options.editMode)
      {
        view.$id('_id').prop('readonly', true);
        view.$id('name').focus();
      }
      else
      {
        view.$id('_id').focus();
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
        io.tearDown = !!io.tearDown;
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

      this.toggleIo($io.children().last());

      ++this.ioI;
    },

    toggleIo: function($io)
    {
      var type = $io.find('input[name$=".type"]:checked').val();

      $io.find('input[name$=".min"]').prop('disabled', type !== 'analog');
      $io.find('input[name$=".max"]').prop('disabled', type !== 'analog');
    }

  });
});
