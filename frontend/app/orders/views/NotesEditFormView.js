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
        this.addNote('');
      },

      'click #-clear': function()
      {
        this.$id('notes').html('');
        this.addNote('');
      }

    }, FormView.prototype.events),

    afterRender: function()
    {
      FormView.prototype.afterRender.apply(this, arguments);

      this.$template = this.$id('notes').children().first().detach();

      (this.model.get('notes') || []).forEach(this.addNote, this);

      this.addNote('');
    },

    addNote: function(note)
    {
      var $notes = this.$id('notes');
      var $note = this.$template.clone();
      var $tds = $note.find('td');

      $tds[0].textContent = ($notes[0].childElementCount + 1) + '.';
      $tds[1].firstElementChild.value = note;

      $notes.append($note);
    },

    recountNotes: function()
    {
      this.$('tbody > tr > td:first-child').each(function(i)
      {
        this.textContent = (i + 1) + '.';
      });
    },

    serializeForm: function(formData)
    {
      formData.notes = (formData.notes || [])
        .map(function(text) { return text.trim().replace(/\n+/g, '\n'); })
        .filter(function(text) { return text.length > 0; });

      return formData;
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
