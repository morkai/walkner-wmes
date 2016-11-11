// Part of <http://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/prodShiftOrders/ProdShiftOrderCollection',
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
  ProdShiftOrderCollection,
  LocalOrderPickerView,
  DocumentViewerSettingsView,
  renderDocumentListItem,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click #-reloadDocument': function(e)
      {
        this.control(e, function()
        {
          this.trigger('documentReloadRequested');
        });
      },
      'click #-openDocumentWindow': function(e)
      {
        this.control(e, function()
        {
          this.trigger('documentWindowRequested');
        });
      },
      'click #-openLocalOrderDialog': function(e)
      {
        this.control(e, function()
        {
          var $openLocalOrderDialog = this.$id('openLocalOrderDialog');

          if ($openLocalOrderDialog.hasClass('active'))
          {
            this.model.resetLocalOrder();
            this.scrollIntoView();
          }
          else
          {
            this.openLocalOrderDialog();
          }

          $openLocalOrderDialog.blur();
        });
      },
      'click #-openSettingsDialog': function(e)
      {
        this.control(e, function()
        {
          this.openSettingsDialog();
        });
      },
      'click #-openLocalFileDialog': function(e)
      {
        this.control(e, function()
        {
          var $openLocalFileDialog = this.$id('openLocalFileDialog');

          if ($openLocalFileDialog.hasClass('active'))
          {
            this.model.resetLocalFile();
            this.scrollIntoView();
          }
          else
          {
            this.$id('localFile').click();
          }

          $openLocalFileDialog.blur();
        });
      },
      'click #-toggleAddImprovementButtons': function()
      {
        if (this.canUseControls())
        {
          this.$id('addImprovementButtons').toggleClass('hidden');

          if (this.$id('addImprovementButtons').hasClass('hidden'))
          {
            this.shrinkControls();
          }
        }
        else
        {
          this.enlargeControls();
        }
      },
      'click #-openAddNearMissWindow': function(e)
      {
        this.control(e, function()
        {
          this.openAddNearMissWindow();
          this.$id('addImprovementButtons').addClass('hidden');
        });
      },
      'click #-openAddSuggestionWindow': function(e)
      {
        this.control(e, function()
        {
          this.openAddSuggestionWindow();
          this.$id('addImprovementButtons').addClass('hidden');
        });
      },
      'change #-localFile': function(e)
      {
        var files = e.target.files;

        if (files.length)
        {
          this.model.setLocalFile(files[0].name, files[0]);
        }
        else
        {
          this.model.resetLocalFile();
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
      },
      'focus #-filterPhrase': 'shrinkControls',
      'click #-prodLine': 'toggleControls',
      'click #-order': 'toggleControls'
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

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        touch: window.location.search.indexOf('touch') !== -1
      };
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
        'change:prefixFilterMode change:prefixFilter change:documents',
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

      var $active = this.$('.is-active');

      if ($active.length)
      {
        $active[0].scrollIntoView();
      }
    },

    canUseControls: function()
    {
      return !this.$el.hasClass('is-touch') || this.$id('buttons').hasClass('is-enlarged');
    },

    enlargeControls: function()
    {
      if (this.$el.hasClass('is-touch'))
      {
        this.$id('buttons').addClass('is-enlarged');
      }
    },

    shrinkControls: function()
    {
      this.$id('buttons').removeClass('is-enlarged');
    },

    toggleControls: function()
    {
      if (this.$el.hasClass('is-touch'))
      {
        this.$id('buttons').toggleClass('is-enlarged');
      }
    },

    control: function(e, control)
    {
      if (this.canUseControls())
      {
        control.call(this, e);
        this.shrinkControls();
      }
      else
      {
        this.enlargeControls();
      }

      e.currentTarget.blur();
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
      this.shrinkControls();

      this.model.selectDocument(nc15);

      if (focus)
      {
        this.$id('documents').find('[data-nc15="' + nc15 + '"]').focus();
      }
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
        collection: new ProdShiftOrderCollection(null, {
          rqlQuery: 'select(orderId)&sort(-startedAt)&limit(10)&prodLine=' + this.model.get('prodLine')._id
        }),
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

    openAddNearMissWindow: function()
    {
      this.openAddImprovementWindow('/#kaizenOrders;add');
    },

    openAddSuggestionWindow: function()
    {
      this.openAddImprovementWindow('/#suggestions;add');
    },

    openAddImprovementWindow: function(url)
    {
      url += '?standalone=1';

      var screen = window.screen;
      var width = screen.availWidth > 1200 ? 1200 : screen.availWidth * 0.7;
      var height = screen.availHeight * 0.8;
      var left = Math.floor((screen.availWidth - width) / 2);
      var top = Math.min(100, Math.floor((screen.availHeight - height) / 2));
      var features = 'resizable,scrollbars,location=no'
        + ',top=' + top
        + ',left=' + left
        + ',width=' + Math.floor(width)
        + ',height=' + Math.floor(height);

      var win = window.open(url, 'WMES_IMPROVEMENTS', features);

      if (!win)
      {
        viewport.msg.show({
          type: 'error',
          time: 3000,
          text: t('orderDocuments', 'popup:improvement')
        });
      }
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

      this.toggleOpenDocumentWindowButton();
    },

    toggleOpenDocumentWindowButton: function()
    {
      this.$id('openDocumentWindow').prop('disabled', this.model.get('fileSource') === null);
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

      this.toggleOpenDocumentWindowButton();
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
