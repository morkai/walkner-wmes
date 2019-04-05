// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/core/util/transliterate',
  'app/wmes-trw-tests/templates/programPicker'
], function(
  _,
  $,
  viewport,
  View,
  transliterate,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'focus [data-vkb]': function(e)
      {
        if (this.options.vkb)
        {
          this.options.vkb.show(e.currentTarget, this.onVkbValueChange.bind(this));
        }
      },
      'click .trw-testing-list .btn': function(e)
      {
        this.$('.active').removeClass('active');
        e.currentTarget.classList.add('active');
        this.toggleSubmit();
      },
      'input #-filter': function(e)
      {
        this.filterPhrase = this.prepareFilter(e.currentTarget.value);

        this.filterList();
      },
      'submit': function(e)
      {
        e.preventDefault();

        var data = {
          program: this.programs[this.$('.active').attr('data-id')]
        };

        data.program.tester = this.model.tester.toJSON();

        if (this.options.vkb)
        {
          this.options.vkb.hide();
        }

        this.trigger('picked', data);
      }
    },

    initialize: function()
    {
      this.filterPhrase = '';
      this.programs = {};

      $(window).on('resize.' + this.idPrefix, this.resize.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);

      if (this.options.vkb)
      {
        this.options.vkb.hide();
      }
    },

    onDialogShown: function()
    {
      this.resize();
      this.$id('filter').focus();
    },

    onVkbValueChange: function()
    {
      this.$id('filter').trigger('input');
    },

    afterRender: function()
    {
      this.toggleSubmit();
      this.loadPrograms();
    },

    resize: function()
    {
      if (!this.heightOffset)
      {
        this.heightOffset = this.$el.closest('.modal-content').outerHeight()
          - this.$id('programGroup').outerHeight() + 25 + 60;
      }

      var height = window.innerHeight - this.heightOffset;

      this.$('.trw-testing-list').css('height', height + 'px');
    },

    toggleSubmit: function()
    {
      this.$('.btn-primary').prop('disabled', this.$('.active').length === 0);
    },

    loadPrograms: function()
    {
      var view = this;
      var req = view.ajax({
        url: '/trw/programs?tester=' + encodeURIComponent(this.model.tester.id) + '&limit(0)'
      });

      view.programs = {};

      req.fail(function()
      {
        view.$('.fa-spin').removeClass('fa-spin');
      });

      req.done(function(res)
      {
        var html = '';
        var selectedProgram = view.model.program.id;

        res.collection.sort(function(a, b)
        {
          return a.name.localeCompare(b.name, undefined, {numeric: true, ignorePunctuation: true});
        });

        res.collection.forEach(function(program)
        {
          view.programs[program._id] = program;

          var filter = view.prepareFilter(program.name);
          var className = 'btn btn-lg btn-block btn-default';

          if (view.filterPhrase.length && filter.indexOf(view.filterPhrase) === -1)
          {
            className += ' hidden';
          }

          if (program._id === selectedProgram)
          {
            className += ' active';
          }

          html += '<button type="button" class="' + className + '"'
            + ' data-id="' + program._id + '"'
            + ' data-filter="' + filter + '">'
            + _.escape(program.name)
            + '</button>';
        });

        html += '<div class="trw-testing-list-last"></div>';

        view.$id('programs').html(html);

        var $active = view.$('.active');

        if ($active.length)
        {
          $active[0].scrollIntoView({block: 'center'});
        }

        view.toggleSubmit();
      });
    },

    prepareFilter: function(text)
    {
      return transliterate(text).replace(/[^a-zA-Z0-9]+/g, '').toUpperCase();
    },

    filterList: function()
    {
      var view = this;

      view.$id('programs').find('.btn-lg').each(function()
      {
        var hidden = view.filterPhrase.length > 0 && this.dataset.filter.indexOf(view.filterPhrase) === -1;

        this.classList.toggle('hidden', hidden);

        if (hidden)
        {
          this.classList.remove('active');
        }
      });

      this.toggleSubmit();
    }

  });
});
