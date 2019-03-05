// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'underscore',
  'dragscroll',
  'interact',
  'app/i18n',
  'app/viewport',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  '../util/getRegionLabel',
  './ImageEditFormView',
  './RegionEditFormView',
  'app/opinionSurveyScanTemplates/templates/form',
  'app/opinionSurveyScanTemplates/templates/region'
], function(
  $,
  _,
  dragscroll,
  interact,
  i18n,
  viewport,
  FormView,
  idAndLabel,
  getRegionLabel,
  ImageEditFormView,
  RegionEditFormView,
  template,
  regionTemplate
) {
  'use strict';

  var t = i18n.forDomain('opinionSurveyScanTemplates');

  return FormView.extend({

    template: template,

    events: _.assign({

      'dblclick .is-selected': function(e)
      {
        this.editRegion(e.currentTarget);
      },
      'mousedown #-image': function(e)
      {
        if (e.button === 0)
        {
          e.preventDefault();
        }
      },
      'mousedown #-overlay': function(e)
      {
        if (e.button === 0)
        {
          this.onOverlayDown(e);
        }
      },
      'mouseup #-overlay': function(e)
      {
        if (e.button === 0)
        {
          this.onOverlayUp(e);
        }
      },
      'mousemove #-overlay': function(e)
      {
        this.onOverlayMove(e);
      },
      'click .btn[data-action]': function(e)
      {
        this.toggleAction(e.currentTarget.dataset.action);
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.onKeyDown = this.onKeyDown.bind(this);
      this.onScrollLimited = _.debounce(this.onScroll.bind(this), 1000 / 60);

      this.action = null;
      this.zIndex = 0;
      this.drawing = {
        enabled: false,
        started: false,
        finished: true,
        mode: null,
        $el: null,
        startX: 0,
        startY: 0,
        value: null
      };

      $(window).on('scroll.' + this.idPrefix, this.onScrollLimited);
      $(document.body).on('keydown.' + this.idPrefix, this.onKeyDown);
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      $(document.body).off('.' + this.idPrefix);

      if (this.regionInteract)
      {
        this.regionInteract.unset();
      }

      dragscroll.destroy();
    },

    serialize: function()
    {
      var model = this.model;
      var surveyId = model.getSurveyId();
      var image = {
        id: '',
        src: '/app/opinionSurveyScanTemplates/assets/empty.png',
        width: '1280',
        height: ''
      };
      var regions = [];

      if (model.get('image'))
      {
        image.id = model.get('image');
        image.src = '/opinionSurveys/scanTemplates/' + image.id + '.jpg';
        image.width = model.get('width');
        image.height = model.get('height');
      }

      (this.model.get('regions') || []).forEach(function(region)
      {
        regions.push({
          label: this.getRegionLabel(region.question, surveyId),
          region: region
        });
      }, this);

      return _.assign(FormView.prototype.serialize.call(this), {
        image: image,
        regions: regions,
        renderRegion: regionTemplate
      });
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.setUpSurveySelect2();
      this.setUpToolbarErrorFields();
      this.setUpImageDragScroll();
      this.setUpRegionInteract();
      this.toggleNoImageError();
      this.toggleNoRegionsError();
      this.onScroll();
    },

    setUpToolbarErrorFields: function()
    {
      var view = this;

      this.$('.opinionSurveyScanTemplates-toolbar-error').each(function()
      {
        var prevEl = this.previousElementSibling;

        if (prevEl)
        {
          var prevWidth = parseInt(prevEl.style.width, 10);
          var prevLeft = parseInt(prevEl.style.left, 10);

          this.style.left += (prevWidth + prevLeft + 7) + 'px';
        }
        else
        {
          this.style.left = '7px';
        }

        this.style.width = view.$('.btn[data-action="' + this.dataset.action + '"]').outerWidth() + 'px';
      });
    },

    setUpSurveySelect2: function()
    {
      this.$id('survey').select2({
        minimumResultsForSearch: 5,
        data: this.model.surveys.map(idAndLabel)
      });
    },

    setUpImageDragScroll: function()
    {
      dragscroll.reset({
        stopPropagation: false,
        accept: function(e)
        {
          return e.target.tagName === 'IMG';
        }
      });
    },

    setUpRegionInteract: function()
    {
      var view = this;

      this.regionInteract = interact('.opinionSurveyScanTemplates-region')
        .draggable({
          restrict: {
            restriction: 'parent',
            endOnly: false,
            elementRect: {top: 0, left: 0, bottom: 1, right: 1}
          },
          onstart: function()
          {

          },
          onend: function(e)
          {
            view.selectRegion(e.target);
          },
          onmove: function(e)
          {
            var el = e.target;
            var x = parseFloat(el.style.left) + e.dx;
            var y = parseFloat(el.style.top) + e.dy;

            el.style.left = x + 'px';
            el.style.top = y + 'px';
          }
        })
        .resizable({
          edges: {
            top: false,
            left: false,
            right: true,
            bottom: true
          },
          onend: function(e)
          {
            view.selectRegion(e.target);
          },
          onmove: function(e)
          {
            var el = e.target;
            var rect = e.rect;

            if (rect.width < 40 || rect.height < 40)
            {
              return;
            }

            el.style.width = rect.width + 'px';
            el.style.height = rect.height + 'px';
          }
        })
        .on('move', function(e)
        {
          e.currentTarget.style.cursor = document.documentElement.style.cursor;
        })
        .on('down', function(e)
        {
          view.selectRegion(e.currentTarget);
        });
    },

    toggleNoImageError: function()
    {
      var errorEl = this.el.querySelector('[data-role="noImageError"]');
      var error = this.$id('image').attr('data-id')
        ? ''
        : t('FORM:ERROR:noImage');

      errorEl.setCustomValidity(error);
    },

    toggleNoRegionsError: function()
    {
      var errorEl = this.el.querySelector('[data-role="noRegionsError"]');
      var error = this.getFormData().regions.length
        ? ''
        : t('FORM:ERROR:noRegions');

      errorEl.setCustomValidity(error);
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      if (_.isObject(formData.survey))
      {
        formData.survey = formData.survey._id || formData.survey.id;
      }

      return formData;
    },

    serializeForm: function(formData)
    {
      [
        'pageNumber',
        'dp',
        'minimumDistance',
        'cannyThreshold',
        'circleAccumulatorThreshold',
        'minimumRadius',
        'maximumRadius',
        'filledThreshold',
        'markedThreshold'
      ].forEach(function(prop)
      {
        formData[prop] = parseFloat(formData[prop]);
      });

      var imageEl = this.$id('image')[0];

      formData.image = imageEl.dataset.id;
      formData.width = parseInt(imageEl.width, 10);
      formData.height = parseInt(imageEl.height, 10);
      formData.regions = this.$('.opinionSurveyScanTemplates-region')
        .map(function()
        {
          return {
            question: this.dataset.question,
            options: this.dataset.options.length ? this.dataset.options.split(',') : [],
            top: parseInt(this.style.top, 10),
            left: parseInt(this.style.left, 10),
            width: parseInt(this.style.width, 10),
            height: parseInt(this.style.height, 10)
          };
        })
        .get()
        .filter(function(region)
        {
          return !_.isEmpty(region.question)
            && (region.question === 'comment' || !_.isEmpty(region.options));
        });

      return formData;
    },

    selectRegion: function(regionEl)
    {
      var $selected = this.$('.is-selected');

      if (regionEl === $selected[0])
      {
        regionEl.focus();

        return;
      }

      $selected.removeClass('is-selected');

      if (regionEl)
      {
        regionEl.classList.add('is-selected');
        regionEl.style.zIndex = ++this.zIndex;
        regionEl.focus();
      }
    },

    editRegion: function(regionEl)
    {
      var formView = this;
      var dialogView = new RegionEditFormView({
        model: {
          nlsDomain: this.model.getNlsDomain(),
          region: {
            question: regionEl.dataset.question,
            options: regionEl.dataset.options.split(',')
          },
          survey: this.model.surveys.get(this.$id('survey').val()) || null
        }
      });

      this.listenTo(dialogView, 'success', function(res)
      {
        formView.updateRegion(regionEl, res.question, res.options);
        viewport.closeDialog();
      });

      this.broker.subscribe('viewport.dialog.hidden')
        .setLimit(1)
        .setFilter(function(hiddenDialogView) { return hiddenDialogView === dialogView; })
        .on('message', function() { formView.toggleAction(null); });

      viewport.showDialog(dialogView, t('regionEditForm:title'));
    },

    getRegionLabel: function(questionId, surveyId)
    {
      return getRegionLabel(this.model.surveys.get(surveyId || this.$id('survey').val()), questionId);
    },

    updateRegion: function(regionEl, questionId, optionIds)
    {
      regionEl.dataset.question = questionId;
      regionEl.dataset.options = optionIds;
      regionEl.childNodes[0].textContent = this.getRegionLabel(questionId);

      this.toggleNoRegionsError();
    },

    updateImage: function(image, width, height)
    {
      this.$id('image').attr({
        src: '/opinionSurveys/scanTemplates/' + image + '.jpg',
        width: width,
        height: height,
        'data-id': image
      });

      this.toggleNoImageError();
    },

    leaveAction: _.noop,

    toggleAction: function(action)
    {
      this.$id('toolbar').find('.active').removeClass('active');

      if (!action || this.action === action)
      {
        this.leaveAction();
        this.leaveAction = _.noop;
        this.action = null;

        return;
      }

      this.action = action;

      this.$('.btn[data-action="' + action + '"]').addClass('active').blur();

      this['enter' + action.charAt(0).toUpperCase() + action.substring(1)]();
    },

    enterEditImage: function()
    {
      var formView = this;
      var dialogView = new ImageEditFormView({
        model: this.model
      });

      this.listenTo(dialogView, 'success', function(res)
      {
        formView.updateImage(res.image, res.width, res.height);
        viewport.closeDialog();
      });

      this.broker.subscribe('viewport.dialog.hidden')
        .setLimit(1)
        .setFilter(function(hiddenDialogView) { return hiddenDialogView === dialogView; })
        .on('message', function() { formView.toggleAction(null); });

      viewport.showDialog(dialogView, t('imageEditForm:title'));
    },

    enterMeasureDiameter: function()
    {
      this.startDrawing('line', function(ctx)
      {
        this.$id('minimumRadius').val(Math.floor(ctx.value / 2 * 0.8));
        this.$id('maximumRadius').val(Math.floor(ctx.value / 2 * 1.2));
        this.$id('minimumDistance').val(Math.floor(ctx.value * 1.25));
      });
    },

    enterCreateRegion: function()
    {
      this.startDrawing('region', function(ctx)
      {
        var region = _.assign({
          question: null,
          options: []
        }, ctx.value);
        var $region = $(regionTemplate({
          label: this.getRegionLabel(),
          region: region
        }));

        this.$id('page').append($region);

        this.selectRegion($region[0]);
        this.editRegion($region[0]);
      });
    },

    startDrawing: function(mode, handleValue)
    {
      this.drawing = {
        enabled: true,
        started: false,
        finished: false,
        mode: mode,
        $el: this.$id(mode).css('display', 'none'),
        startX: 0,
        startY: 0,
        value: null
      };

      this.$id('container').addClass('is-drawing');

      this.leaveAction = function()
      {
        var drawing = this.drawing;

        if (drawing.finished && drawing.value)
        {
          handleValue.call(this, drawing);
        }

        drawing.$el.css('display', 'none');
        drawing.$el = null;

        this.$id('container').removeClass('is-drawing');
      };
    },

    onKeyDown: function(e)
    {
      if (e.keyCode === 27)
      {
        this.toggleAction(null);
        this.selectRegion(null);
      }
      else if (e.keyCode === 46)
      {
        var $selectedRegion = this.$('.is-selected');

        if ($selectedRegion.length)
        {
          this.selectRegion(null);
          $selectedRegion.fadeOut('fast', function() { $selectedRegion.remove(); });
        }
      }
    },

    onScroll: function()
    {
      var $outer = this.$id('toolbar');

      $outer.toggleClass('is-fixed', window.scrollY > $outer.offset().top);
    },

    onOverlayDown: function(e)
    {
      var drawing = this.drawing;

      if (!drawing.enabled)
      {
        return;
      }

      drawing.started = true;
      drawing.startX = e.offsetX;
      drawing.startY = e.offsetY;
    },

    onOverlayMove: function(e)
    {
      if (!this.drawing.started)
      {
        return;
      }

      this.drawing.$el.css('display', '');

      this.drawItem(e);
    },

    onOverlayUp: function(e)
    {
      if (!this.drawing.started)
      {
        return;
      }

      this.drawing.finished = true;

      this.drawItem(e);
      this.toggleAction(null);
    },

    drawItem: function(e)
    {
      var drawing = this.drawing;

      if (drawing.mode === 'line')
      {
        this.drawLine(drawing.startX, drawing.startY, e.offsetX, e.offsetY);
      }
      else if (drawing.mode === 'region')
      {
        this.drawRegion(drawing.startX, drawing.startY, e.offsetX, e.offsetY);
      }
    },

    /**
     * @param {number} x1
     * @param {number} y1
     * @param {number} x2
     * @param {number} y2
     * @see http://stackoverflow.com/a/5912283
     */
    drawLine: function(x1, y1, x2, y2)
    {
      if (y1 < y2)
      {
        var pom = y1;
        y1 = y2;
        y2 = pom;
        pom = x1;
        x1 = x2;
        x2 = pom;
      }

      var a = Math.abs(x1 - x2);
      var b = Math.abs(y1 - y2);
      var c;
      var sx = (x1 + x2) / 2;
      var sy = (y1 + y2) / 2;
      var width = Math.sqrt(a * a + b * b);
      var x = sx - width / 2;
      var y = sy;

      a = width / 2;
      b = Math.sqrt(Math.abs(x1 - x) * Math.abs(x1 - x) + Math.abs(y1 - y) * Math.abs(y1 - y));
      c = Math.abs(sx - x);

      var cosb = (b * b - a * a - c * c) / (2 * a * c);
      var rad = Math.acos(cosb);
      var deg = (rad * 180) / Math.PI;

      this.drawing.$el.css({
        width: width + 'px',
        transform: 'rotate(' + deg + 'deg)',
        top: y + 'px',
        left: x + 'px'
      });

      this.drawing.value = Math.floor(width);

      this.$id('measuredValue').text(this.drawing.value);
    },

    drawRegion: function(x1, y1, x2, y2)
    {
      var tmp;

      if (y2 < y1)
      {
        tmp = y1;
        y1 = y2;
        y2 = tmp;
      }

      if (x2 < x1)
      {
        tmp = x1;
        x1 = x2;
        x2 = tmp;
      }

      var width = Math.abs(x1 - x2);
      var height = Math.abs(y1 - y2);

      this.drawing.$el.css({
        width: width + 'px',
        height: height + 'px',
        top: y1 + 'px',
        left: x1 + 'px'
      });
      this.drawing.value = {
        top: y1,
        left: x1,
        width: width,
        height: height
      };
    }

  });
});
