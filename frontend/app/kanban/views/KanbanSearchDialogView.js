// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/kanban/templates/search'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    events: {

      'submit': function()
      {
        var phrase = this.$id('phrase').val();
        var model = this.model.entries.get(phrase);

        if (model && !model.attributes.deleted)
        {
          this.trigger('found', 'entry', model);
        }
        else
        {
          model = this.model.components.get(phrase);

          if (model)
          {
            this.trigger('found', 'component', model);
          }
        }

        this.closeDialog();

        return false;
      },

      'keydown #-phrase': function(e)
      {
        if (e.ctrlKey || e.shiftKey || e.altKey)
        {
          return e.keyCode !== 70;
        }

        return !(e.key.length === 1 && !/^[0-9]$/.test(e.key));
      },

      'input #-phrase': function()
      {
        var $phrase = this.$id('phrase');
        var phrase = this.$id('phrase').val();
        var error;

        if (phrase.length === 0)
        {
          error = '';
        }
        else if (phrase.length < 6)
        {
          error = this.t('search:invalid');
        }
        else if (phrase.length < 8)
        {
          var entry = this.model.entries.get(phrase);

          error = entry && !entry.attributes.deleted ? '' : this.t('search:invalid:ccn');
        }
        else
        {
          error = this.model.components.get(phrase) ? '' : this.t('search:invalid:nc12');
        }

        $phrase[0].setCustomValidity(error);
      },

      'blur #-phrase': function()
      {
        this.closeDialog();
      }

    },

    dialogClassName: 'kanban-search-dialog',

    template: template,

    closeDialog: function() {},

    onDialogShown: function(viewport)
    {
      this.closeDialog = viewport.closeDialog.bind(viewport);
    }

  });
});
