// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/viewport',
  'app/core/views/FormView',
  'app/orders/templates/notesForm'
], function(
  viewport,
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    updateOnChange: false,

    events: Object.assign({

      'click .btn[data-action="up"]': function(e)
      {
        var $note = this.$(e.currentTarget).closest('tr');
        var $prev = $note.prev();

        if ($prev.length)
        {
          $note.insertBefore($prev);
        }
        else
        {
          $note.appendTo(this.$id('notes'));
        }

        this.recountNotes();

        e.currentTarget.focus();
      },

      'click .btn[data-action="down"]': function(e)
      {
        var $note = this.$(e.currentTarget).closest('tr');
        var $next = $note.next();

        if ($next.length)
        {
          $note.insertAfter($next);
        }
        else
        {
          $note.prependTo(this.$id('notes'));
        }

        this.recountNotes();

        e.currentTarget.focus();
      },

      'click #-add': function()
      {
        this.addNote({});
        this.serializeNotes();
      },

      'click #-clear': function()
      {
        this.$id('notes').html('');
        this.addNote({});
        this.serializeNotes();
        this.recountTargets();
      },

      'click .btn[data-target]': function(e)
      {
        var newTarget = e.currentTarget.dataset.target;

        if (newTarget === this.target)
        {
          return;
        }

        this.serializeNotes();
        this.recountTargets();

        this.target = newTarget;

        this.updateTarget();
      },

      'change textarea': function()
      {
        this.serializeNotes();
        this.recountTargets();
      },

      'change select': function(e)
      {
        e.currentTarget.dataset.value = e.currentTarget.value;

        this.serializeNotes();
      }

    }, FormView.prototype.events),

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$template = this.$id('notes').children().first().detach();

      if (!this.notes)
      {
        this.cacheNotes();
      }

      this.recountTargets();
      this.updateTarget();
    },

    updateTarget: function()
    {
      if (!this.target)
      {
        this.target = Object.keys(this.notes)[0] || 'docs';
      }

      this.$('.active[data-target]').removeClass('active');
      this.$('.btn[data-target="' + this.target + '"]').addClass('active');

      var notes = this.notes[this.target];

      if (!notes)
      {
        notes = this.notes[this.target] = [];
      }

      this.$id('notes').html('');

      notes.forEach(this.addNote, this);

      if (notes[notes.length - 1] !== '')
      {
        this.addNote({});
      }
    },

    cacheNotes: function()
    {
      var view = this;

      view.notes = {};

      (view.model.get('notes') || []).forEach(function(note)
      {
        if (!view.notes[note.target])
        {
          view.notes[note.target] = [];
        }

        view.notes[note.target].push(note);
      });
    },

    addNote: function(note)
    {
      var $notes = this.$id('notes');
      var $note = this.$template.clone();
      var $tds = $note.find('td');
      var text = $tds[1].firstElementChild;
      var priority = $tds[2].firstElementChild;

      $tds[0].textContent = ($notes[0].childElementCount + 1) + '.';
      text.value = note.text || '';
      priority.value = note.priority || 'warning';
      priority.dataset.value = priority.value;

      $notes.append($note);
    },

    recountNotes: function()
    {
      this.$('tbody > tr > td:first-child').each(function(i)
      {
        this.textContent = (i + 1) + '.';
      });
    },

    recountTargets: function()
    {
      var view = this;

      view.$('.btn[data-target]').each(function()
      {
        var notes = view.notes[this.dataset.target] || [];

        this.querySelector('.orders-notes-count').textContent = notes.length;
      });
    },

    serializeNotes: function()
    {
      var view = this;
      var keys = {};
      var notes = [];

      view.$id('notes').find('tr').each(function()
      {
        var text = this.querySelector('textarea').value.trim();
        var key = text.replace(/[^0-9a-zA-Z]+/, '');

        if (!key || keys[key])
        {
          return;
        }

        notes.push({
          target: view.target,
          priority: this.querySelector('select').value,
          text: text
        });

        keys[key] = true;
      });

      view.notes[view.target] = notes;
    },

    serializeForm: function()
    {
      var view = this;

      view.serializeNotes();

      var notes = [];

      Object.keys(view.notes).forEach(function(target)
      {
        view.notes[target].forEach(function(note)
        {
          notes.push(note);
        });
      });

      return {
        notes: notes
      };
    },

    request: function(formData)
    {
      return this.ajax({
        method: 'POST',
        url: this.model.url(),
        data: JSON.stringify(formData)
      });
    },

    handleSuccess: function()
    {
      viewport.closeDialog();
    }

  });
});
