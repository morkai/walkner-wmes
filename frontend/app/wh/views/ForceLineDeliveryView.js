// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/wh/templates/delivery/forceLine'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    nlsDomain: 'wh',

    events: {
      'submit': function()
      {
        var $line = this.$('.active[data-line]');

        if (!$line.length || $line.hasClass('hidden'))
        {
          return false;
        }

        this.trigger('picked', {
          line: $line[0].dataset.line,
          card: this.$id('card').val().trim()
        });

        return false;
      },
      'click .btn[data-line]': function(e)
      {
        this.$('.active[data-line]').removeClass('active');

        e.currentTarget.classList.add('active');
      },
      'input #-filter': function()
      {
        var filter = this.transliterate(this.$id('filter').val().trim());

        this.$('.btn[data-line]').each(function()
        {
          this.classList.toggle('hidden', this.dataset.filter.indexOf(filter) === -1);
        });
      }
    },

    getTemplateData: function()
    {
      return {
        card: this.model.get('personnelId'),
        lines: this.serializeLines()
      };
    },

    serializeLines: function()
    {
      var view = this;
      var map = {};

      view.setCarts.forEach(function(setCart)
      {
        if (setCart.get('deliveringAt'))
        {
          return;
        }

        setCart.get('lines').forEach(function(line)
        {
          map[line] = 1;
        });
      });

      return Object.keys(map).map(function(line)
      {
        return {
          _id: line,
          filter: view.transliterate(line)
        };
      });
    },

    afterRender: function()
    {
      this.$('.btn[data-filter]').first().click();
    },

    onDialogShown: function()
    {
      var $active = this.$('.active[data-filter]');

      if ($active.length)
      {
        $active[0].scrollIntoView();
      }
    },

    transliterate: function(s)
    {
      return s.toUpperCase().replace(/[^A-Z0-9]+/g, '');
    },

    getCard: function()
    {
      return this.$id('card').val().trim();
    },

    setCard: function(card)
    {
      if (this.getCard() === card)
      {
        this.$id('submit').click();
      }
      else
      {
        this.$id('card').val(card);
      }
    }

  });
});
