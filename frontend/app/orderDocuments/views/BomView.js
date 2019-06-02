// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  'app/core/util',
  'app/core/util/embedded',
  'app/core/util/scrollbarSize',
  'app/production/views/VkbView',
  'app/planning/util/contextMenu',
  'app/orderDocuments/templates/bom'
], function(
  _,
  View,
  util,
  embedded,
  scrollbarSize,
  VkbView,
  contextMenu,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    events: {
      'click #-close': function()
      {
        this.model.set('bom', _.defaults({active: false}, this.model.get('bom')));
      },
      'click #-next': function()
      {
        var oldScrollLeft = this.els.documentPages.scrollLeft;
        var index = Math.floor(oldScrollLeft / 300);

        this.els.documentPages.scrollLeft = index * 300 + 301;
      },
      'click #-prev': function()
      {
        var oldScrollLeft = this.els.documentPages.scrollLeft;
        var index = Math.floor(oldScrollLeft / 300);

        this.els.documentPages.scrollLeft = index === 1 ? 0 : (index * 300 - 299);
      },
      'click #-expand': function()
      {
        var ds = this.el.parentNode.dataset;

        ds.expand = Math.min(4, parseInt(ds.expand, 10) + 1).toString();
      },
      'click #-collapse': function()
      {
        var ds = this.el.parentNode.dataset;

        ds.expand = Math.max(0, parseInt(ds.expand, 10) - 1).toString();
      },
      'input #-filter': function(e)
      {
        this.filterPhrase = e.target.value;
        this.filter();
      },
      'focus #-filter': function(e)
      {
        clearTimeout(this.timers.hideVkb);

        var $filter = this.$id('filter');

        this.vkbView.show(e.currentTarget, function() { $filter.trigger('input'); });
      },
      'blur #-filter': function()
      {
        clearTimeout(this.timers.hideVkb);
        this.timers.hideVkb = setTimeout(this.vkbView.hide.bind(this.vkbView), 100);
      },
      'mouseenter .orderDocuments-bom-documentPages-page': function(e)
      {
        this.highlight(e.currentTarget, true);
      },
      'mouseleave .orderDocuments-bom-documentPages-page': function(e)
      {
        this.highlight(e.currentTarget, false);
      },
      'click .orderDocuments-bom-documentPages-page': function(e)
      {
        var $page = this.$(e.currentTarget);
        var nc15 = $page[0].dataset.document;

        if (!nc15)
        {
          return;
        }

        var page = +$page[0].dataset.page;

        if (!page)
        {
          this.showMoreMenu(e);

          return;
        }

        var componentI = +$page.closest('.orderDocuments-bom-documentPages-component')[0].dataset.componentIndex;
        var bom = this.model.get('bom');
        var component = bom.components[componentI];
        var marks = component.marks[nc15] || [];

        if (marks.length)
        {
          this.model.trigger('marksRequested', {
            nc15: nc15,
            page: page,
            marks: marks
          });
        }
      },
      'click .orderDocuments-bom-component': function(e)
      {
        if (this.el.parentNode.dataset.expand !== '0')
        {
          return;
        }

        var componentI = +e.currentTarget.dataset.componentIndex;
        var componentEl = this.els.documentPages.children[componentI];
        var currentOrder = this.model.getCurrentOrder();
        var pageEl = componentEl.querySelector(
          '.orderDocuments-bom-documentPages-page[data-document="' + currentOrder.nc15 + '"]'
        );

        if (pageEl)
        {
          pageEl.click();
        }
      }
    },

    initialize: function()
    {
      var view = this;

      view.filterPhrase = '';

      view.vkbView = new VkbView({
        reposition: function()
        {
          if (!this.fieldEl)
          {
            return;
          }

          var filterRect = view.$id('filter')[0].getBoundingClientRect();

          this.$el.css({
            top: (filterRect.top - 1) + 'px',
            left: (filterRect.left + filterRect.width - 1) + 'px',
            right: 'auto',
            bottom: 'auto',
            marginLeft: '0'
          });
        }
      });

      view.listenTo(view.model, 'change:bom', function()
      {
        if (!this.model.isBomActive())
        {
          view.vkbView.hide();
        }
      });

      view.setView('#-vkb', view.vkbView);
    },

    destroy: function()
    {
      this.els = {};
    },

    getTemplateData: function()
    {
      var view = this;
      var currentOrder = view.model.getCurrentOrder();
      var bom = view.model.get('bom') || {
        documents: {},
        components: []
      };
      var documents = [];

      if (bom.documents[currentOrder.nc15] !== undefined)
      {
        documents.push({
          nc15: currentOrder.nc15,
          name: bom.documents[currentOrder.nc15]
        });
      }

      Object.keys(bom.documents).forEach(function(nc15)
      {
        if (nc15 !== currentOrder.nc15)
        {
          documents.push({
            nc15: nc15,
            name: bom.documents[nc15]
          });
        }
      });

      var filterPhrase = view.filterPhrase.toUpperCase().replace(/[^0-9A-Z]+/g, '');

      bom.components.forEach(function(component, i)
      {
        if (!component.nameFilter)
        {
          component.nameFilter = component.name.toUpperCase().replace(/[^0-9A-Z]+/g, '');
        }

        component.visible = view.isVisible(component, i, filterPhrase);

        if (component.documentPages)
        {
          return;
        }

        component.hasAnyMarks = false;
        component.documentPages = [];

        documents.forEach(function(document)
        {
          var pages = {};

          (component.marks[document.nc15] || []).forEach(function(mark)
          {
            component.hasAnyMarks = true;
            pages[mark.p] = {
              page: mark.p,
              document: document.nc15
            };
          });

          component.documentPages.push(
            _.values(pages).sort(function(a, b) { return a.page - b.page; })
          );
        });
      });

      return {
        touch: embedded.isEnabled(),
        filterPhrase: view.filterPhrase,
        documents: documents,
        components: bom.components,
        scrollbarSize: scrollbarSize
      };
    },

    afterRender: function()
    {
      this.els = {
        components: this.$id('components')[0],
        documents: this.$id('documents')[0],
        documentPages: this.$id('documentPages')[0]
      };

      this.els.components.addEventListener('scroll', this.onComponentsScroll.bind(this));
      this.els.documents.addEventListener('scroll', this.onDocumentsScroll.bind(this));
      this.els.documentPages.addEventListener('scroll', this.onDocumentPagesScroll.bind(this));
    },

    filter: function()
    {
      var view = this;
      var bom = this.model.get('bom');
      var filterPhrase = view.filterPhrase.toUpperCase().replace(/[^0-9A-Z]+/g, '');

      view.$(view.els.components).children().each(function(i)
      {
        var component = bom.components[i];

        if (!component)
        {
          return;
        }

        var hidden = !view.isVisible(component, i, filterPhrase);

        view.els.components.children[i].classList.toggle('hidden', hidden);
        view.els.documentPages.children[i].classList.toggle('hidden', hidden);
      });
    },

    isVisible: function(component, i, filterPhrase)
    {
      var hidden = filterPhrase.length !== 0
        && component.item.indexOf(filterPhrase) === -1
        && component.nc12.indexOf(filterPhrase) === -1
        && component.nameFilter.indexOf(filterPhrase) === -1;

      return !hidden;
    },

    highlight: function(pageEl, toggle)
    {
      var document = pageEl.dataset.document;
      var documentEl = this.els.documents.querySelector('[data-nc15="' + document + '"]');
      var componentEl = this.$(pageEl).closest('.orderDocuments-bom-documentPages-component')[0];
      var componentI = +componentEl.dataset.componentIndex;

      this.els.components.children[componentI].classList.toggle('is-highlighted', toggle);

      if (documentEl)
      {
        documentEl.classList.toggle('is-highlighted', toggle);
      }
    },

    showMoreMenu: function(e)
    {
      var view = this;
      var $page = view.$(e.currentTarget);
      var nc15 = $page[0].dataset.document;
      var componentI = +$page.closest('.orderDocuments-bom-documentPages-component')[0].dataset.componentIndex;
      var bom = view.model.get('bom');
      var component = bom.components[componentI];
      var marks = component.marks[nc15];
      var pages = {};

      for (var i = 0; i < marks.length; ++i)
      {
        pages[marks[i].p] = marks[i].p;
      }

      var menu = [];

      _.values(pages).sort(function(a, b) { return a - b; }).forEach(function(page, i)
      {
        if (i < 3)
        {
          return;
        }

        menu.push({
          label: page.toString(),
          handler: requestMarks.bind(null, page)
        });
      });

      var columnCount = 4;

      if (menu.length > columnCount)
      {
        var fillCount = columnCount - (menu.length % columnCount);

        if (fillCount < columnCount)
        {
          for (var j = 0; j < fillCount; ++j)
          {
            menu.push({
              label: '&nbsp;',
              disabled: true
            });
          }
        }
      }

      contextMenu.show(view, e.pageY, e.pageX, {
        className: 'orderDocuments-bom-documentPages-more-menu',
        menu: menu
      });

      function requestMarks(page)
      {
        view.model.trigger('marksRequested', {
          nc15: nc15,
          page: page,
          marks: marks
        });
      }
    },

    onComponentsScroll: function()
    {
      this.els.documentPages.scrollTop = this.els.components.scrollTop;
    },

    onDocumentsScroll: function()
    {
      this.els.documentPages.scrollLeft = this.els.documents.scrollLeft;
    },

    onDocumentPagesScroll: function()
    {
      this.els.components.scrollTop = this.els.documentPages.scrollTop;
      this.els.documents.scrollLeft = this.els.documentPages.scrollLeft;
    }

  });
});
