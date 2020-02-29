// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/core/util/transliterate',
  'app/data/downtimeReasons',
  'app/wh/templates/downtimePicker'
], function(
  View,
  transliterate,
  downtimeReasons,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    nlsDomain: 'wh',

    events: {
      'submit': function()
      {
        var $reason = this.$('.active[data-reason]');

        if (!$reason.length || $reason.hasClass('hidden'))
        {
          return false;
        }

        this.trigger('picked', {
          downtimeReason: $reason[0].dataset.reason,
          downtimeComment: this.$id('comment').val().trim()
        });

        return false;
      },
      'click .btn[data-reason]': function(e)
      {
        this.$('.active[data-reason]').removeClass('active');

        e.currentTarget.classList.add('active');
      },
      'input #-filter': function()
      {
        var filter = this.transliterate(this.$id('filter').val().trim());

        this.$('.btn[data-reason]').each(function()
        {
          this.classList.toggle('hidden', this.dataset.filter.indexOf(filter) === -1);
        });
      }
    },

    getTemplateData: function()
    {
      var view = this;

      return {
        reasons: downtimeReasons.findBySubdivisionType('wh-pickup').map(function(reason)
        {
          return {
            id: reason.id,
            label: reason.get('label'),
            filter: view.transliterate(reason.id + reason.get('label'))
          };
        })
      };
    },

    afterRender: function()
    {
      this.$('.btn[data-filter]').first().click();
    },

    onDialogShown: function()
    {
      this.$id('filter').focus();
    },

    transliterate: function(s)
    {
      return transliterate(s).toUpperCase().replace(/[^A-Z0-9]+/g, '');
    }

  });
});
