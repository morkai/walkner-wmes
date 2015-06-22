// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  './LocalOrderPickerView',
  './DocumentViewerSettingsView',
  'app/orderDocuments/templates/documentListItem',
  'app/orderDocuments/templates/controls'
], function(
  _,
  $,
  t,
  viewport,
  View,
  LocalOrderPickerView,
  DocumentViewerSettingsView,
  renderDocumentListItem,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click #-reloadDocument': function()
      {
        this.trigger('documentReloadRequested');
      },
      'click #-openLocalOrderDialog': function()
      {
        var $openLocalOrderDialog = this.$id('openLocalOrderDialog');

        if ($openLocalOrderDialog.hasClass('active'))
        {
          this.model.resetLocalOrder();
          this.model.save();
          this.scrollIntoView();
        }
        else
        {
          this.openLocalOrderDialog();
        }

        $openLocalOrderDialog.blur();
      },
      'click #-openSettingsDialog': function(e)
      {
        this.openSettingsDialog();

        e.currentTarget.blur();
      },
      'click #-openLocalFileDialog': function()
      {
        var $openLocalFileDialog = this.$id('openLocalFileDialog');

        if ($openLocalFileDialog.hasClass('active'))
        {
          this.model.set('localFile', null);
          this.scrollIntoView();
        }
        else
        {
          this.$id('localFile').click();
        }

        $openLocalFileDialog.blur();
      },
      'change #-localFile': function(e)
      {
        var files = e.target.files;

        if (files.length)
        {
          this.model.set({
            nc15: null,
            localFile: {
              name: files[0].name,
              file: files[0]
            }
          });
        }
        else
        {
          this.model.set('localFile', null);
        }
      },
      'click .orderDocuments-document': function(e)
      {
        this.selectDocument(e.currentTarget.dataset.nc15, false);

        return false;
      },
      'keydown .orderDocuments-document': function(e)
      {
        if (e.keyCode === 27)
        {
          e.currentTarget.blur();

          return false;
        }

        if (e.keyCode === 13 || e.keyCode === 32)
        {
          this.selectDocument(e.currentTarget.dataset.nc15, true);

          return false;
        }

        if (e.keyCode === 40)
        {
          this.focusNextDocument(e.currentTarget);

          return false;
        }

        if (e.keyCode === 38)
        {
          this.focusPrevDocument(e.currentTarget);

          return false;
        }

        if (e.keyCode === 37)
        {
          this.focusFirstDocument();

          return false;
        }

        if (e.keyCode === 39)
        {
          this.focusLastDocument();

          return false;
        }
      },
      'wheel .is-expanded': function(e)
      {
        var $documents = this.$id('documents');
        var scrollTop = $documents.scrollTop();
        var scrollDown = e.originalEvent.deltaY > 0;

        if (!scrollDown && scrollTop === 0)
        {
          return;
        }

        if (scrollDown && (scrollTop + $documents.innerHeight()) >= $documents[0].scrollHeight)
        {
          return;
        }

        var scrollDelta = $(e.currentTarget).outerHeight() * (scrollDown ? 1 : -1);

        $documents.scrollTop(scrollTop + scrollDelta);

        var $expanded = this.$('.is-expanded');
        var $next = $expanded[scrollDelta > 0 ? 'next': 'prev']();

        $expanded.remove();

        this.expandDocument($next);
      },
      'submit #-filterForm': function()
      {
        return false;
      },
      'input #-filterPhrase': function(e)
      {
        this.filter(e.currentTarget.value);
      }
    },

    localTopics: {
      'socket.connected': 'updateButtons',
      'socket.disconnected': 'updateButtons'
    },

    initialize: function()
    {
      $(window).on('keypress.' + this.idPrefix, this.onKeyPress.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    beforeRender: function()
    {
      this.stopListening(this.model);
    },

    afterRender: function()
    {
      this.listenTo(this.model, 'change:prodLine', this.updateProdLine);
      this.listenTo(this.model, 'change:localFile', this.onLocalFileChange);
      this.listenTo(this.model, 'change:fileSource', this.onFileSourceChange);
      this.listenTo(
        this.model,
        'change:prefixFilterMode change:prefixFilter',
        _.debounce(this.updateDocuments.bind(this), 1, true)
      );
      this.listenTo(
        this.model,
        'change:localFile change:localOrder change:remoteOrder',
        _.debounce(this.onOrderChange.bind(this), 1)
      );

      this.updateButtons();
      this.updateProdLine();
      this.updateCurrentOrderInfo();
      this.updateDocuments();
    },

    resize: function(w, h)
    {
      if (w !== null)
      {
        this.el.style.width = w + 'px';
      }

      if (h !== null)
      {
        this.el.style.height = h + 'px';
      }
    },

    expandDocument: function($document)
    {
      var $expanded = this.$('.is-expanded');

      if ($expanded[0] === $document[0])
      {
        return;
      }

      $expanded.remove();

      var position = $document.position();
      var $clone = $document.clone()
        .addClass('is-expanded')
        .attr('tabindex', '')
        .css({
          position: 'absolute',
          top: position.top + 'px',
          left: position.left + 'px'
        });

      $clone.on('mouseleave', function()
      {
        $clone.remove();
      });

      $clone.insertAfter($document);
    },

    selectDocument: function(nc15, focus)
    {
      this.model.selectDocument(nc15);

      if (focus)
      {
        this.$id('documents').find('[data-nc15="' + nc15 + '"]').focus();
      }
    },

    deselectDocument: function()
    {
      this.$('.orderDocuments-document.is-active').removeClass('is-active');
    },

    focusNextDocument: function(documentEl)
    {
      var $next = this.$(documentEl).next();

      if ($next.hasClass('is-expanded'))
      {
        $next = $next.next();
      }

      if ($next.length)
      {
        $next.focus();
      }
      else
      {
        this.focusFirstDocument();
      }
    },

    focusPrevDocument: function(documentEl)
    {
      var $prev = this.$(documentEl).prev();

      if ($prev.hasClass('is-expanded'))
      {
        $prev = $prev.prev();
      }

      if ($prev.length)
      {
        $prev.focus();
      }
      else
      {
        this.focusLastDocument();
      }
    },

    focusFirstDocument: function()
    {
      this.$id('documents').children().first().focus();
    },

    focusLastDocument: function()
    {
      this.$id('documents').children().last().focus();
    },

    scrollIntoView: function()
    {
      var $activeDocument = this.$('.is-active');

      if ($activeDocument.length)
      {
        $activeDocument[0].scrollIntoView(true);

        this.el.ownerDocument.body.scrollTop = 0;
      }
    },

    filter: function(phrase)
    {
      this.$id('filterPhrase').val(phrase);

      phrase = phrase.trim().toLowerCase();

      var $documents = this.$('.orderDocuments-document');

      $documents.filter('.is-expanded').remove();

      if (phrase === '')
      {
        $documents.removeClass('hidden');
      }
      else
      {
        $documents.each(function()
        {
          this.classList.toggle('hidden', this.textContent.toLowerCase().indexOf(phrase) === -1);
        });
      }

      this.updateDocumentShortcuts();
    },

    clearFilter: function()
    {
      var $filterPhrase = this.$id('filterPhrase');

      if ($filterPhrase.val() !== '')
      {
        $filterPhrase.val('');
        this.filter('');
      }
    },

    focusFilter: function()
    {
      this.$id('filterPhrase').select();
    },

    openLocalOrderDialog: function()
    {
      var localOrderPickerDialog = new LocalOrderPickerView({
        model: this.model
      });

      this.listenToOnce(localOrderPickerDialog, 'localOrder', function(localOrder)
      {
        viewport.closeDialog();

        if (localOrder)
        {
          this.model.setLocalOrder(localOrder);
          this.model.save();
        }
      });

      viewport.showDialog(localOrderPickerDialog, t('orderDocuments', 'localOrderPicker:title'));
    },

    openSettingsDialog: function()
    {
      var settingsDialog = new DocumentViewerSettingsView({
        model: this.model
      });

      this.listenToOnce(settingsDialog, 'settings', function(settings)
      {
        viewport.closeDialog();

        if (settings)
        {
          this.model.set(settings);
          this.model.save();
        }
      });

      viewport.showDialog(settingsDialog, t('orderDocuments', 'settings:title'));
    },

    updateProdLine: function()
    {
      this.$id('prodLine').text(this.model.get('prodLine').name || '');
    },

    updateCurrentOrderInfo: function()
    {
      var $order = this.$id('order');
      var orderInfo = this.model.getCurrentOrderInfo();

      $order.find('[data-property]').each(function()
      {
        var text = orderInfo[this.dataset.property];

        this.style.display = text ? '' : 'none';
        this.textContent = text;
      });
    },

    updateDocuments: function()
    {
      var model = this.model;
      var currentOrder = model.getCurrentOrder();
      var localFile = model.get('localFile');
      var $documents = this.$id('documents');
      var html = '';

      $documents.find('.orderDocuments-document').off('mouseenter');

      _.forEach(currentOrder.documents, function(name, nc15)
      {
        if (model.filterNc15(nc15))
        {
          html += renderDocumentListItem({name: name, nc15: nc15});
        }
      });

      $documents
        .html(html)
        .find('.orderDocuments-document')
        .on('mouseenter', this.onDocumentMouseEnter.bind(this));

      this.filter(this.$id('filterPhrase').val());

      if (localFile || !currentOrder.documents[currentOrder.nc15])
      {
        return;
      }

      $documents
        .find('.orderDocuments-document[data-nc15="' + currentOrder.nc15 + '"]')
        .addClass('is-active');
    },

    updateDocumentShortcuts: function()
    {
      this.$('.orderDocuments-document-shortcut').remove();

      var $documents = this.$('.orderDocuments-document');
      var n = 1;
      var i = 0;

      while (n <= 9)
      {
        var $document = $documents.eq(i++);

        if (!$document.length)
        {
          break;
        }

        if ($document.hasClass('hidden'))
        {
          continue;
        }

        if ($document.hasClass('is-expanded'))
        {
          --n;
        }

        $document
          .find('.orderDocuments-document-name')
          .prepend('<span class="orderDocuments-document-shortcut">' + n + '. </span>');

        ++n;
      }
    },

    updateButtons: function()
    {
      var isDisconnected = !this.socket.isConnected();
      var hasLocalFile = this.model.get('localFile') !== null;
      var hasLocalOrder = this.model.get('localOrder').no !== null;
      var $openLocalOrderDialog = this.$id('openLocalOrderDialog');

      $openLocalOrderDialog.toggleClass('active', hasLocalOrder);

      if (!hasLocalOrder)
      {
        $openLocalOrderDialog.prop('disabled', isDisconnected);
      }

      this.$id('openSettingsDialog').prop('disabled', isDisconnected);

      this.$id('openLocalFileDialog').toggleClass('active', hasLocalFile);

      this.$id('reloadDocument').prop('disabled', hasLocalFile);
    },

    onOrderChange: function()
    {
      this.updateButtons();
      this.updateCurrentOrderInfo();
      this.updateDocuments();
    },

    onLocalFileChange: function()
    {
      if (this.model.get('localFile') === null)
      {
        this.$id('localFile').val('');
      }
    },

    onFileSourceChange: function()
    {
      this.$el.removeClass('fileSource-search fileSource-remote fileSource-local');

      var fileSource = this.model.get('fileSource');

      if (fileSource)
      {
        this.$el.addClass('fileSource-' + fileSource);
      }
    },

    onDocumentMouseEnter: function(e)
    {
      this.expandDocument(this.$(e.currentTarget));
    },

    onKeyPress: function(e)
    {
      var activeElement = document.activeElement;

      if (activeElement.tagName === 'INPUT'
        || activeElement.tagName === 'TEXTAREA'
        || activeElement.tagName === 'SELECT')
      {
        return;
      }

      if (e.charCode >= 49 || e.charCode <= 57)
      {
        var documentIndex = e.charCode - 49;
        var $visibleDocuments = this.$id('documents').find('.orderDocuments-document:visible');
        var selectedDocumentEl = $visibleDocuments[documentIndex];

        if (selectedDocumentEl)
        {
          this.selectDocument(selectedDocumentEl.dataset.nc15, true);
        }
      }
    }

  });
});
