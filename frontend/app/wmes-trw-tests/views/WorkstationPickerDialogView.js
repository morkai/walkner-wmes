// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/View',
  'app/wmes-trw-tests/templates/workstationPicker'
], function(
  _,
  $,
  viewport,
  View,
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
          this.options.vkb.show(e.currentTarget);
        }
      },
      'click #-lines .btn': function(e)
      {
        this.$('.active').removeClass('active');
        e.currentTarget.classList.add('active');
      },
      'submit': function(e)
      {
        e.preventDefault();

        var data = {
          workstation: parseInt(this.$id('workstation').val(), 10),
          line: this.$id('lines').find('.active').attr('data-id')
        };

        if (!(data.workstation >= 1 && data.workstation <= 7))
        {
          this.$id('workstation').focus();

          return;
        }

        if (!data.line)
        {
          this.$id('lines').children().first().focus();

          return;
        }

        if (this.options.vkb)
        {
          this.options.vkb.hide();
        }

        this.trigger('picked', data);
      }
    },

    initialize: function()
    {
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
      this.$id('workstation').focus();
    },

    afterRender: function()
    {
      this.$id('workstation').val(this.model.get('workstation') || '');
      this.loadLines();
    },

    resize: function()
    {
      if (!this.heightOffset)
      {
        this.heightOffset = this.$el.closest('.modal-content').outerHeight()
          - this.$id('lineGroup').outerHeight() + 25 + 60;
      }

      var height = window.innerHeight - this.heightOffset;

      this.$id('lines').css('height', height + 'px');
    },

    loadLines: function()
    {
      var view = this;
      var req = view.ajax({
        url: '/prodLines?select(_id)&sort(_id)&limit(0)&deactivatedAt=null'
      });

      req.fail(function()
      {
        view.$('.fa-spin').removeClass('fa-spin');
      });

      req.done(function(res)
      {
        var html = '';
        var selectedLine = view.model.get('line');

        res.collection.sort(function(a, b)
        {
          return a._id.localeCompare(b._id, undefined, {numeric: true, ignorePunctuation: true});
        });

        res.collection.forEach(function(line)
        {
          var lineId = _.escape(line._id);
          var className = line._id === selectedLine ? 'active' : '';

            html += '<button type="button" class="btn btn-lg btn-block btn-default ' + className + '"'
            + ' data-id="' + lineId + '">'
            + lineId
            + '</button>';
        });

        html += '<div class="trw-testing-list-last"></div>';

        view.$id('lines').html(html);

        var $active = view.$('.active');

        if ($active.length)
        {
          $active[0].scrollIntoView({block: 'center'});
        }
      });
    }

  });
});
