// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/data/localStorage',
  'app/wmes-gft-tester/templates/unlockDialog'
], function(
  _,
  View,
  localStorage,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    dialogClassName: 'production-modal',

    events: {
      'submit': function(e)
      {
        e.preventDefault();

        var line = this.$id('list').find('.active').text().trim();
        var station = this.$('input[name="station"]:checked').val();

        if (!line || !station)
        {
          return;
        }

        this.$id('submit').prop('disabled', true);

        localStorage.setItem('GFT:LINE', line);
        localStorage.setItem('GFT:STATION', station);

        setTimeout(function() { window.location.reload(); }, 1);
      },
      'click #-list .btn': function(e)
      {
        this.$id('list').find('.active').removeClass('active');
        this.$(e.currentTarget).addClass('active');
      }
    },

    afterRender: function()
    {
      this.loadLines();

      this.$('input[name="station"][value="' + (this.model.get('station') || 6) + '"]').click();
    },

    selectActiveLine: function()
    {
      var $active = this.$id('list').find('.active');

      if ($active.length)
      {
        $active[0].scrollIntoView({block: 'center'});
      }
    },

    onDialogShown: function()
    {
      this.selectActiveLine();
    },

    loadLines: function()
    {
      var view = this;

      view.$id('submit').prop('disabled', true);

      var req = view.ajax({url: '/production/getActiveLines?subdivisionType=assembly'});

      req.fail(function()
      {
        view.$('.fa-spin').removeClass('fa-spin');
      });

      req.done(function(res)
      {
        var html = '';

        _.forEach(res.collection, function(line)
        {
          var label = _.escape(line._id);
          var className = 'btn btn-lg btn-default';

          if (line._id === view.model.get('prodLine'))
          {
            className += ' active';
          }

          html += '<button type="button" class="' + className + '">' + label + '</button>';
        });

        view.$id('list').html(html);
        view.$id('submit').prop('disabled', false);
        view.selectActiveLine();
      });
    }

  });
});
