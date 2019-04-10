// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/viewport',
  'app/core/views/ListView',
  'app/logs-browserErrors/templates/details'
], function(
  _,
  viewport,
  ListView,
  detailsTemplate
) {
  'use strict';

  return ListView.extend({

    remoteTopics: {
      'logs.browserErrors.saved': function(message)
      {
        if (this.isAnyExpanded())
        {
          this.collection.add(message.errors);
        }
        else
        {
          this.refreshCollection();
        }
      },
      'logs.browserErrors.resolved': function(message)
      {
        var view = this;

        message.errors.forEach(function(errorId)
        {
          var error = view.collection.get(errorId);

          if (error)
          {
            view.collection.remove(error);
          }
        });

        this.refreshCollection();
      }
    },

    events: {
      'click .list-item': function(e)
      {
        this.toggle(e.currentTarget.dataset.id);
      },
      'click .btn-success': function(e)
      {
        var $btn = this.$(e.currentTarget).prop('disabled', true);
        var id = $btn.closest('tr').prev().attr('data-id');

        viewport.msg.saving();

        var req = this.ajax({
          method: 'POST',
          url: '/logs/browserErrors/' + id + ';resolve'
        });

        req.fail(function()
        {
          viewport.msg.savingFailed();

          $btn.prop('disabled', false);
        });

        req.done(function()
        {
          viewport.msg.saved();
        });
      }
    },

    columns: [
      {id: 'time', className: 'is-min'},
      {id: 'user', className: 'is-min'},
      {id: 'appId', className: 'is-min'},
      {id: 'location', className: 'is-min'},
      {id: 'source', className: 'is-min'},
      {id: 'error'}
    ],

    initialize: function()
    {
      ListView.prototype.initialize.apply(this, arguments);

      this.listenTo(this.collection, 'add remove', _.debounce(this.render.bind(this), 1));
    },

    serializeActions: function()
    {
      return null;
    },

    afterRender: function()
    {
      var view = this;

      ListView.prototype.afterRender.apply(view, arguments);

      Object.keys(view.collection.expanded).forEach(function(id)
      {
        view.toggle(id);
      });
    },

    isAnyExpanded: function()
    {
      return this.$('.is-expanded').length > 0;
    },

    toggle: function(id)
    {
      var $tr = this.$('.list-item[data-id="' + id + '"]');

      if (!$tr.length)
      {
        return;
      }

      if ($tr.hasClass('is-expanded'))
      {
        this.collapse(id, $tr);
      }
      else
      {
        this.expand(id, $tr);
      }
    },

    expand: function(id, $tr)
    {
      this.collection.expanded[id] = true;

      var $details = this.renderPartial(detailsTemplate, {
        error: this.collection.get(id).serializeDetails()
      });

      $details.insertAfter($tr);
      $tr.addClass('is-expanded');
    },

    collapse: function(id, $tr)
    {
      delete this.collection.expanded[id];

      $tr.removeClass('is-expanded');
      $tr.next().remove();
    }

  });
});
