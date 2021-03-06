// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/i18n',
  'app/viewport',
  'app/core/View',
  'app/core/util/embedded',
  'app/core/util/getShiftStartInfo',
  'app/data/localStorage',
  'app/production/snManager',
  'app/wmes-ct-balancing/views/BalancingPceRecorderView',
  './LocalOrderPickerView',
  './DocumentViewerSettingsView',
  'app/orderDocuments/templates/documentListItem',
  'app/orderDocuments/templates/controls',
  'app/orderDocuments/templates/uiLock',
  'app/orderDocuments/templates/compRel'
], function(
  _,
  $,
  t,
  viewport,
  View,
  embedded,
  getShiftStartInfo,
  localStorage,
  snManager,
  BalancingPceRecorderView,
  LocalOrderPickerView,
  DocumentViewerSettingsView,
  renderDocumentListItem,
  template,
  uiLockTemplate,
  compRelTemplate
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
            this.model.resetExternalDocument();
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
      'click #-openAddObservationWindow': function(e)
      {
        this.control(e, function()
        {
          this.openAddObservationWindow();
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
      'click .orderDocuments-document-remove': function(e)
      {
        this.model.removeDocument(this.$(e.currentTarget).closest('.orderDocuments-document')[0].dataset.nc15);

        return false;
      },
      'click .orderDocuments-document': function(e)
      {
        var documentEl = e.currentTarget;
        var name;

        if (documentEl.classList.contains('is-search'))
        {
          name = documentEl.querySelector('.orderDocuments-document-name').textContent.trim();

          this.clearFilter();
        }

        this.selectDocument(documentEl.dataset.nc15, false, name);

        return false;
      },
      'keydown .orderDocuments-document': function(e)
      {
        if (embedded.isEnabled())
        {
          return;
        }

        var keyCode = e.keyCode;
        var documentEl = e.currentTarget;
        var view = this;

        if (keyCode === 27)
        {
          documentEl.blur();

          return false;
        }

        if (keyCode === 13 || keyCode === 32)
        {
          view.$(documentEl).click();

          setTimeout(function() { view.focusDocument(documentEl.dataset.nc15); }, 1);

          return false;
        }

        if (keyCode === 40)
        {
          view.focusNextDocument(documentEl);

          return false;
        }

        if (keyCode === 38)
        {
          view.focusPrevDocument(documentEl);

          return false;
        }

        if (keyCode === 37)
        {
          view.focusFirstDocument();

          return false;
        }

        if (keyCode === 39)
        {
          view.focusLastDocument();

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
        var $next = $expanded[scrollDelta > 0 ? 'next' : 'prev']();

        $expanded.remove();

        this.expandDocument($next);
      },
      'submit #-filterForm': function()
      {
        this.$id('documents').find('.orderDocuments-document:not(.hidden)').first().click();

        return false;
      },
      'input #-filterPhrase': function(e)
      {
        this.filter(e.currentTarget.value);
      },
      'focus #-filterPhrase': function()
      {
        if (this.timers.hideNumpad)
        {
          clearTimeout(this.timers.hideNumpad);
          this.timers.hideNumpad = null;
        }

        this.shrinkControls();
        this.showNumpad();
      },
      'blur #-filterPhrase': function()
      {
        this.timers.hideNumpad = setTimeout(this.hideNumpad.bind(this), 100);
      },
      'click #-prodLine': 'toggleControls',
      'click #-order': 'toggleControls',
      'click #-numpad > .btn': function(e)
      {
        this.pressNumpadKey(e.currentTarget.dataset.key);
      },
      'click #-lockUi': function(e)
      {
        this.control(e, this.lockUi);
      },
      'click #-confirm': 'confirmDocument',
      'click #-notes': 'confirmNotes',
      'click #-toggleBalancingRecorder': function(e)
      {
        this.control(e, this.toggleBalancingRecorder);
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

    getTemplateData: function()
    {
      return {
        touch: embedded.isEnabled()
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
        'change:prefixFilterMode change:prefixFilter change:documents change:confirmations',
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

      window.WMES_DOCS_LOCK_UI = this.lockUi.bind(this);

      if (localStorage.getItem('WMES_DOCS_UI_LOCKED') === '1')
      {
        this.lockUi();
      }

      embedded.render(this, {
        container: this.$id('embedded'),
        left: true
      });
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
        this.positionAddImprovementButtons();
      }
    },

    shrinkControls: function()
    {
      this.$id('buttons').removeClass('is-enlarged');
      this.$id('addImprovementButtons').addClass('hidden');
    },

    toggleControls: function()
    {
      if (this.$el.hasClass('is-touch'))
      {
        this.$id('buttons').toggleClass('is-enlarged');
        this.$id('addImprovementButtons').addClass('hidden');
        this.positionAddImprovementButtons();
      }
    },

    positionAddImprovementButtons: function()
    {
      this.$id('addImprovementButtons').css('left', this.$id('toggleAddImprovementButtons').position().left + 'px');
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

      if ($document.hasClass('is-locked'))
      {
        return;
      }

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

    selectDocument: function(nc15, focus, name)
    {
      this.shrinkControls();

      if (!this.model.isConfirmableDocument(nc15) && this.model.getOverallConfirmationStatus() !== 'confirmed')
      {
        return;
      }

      if (this.$id('confirm').find('.fa-spinner').length)
      {
        return;
      }

      this.model.selectDocument(nc15, name);

      if (focus)
      {
        this.focusDocument(nc15);
      }
    },

    focusDocument: function(nc15)
    {
      var $document = this.$id('documents').find('[data-nc15="' + nc15 + '"]');

      if ($document.length)
      {
        $document.focus()[0].scrollIntoView();
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
      $documents.filter('.is-search').remove();

      if (phrase === '')
      {
        $documents.removeClass('hidden');
      }
      else
      {
        var anyVisible = false;

        $documents.each(function()
        {
          var hidden = this.textContent.toLowerCase().indexOf(phrase) === -1;

          if (!hidden)
          {
            anyVisible = true;
          }

          this.classList.toggle('hidden', hidden);
        });

        if (!anyVisible)
        {
          this.search(phrase);
        }
      }

      this.updateDocumentShortcuts();
    },

    search: function(phrase)
    {
      var nc15 = (phrase.match(/([0-9]{15})/) || [])[1];

      if (!nc15)
      {
        return;
      }

      var view = this;

      view.ajax({
        type: 'HEAD',
        url: '/orderDocuments/' + nc15 + '?name=1'
      }).done(function(body, status, xhr)
      {
        view.$id('documents').append(renderDocumentListItem({
          name: xhr.getResponseHeader('X-Document-Name') || '?',
          nc15: nc15,
          search: true,
          external: false,
          locked: view.model.getOverallConfirmationStatus() !== 'confirmed'
            && !view.model.isConfirmableDocument(nc15)
        }));

        view.$id('documents').find('.is-search').on('mouseenter', view.onDocumentMouseEnter.bind(view));
      });
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

      this.listenToOnce(localOrderPickerDialog, 'document', function(document)
      {
        viewport.closeDialog();

        if (document)
        {
          this.selectDocument(document.nc15, true, document.name);
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

    openAddObservationWindow: function()
    {
      this.openAddImprovementWindow('/#behaviorObsCards;add');
    },

    openAddImprovementWindow: function(url)
    {
      url += '?standalone=1';

      var screen = window.screen;
      var width = screen.availWidth > 1350 ? 1300 : screen.availWidth * 0.7;
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
        var text = orderInfo[this.dataset.property] || '';

        this.style.display = text ? '' : 'none';
        this.textContent = text.replace(/\$__.*?__/g, '');
      });
    },

    updateDocuments: function()
    {
      var model = this.model;
      var currentOrder = model.getCurrentOrder();
      var confirmed = model.getOverallConfirmationStatus() === 'confirmed';
      var localFile = model.get('localFile');
      var $documents = this.$id('documents');
      var html = '';

      $documents.find('.orderDocuments-document').off('mouseenter');

      _.forEach(currentOrder.documents, function(name, nc15)
      {
        if (model.filterNc15(nc15) && !model.isIgnored(nc15))
        {
          html += renderDocumentListItem({
            name: name.replace(/\$__.*?__/g, ''),
            nc15: nc15,
            search: false,
            external: name.indexOf('$__EXTERNAL__') !== -1,
            locked: !confirmed && !model.isConfirmableDocument(nc15)
          });
        }
      });

      $documents
        .html(html)
        .find('.orderDocuments-document')
        .on('mouseenter', this.onDocumentMouseEnter.bind(this));

      this.filter(this.$id('filterPhrase').val());
      this.checkConfirmations();

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

      if (embedded.isEnabled())
      {
        return;
      }

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
      var hasLocalFile = !!this.model.get('localFile');
      var hasLocalOrder = !!this.model.get('localOrder').no || this.model.isExternalDocument();
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

    pressNumpadKey: function(key)
    {
      var inputEl = this.$id('filterPhrase')[0];
      var value = inputEl.value;
      var start = inputEl.selectionStart;
      var end = inputEl.selectionEnd;

      if (key === 'CLEAR')
      {
        start = 0;
        value = '';
      }
      else if (key === 'BACKSPACE')
      {
        start -= 1;
        value = value.substring(0, start) + value.substring(end);
      }
      else if (key === 'LEFT')
      {
        start -= 1;
      }
      else if (key === 'RIGHT')
      {
        start += 1;
      }
      else if (inputEl.maxLength === -1 || value.length < inputEl.maxLength)
      {
        value = value.substring(0, start) + key + value.substring(end);
        start += 1;
      }

      this.filter(value);

      inputEl.value = value;

      if (key === 'CLEAR')
      {
        this.hideNumpad();
      }
      else
      {
        inputEl.focus();
        inputEl.setSelectionRange(start, start);
      }
    },

    showNumpad: function()
    {
      this.$('.orderDocuments-controls-numpad').removeClass('hidden');
    },

    hideNumpad: function()
    {
      this.$('.orderDocuments-controls-numpad').addClass('hidden');
    },

    lockUi: function()
    {
      var $uiLock = this.$id('uiLock');

      if ($uiLock.length)
      {
        return;
      }

      $uiLock = $(uiLockTemplate({
        idPrefix: this.idPrefix
      }));

      $uiLock.find('div').on('click', function()
      {
        localStorage.removeItem('WMES_DOCS_UI_LOCKED');

        $uiLock.remove();
      });

      $uiLock.on('touchstart', function(e)
      {
        if (!$(e.target).closest('.orderDocuments-uiLock-inner').length)
        {
          return false;
        }
      });

      $uiLock.appendTo('body');

      localStorage.setItem('WMES_DOCS_UI_LOCKED', '1');
    },

    onOrderChange: function()
    {
      this.updateButtons();
      this.updateCurrentOrderInfo();
      this.updateDocuments();
      this.updateBalancingRecorderOrder();
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
      if (embedded.isEnabled())
      {
        return;
      }

      var activeElement = document.activeElement;

      if (activeElement.tagName === 'INPUT'
        || activeElement.tagName === 'TEXTAREA'
        || activeElement.tagName === 'SELECT'
        || this.model.isBomActive())
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
    },

    checkConfirmations: function()
    {
      this.updateConfirmButton();

      var status = this.model.getOverallConfirmationStatus();

      if (status === 'confirmed')
      {
        return;
      }

      var currentOrder = this.model.getCurrentOrder();
      var selectedDocument = currentOrder.nc15;

      if (this.model.isConfirmableDocument(currentOrder.nc15))
      {
        if (status === 'unknown')
        {
          this.fetchConfirmations(selectedDocument);
        }

        return;
      }

      this.selectDocument(this.model.getFirstUnconfirmedDocument(), true);
    },

    fetchConfirmations: function(oldSelectedDocument)
    {
      var view = this;

      clearTimeout(view.timers.fetchConfirmations);

      var currentOrder = view.model.getCurrentOrder();
      var req = view.ajax({
        url: '/orders/' + currentOrder.no + '/documents',
        data: {
          line: view.model.get('prodLine')._id,
          station: view.model.get('station')
        }
      });

      req.fail(function()
      {
        view.timers.fetchConfirmations = setTimeout(view.fetchConfirmations.bind(view, oldSelectedDocument), 5000);
      });

      req.done(function(orderData)
      {
        var station = view.model.get('station');
        var confirmations = {};

        _.forEach(orderData.confirmations, function(stations, nc15)
        {
          var status = stations[station];

          confirmations[nc15] = status === undefined ? 'unknown' : status;
        });

        view.model.setDocumentConfirmations(orderData.no, confirmations);

        if (view.model.getOverallConfirmationStatus() === 'confirmed')
        {
          if (!oldSelectedDocument || view.model.isConfirmableDocument(oldSelectedDocument))
          {
            oldSelectedDocument = 'ORDER';
          }

          view.selectDocument(oldSelectedDocument, true);
        }
      });
    },

    confirmDocument: function()
    {
      var view = this;
      var $confirm = view.$id('confirm');
      var $icon = $confirm.find('.fa');

      if ($icon.hasClass('fa-spinner'))
      {
        return;
      }

      $icon.removeClass('fa-thumbs-up').addClass('fa-spinner fa-spin');

      var currentOrder = view.model.getCurrentOrder();
      var message = {
        clientId: view.model.id,
        line: view.model.get('prodLine')._id,
        station: view.model.get('station'),
        orderNo: currentOrder.no,
        nc15: currentOrder.nc15,
        name: currentOrder.documents[currentOrder.nc15]
      };

      view.socket.emit('orderDocuments.confirm', message, function(err, confirmation)
      {
        if (err)
        {
          $confirm.removeClass('btn-success').addClass('btn-danger').find('.fa-spinner').removeClass('fa-spin');

          view.timers.updateConfirmButton = setTimeout(view.updateConfirmButton.bind(view), 3000);

          if (err.errors && err.errors.station)
          {
            view.handleNoStationError();
          }

          return;
        }

        view.model.handleConfirmation(confirmation);
        view.updateConfirmButton();
        view.selectDocument(view.model.getFirstUnconfirmedDocument() || 'ORDER', true);
      });
    },

    handleNoStationError: function()
    {
      var view = this;

      view.broker.subscribe('viewport.dialog.shown').setLimit(1).on('message', function()
      {
        snManager.showMessage({_id: ''}, 'error', t.bind(t, 'orderDocuments', 'controls:confirm:noStation'), 3000);

        viewport.currentDialog.$id('submit').click();
      });

      view.openSettingsDialog();
    },

    updateConfirmButton: function()
    {
      var confirmed = this.model.isConfirmedDocumentSelected();
      var confirmable = this.model.isConfirmableDocumentSelected();

      this.$id('confirm')
        .removeClass('btn-danger')
        .addClass('btn-success')
        .toggleClass('hidden', confirmed || !confirmable)
        .find('.fa-spinner')
        .removeClass('fa-spinner fa-spin')
        .addClass('fa-thumbs-up');
    },

    checkNotes: function()
    {
      var view = this;

      if (view.model.getOverallConfirmationStatus() !== 'confirmed')
      {
        return;
      }

      var currentOrder = view.model.getCurrentOrder();

      if (!currentOrder.no)
      {
        return;
      }

      if ((!Array.isArray(currentOrder.notes) || !currentOrder.notes.length)
        && (!Array.isArray(currentOrder.compRels) || !currentOrder.compRels.length))
      {
        return;
      }

      var notesState = JSON.parse(localStorage.getItem('WMES_DOCS_NOTES') || 'null') || {
        order: '',
        shift: 0
      };
      var currentShift = getShiftStartInfo(Date.now()).startTime;

      if (notesState.order === currentOrder.no && notesState.shift === currentShift)
      {
        return;
      }

      this.showNotes();
    },

    showNotes: function()
    {
      this.hideNotes();

      var $notes = this.$id('notes');
      var notes = this.model.getCurrentOrder().notes;
      var html = '<ul>';

      notes.forEach(function(note)
      {
        html += '<li>► ' + _.escape(note.text);
      });

      html += '</ul>';

      $notes.find('.orderDocuments-notes-bd').html(html);

      var $content = $notes.find('.orderDocuments-notes-content');

      $content.toggleClass('hidden', !notes.length);

      $notes.removeClass('hidden');

      if (notes.length)
      {
        $content.css({
          left: '50%',
          marginTop: ($content.outerHeight() / 2 * -1) + 'px',
          marginLeft: ($content.outerWidth() / 2 * -1) + 'px'
        });
      }

      this.showCompRels();
    },

    hideNotes: function()
    {
      this.$id('notes').addClass('hidden');
      this.hideCompRels();
    },

    showCompRels: function()
    {
      var compRels = this.model.getCurrentOrder().compRels || [];

      if (!compRels.length)
      {
        return;
      }

      var $top = this.$('.orderDocuments-compRels-top');
      var $bot = this.$('.orderDocuments-compRels-bot');
      var $container = $top;

      for (var i = 0; i < compRels.length; ++i)
      {
        var compRel = compRels[i];
        var $compRel = this.renderPartial(compRelTemplate, {
          compRel: compRel
        });

        if ((compRels.length === 4 && i === 2)
          || (compRels.length === 5 && i === 3)
          || (compRels.length === 6 && i === 3)
          || (compRels.length > 6 && i === 4))
        {
          $container = $bot;
        }

        $compRel.appendTo($container);

        if (i === 7)
        {
          break;
        }
      }

      if ($top[0].childElementCount)
      {
        $top.removeClass('hidden');
      }

      if ($bot[0].childElementCount)
      {
        $bot.removeClass('hidden');
      }
    },

    hideCompRels: function()
    {
      this.$('.orderDocuments-compRels').addClass('hidden').html('');
    },

    confirmNotes: function()
    {
      localStorage.setItem('WMES_DOCS_NOTES', JSON.stringify({
        order: this.model.getCurrentOrder().no,
        shift: getShiftStartInfo(Date.now()).startTime
      }));

      this.hideNotes();
    },

    toggleBalancingRecorder: function()
    {
      var recorderView = this.getView('#-balancing-recorder');

      if (!recorderView)
      {
        recorderView = new BalancingPceRecorderView();

        this.setView('#-balancing-recorder', recorderView);

        recorderView.render();
      }

      recorderView.toggle(this.model.getCurrentOrder().no);
    },

    updateBalancingRecorderOrder: function()
    {
      var recorderView = this.getView('#-balancing-recorder');

      if (recorderView)
      {
        recorderView.updateOrder(this.model.getCurrentOrder().no);
      }
    }

  });
});
