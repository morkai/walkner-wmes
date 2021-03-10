// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/viewport',
  'app/core/views/FormView'
], function(
  _,
  $,
  viewport,
  FormView
) {
  'use strict';

  return FormView.extend({

    events: Object.assign({

      'click #-cancel': function()
      {
        if (viewport.currentDialog === this)
        {
          viewport.closeDialog();
        }
        else if (window.history.length)
        {
          window.history.back();
        }
        else
        {
          window.location.href = this.model.genClientUrl('base');
        }
      },

      'change': function()
      {
        this.dirty = true;
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.dirty = false;

      $(document).on(`click.${this.idPrefix}`, 'a', this.onLinkClick.bind(this));
      $(window).on(`beforeunload.${this.idPrefix}`, this.onWindowBeforeUnload.bind(this));

      this.on('afterRender', () => this.dirty = false);
    },

    destroy: function()
    {
      FormView.prototype.destroy.apply(this, arguments);

      $(document).off(`.${this.idPrefix}`);
      $(window).off(`.${this.idPrefix}`);
    },

    showUnsavedDialog: function(a)
    {
      const t = Date.now();
      const ok = window.confirm(this.t('wmes-osh-common', 'FORM:unsaved')); // eslint-disable-line no-alert

      if (ok || Date.now() - t < 100)
      {
        this.dirty = false;

        a.click();
      }
      else
      {
        document.body.click();
      }
    },

    onLinkClick: function(e)
    {
      if (!this.dirty || e.button !== 0)
      {
        return;
      }

      const a = e.currentTarget;
      const href = a.getAttribute('href');

      if (!href || href.startsWith('javascript') || a.target === '_blank')
      {
        return;
      }

      this.showUnsavedDialog(a);

      return false;
    },

    onWindowBeforeUnload: function(e)
    {
      if (!this.dirty)
      {
        return;
      }

      return e.originalEvent.returnValue = this.t('wmes-osh-common', 'FORM:unsaved');
    }

  });
});
