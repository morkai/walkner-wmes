// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'jsplumb',
  'app/viewport',
  'app/core/Model',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/core/util/uuid',
  'app/planning/util/contextMenu',
  'app/wmes-trw-tests/dictionaries',
  'app/wmes-trw-bases/Base',
  'app/wmes-trw-bases/templates/cluster',
  '../Program',
  'app/wmes-trw-programs/templates/form'
], function(
  _,
  $,
  jsPlumb,
  viewport,
  Model,
  FormView,
  idAndLabel,
  uuid,
  contextMenu,
  dictionaries,
  Base,
  clusterTemplate,
  Program,
  template
) {
  'use strict';

  var ENDPOINT_TO_ANCHOR = {
    top: 'Top',
    left: 'Left',
    right: 'Right',
    bottom: 'Bottom'
  };

  return FormView.extend({

    template: template,

    events: _.assign({

      'change #-base': function()
      {
        this.loadBase();
      },
      'click #-steps-play': function()
      {

      },
      'click #-steps-add': function()
      {
        var step = {
          _id: uuid(),
          color: [],
          length: 0,
          source: {
            cluster: '',
            row: -1,
            col: -1,
            endpoint: ''
          },
          target: {
            cluster: '',
            row: -1,
            col: -1,
            endpoint: ''
          },
          connector: 'Bezier'
        };

        this.model.attributes.steps.push(step);

        this.addStep(step, true);
      },
      'click #-steps-delete': function()
      {
        this.deleteStep(this.selectedStep);
      },
      'click #-steps-up': function()
      {
        this.moveStepUp(this.selectedStep);
      },
      'click #-steps-down': function()
      {
        this.moveStepDown(this.selectedStep);
      },
      'click .trw-programs-step': function(e)
      {
        this.selectStep(e.currentTarget.dataset.id);
      },
      'click .trw-programs-canvasAndSteps': function()
      {
        this.hideEditor();
      },
      'click .trw-testing-prop[data-prop="color"]': function()
      {
        this.showColorEditor();

        return false;
      },
      'click .trw-testing-prop[data-prop="length"]': function()
      {
        this.showLengthEditor();

        return false;
      }

    }, FormView.prototype.events),

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.jsPlumb = null;
      this.base = null;
      this.selectedStep = null;

      $(window).on('keydown.' + this.idPrefix, this.onKeyDown.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      this.hideEditor();
      this.resetCanvas(true);
      this.jsPlumb = null;
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      this.$id('base').select2({
        data: dictionaries.bases.map(idAndLabel)
      });

      this.setUpJsPlumb();

      var base = this.model.get('base');

      if (_.isObject(base))
      {
        this.base = base;
        this.completeRendering();
      }
      else
      {
        this.loadBase();
      }
    },

    completeRendering: function()
    {
      this.resetCanvas();
      this.renderCanvas();
      this.renderSteps();

      if (_.isEmpty(this.model.get('steps')))
      {
        this.$id('steps-add').click();
      }
      else
      {
        var $step = this.$step(this.selectedStep);

        this.selectedStep = null;

        if ($step.length)
        {
          $step.click();
        }
        else
        {
          this.$('.trw-programs-step').first().click();
        }
      }
    },

    onKeyDown: function(e)
    {
      if (e.key === 'Escape')
      {
        this.hideEditor();
      }
    },

    setUpJsPlumb: function()
    {
      var view = this;

      view.jsPlumb = jsPlumb.getInstance({
        Container: this.$('.trw-base-canvas-inner')[0],
        ConnectionOverlays: [
          ['Arrow', {
            id: 'ARROW',
            location: -6,
            cssClass: 'trw-base-canvas-arrow',
            visible: true,
            width: 22,
            length: 22
          }],
          ['Label', {
            id: 'LABEL',
            location: 0.5,
            cssClass: 'trw-base-canvas-label',
            visible: false
          }]
        ]
      });

      view.jsPlumb.bind('connection', view.onConnectionCreated.bind(view));
      view.jsPlumb.bind('click', view.onConnectionClicked.bind(view));
      view.jsPlumb.bind('contextmenu', function(el, e)
      {
        e.preventDefault();
      });
    },

    onConnectionCreated: function(info, e)
    {
      var view = this;

      var stepId = info.connection.getParameter('step');
      var selectNext = false;

      if (!stepId)
      {
        view.jsPlumb.getConnections().forEach(function(connection)
        {
          if (connection.getParameter('step') === view.selectedStep)
          {
            view.jsPlumb.deleteConnection(connection);
          }
        });

        info.connection.setParameter('step', view.selectedStep);

        stepId = view.selectedStep;
        selectNext = e && (e.ctrlKey || e.altKey);
      }

      var step = view.model.getStep(stepId);
      var stepIndex = view.model.getStepIndex(stepId);
      var label = info.connection.getOverlay('LABEL');

      label.setLabel((stepIndex + 1).toString());
      label.setVisible(true);

      if (stepId === view.selectedStep)
      {
        label.removeClass('trw-base-canvas-faded');
      }
      else
      {
        label.addClass('trw-base-canvas-faded');
      }

      step.source = info.sourceEndpoint.getParameters();
      step.target = info.targetEndpoint.getParameters();

      view.updateStep(stepId);

      if (selectNext)
      {
        var nextStep = view.model.attributes.steps[stepIndex + 1];

        if (nextStep)
        {
          this.selectStep(nextStep._id);
        }
        else
        {
          this.$id('steps-add').click();
        }
      }
    },

    onConnectionClicked: function(connection)
    {
      this.selectStep(connection.getParameter('step'));
    },

    loadBase: function()
    {
      var view = this;
      var baseId = view.$id('base').val();

      view.base = null;

      view.resetCanvas();

      if (!baseId.length)
      {
        return;
      }

      var req = view.ajax({
        url: '/trw/bases/' + baseId
      });

      req.fail(function()
      {
        viewport.msg.show({
          type: 'error',
          time: 10000,
          text: view.t('FORM:ERROR:baseLoadingFailure')
        });
      });

      req.done(function(base)
      {
        view.base = base;
        view.completeRendering();
      });
    },

    $cluster: function(id)
    {
      return this.$('.trw-base-cluster[data-id="' + id + '"]');
    },

    $cell: function(cluster, row, col)
    {
      return this.$cluster(cluster).find('.trw-base-cell[data-row="' + row + '"][data-col="' + col + '"]');
    },

    resetCanvas: function(unbind)
    {
      if (this.jsPlumb)
      {
        this.jsPlumb.reset(!unbind);
      }

      this.$id('canvas').empty();
    },

    renderCanvas: function()
    {
      var view = this;

      if (!view.base)
      {
        return;
      }

      var html = view.base.clusters.map(function(cluster)
      {
        return view.renderPartialHtml(clusterTemplate, {cluster: cluster});
      });

      view.$id('canvas').html(html);

      var endpoints = {};

      view.base.clusters.forEach(function(cluster)
      {
        cluster.rows.forEach(function(row, rowI)
        {
          row.forEach(function(cell, colI)
          {
            var cellEl = view.$cell(cluster._id, rowI, colI)[0];
            var cellId = cluster._id + ':' + rowI + ':' + colI;

            cell.endpoints.forEach(function(endpoint)
            {
              endpoints[1] = view.jsPlumb.addEndpoint(cellEl, {
                uuid: cellId + ':' + endpoint,
                anchor: ENDPOINT_TO_ANCHOR[endpoint],
                isSource: true,
                isTarget: true,
                allowLoopback: false,
                maxConnections: -1,
                endpoint: ['Dot', {
                  radius: 10
                }],
                cssClass: 'trw-base-canvas-endpoint',
                connector: 'Bezier',
                connectorClass: 'trw-base-canvas-connector',
                parameters: {
                  cluster: cluster._id,
                  row: rowI,
                  col: colI,
                  endpoint: endpoint
                }
              });
            });
          });
        });
      });
    },

    renderSteps: function()
    {
      var view = this;

      view.$('.trw-programs-step').remove();

      view.model.get('steps').forEach(function(step)
      {
        view.addStep(step, false);
      });
    },

    addStep: function(step, select)
    {
      var $steps = this.$id('steps');
      var stepNo = $steps[0].childElementCount;

      var $step = $('<div class="trw-programs-step"></div>')
        .attr('data-id', step._id)
        .text(this.formatDescription(stepNo, step));

      $steps.append($step);

      if (select)
      {
        $step.click();
      }
    },

    deleteStep: function(stepId)
    {
      if (this.model.attributes.steps.length === 1)
      {
        return;
      }

      var $step = this.$step(stepId);
      var isLast = $step.next().length === 0;

      this.model.attributes.steps.splice(this.findStepIndex($step[0]), 1);

      var next = $step[0].nextElementSibling || $step[0].previousElementSibling;

      $step.remove();

      next.click();

      if (!isLast)
      {
        this.recountSteps();
      }
    },

    recountSteps: function()
    {
      var view = this;

      view.$('.trw-programs-step').each(function(i)
      {
        this.textContent = this.textContent.replace(/^[0-9]+\./, (i + 1) + '.');
      });

      view.jsPlumb.getConnections().forEach(function(connection)
      {
        var stepIndex = view.model.getStepIndex(connection.getParameter('step'));

        connection.getOverlay('LABEL').setLabel((stepIndex + 1).toString());
      });
    },

    moveStepUp: function(stepId)
    {
      var steps = this.model.attributes.steps;

      if (steps.length === 1)
      {
        return;
      }

      var stepI = _.findIndex(steps, {_id: stepId});
      var $step = this.$step(stepId);
      var $steps = this.$id('steps');

      if (stepI === 0)
      {
        $steps.append($step);
        steps.push(steps.shift());
      }
      else
      {
        $step.insertBefore($step.prev());

        var prev = steps[stepI - 1];
        steps[stepI - 1] = steps[stepI];
        steps[stepI] = prev;
      }

      this.recountSteps();
    },

    moveStepDown: function(stepId)
    {
      var steps = this.model.attributes.steps;

      if (steps.length === 1)
      {
        return;
      }

      var stepI = _.findIndex(steps, {_id: stepId});
      var $step = this.$step(stepId);
      var $steps = this.$id('steps');

      if (stepI === steps.length - 1)
      {
        $step.insertAfter($steps[0].firstElementChild);
        steps.unshift(steps.pop());
      }
      else
      {
        $step.insertAfter($step.next());

        var next = steps[stepI + 1];
        steps[stepI + 1] = steps[stepI];
        steps[stepI] = next;
      }

      this.recountSteps();
    },

    findStepIndex: function(stepEl)
    {
      for (var i = 1; i < stepEl.parentNode.childElementCount; ++i)
      {
        if (stepEl.parentNode.children[i] === stepEl)
        {
          return i - 1;
        }
      }

      return -1;
    },

    findStepEl: function(stepI)
    {
      return this.$id('steps')[0].children[stepI + 1];
    },

    $step: function(id)
    {
      return this.$('.trw-programs-step[data-id="' + id + '"]');
    },

    selectStep: function(stepId)
    {
      var $activeStep = this.$id('steps').find('.trw-programs-step.active');

      if ($activeStep.length && $activeStep[0].dataset.id === stepId)
      {
        return;
      }

      $activeStep.removeClass('active');

      this.$step(stepId).addClass('active');

      var step = this.model.getStep(stepId);

      this.$('.trw-base-cell.active').removeClass('active');
      this.$cell(step.source.cluster, step.source.row, step.source.col).addClass('active');
      this.$cell(step.target.cluster, step.target.row, step.target.col).addClass('active');

      this.selectedStep = stepId;

      this.updateSelectedStep();
      this.updateConnections();
    },

    updateConnections: function()
    {
      var view = this;

      view.jsPlumb.deleteEveryConnection();

      view.model.attributes.steps.forEach(function(step)
      {
        if (!step.source.cluster || !step.target.cluster)
        {
          return;
        }

        var selected = step._id === view.selectedStep;
        var cssClass = ['trw-base-canvas-connector'];

        if (!selected)
        {
          cssClass.push('trw-base-canvas-faded');
        }

        view.jsPlumb.connect({
          uuids: [
            view.formatEndpointUuid(step.source),
            view.formatEndpointUuid(step.target)
          ],
          parameters: {step: step._id},
          detachable: selected,
          cssClass: cssClass.join(' ')
        });
      });
    },

    formatEndpointUuid: function(endpoint)
    {
      return [endpoint.cluster, endpoint.row, endpoint.col, endpoint.endpoint].join(':');
    },

    updateStep: function(stepId)
    {
      var step = this.model.getStep(stepId);
      var $step = this.$step(stepId);

      $step.text(this.formatDescription(this.model.getStepIndex(stepId) + 1, step));

      if (stepId === this.selectedStep)
      {
        this.updateSelectedStep();
      }
    },

    updateSelectedStep: function()
    {
      var step = this.model.getStep(this.selectedStep);

      this.$id('no').text(this.t('PROPERTY:steps.no', {no: this.model.getStepIndex(step._id) + 1}));
      this.updateProp('source', this.formatEndpoint(step.source));
      this.updateProp('target', this.formatEndpoint(step.target));
      this.updateProp('color', this.formatColor(step.color, '?'));
      this.updateProp('length', this.formatLength(step.length, '?'));
    },

    updateProp: function(prop, value)
    {
      this.$('.trw-testing-prop[data-prop="' + prop + '"]')
        .find('.trw-testing-prop-value')
        .text(value);
    },

    formatDescription: function(stepNo, step)
    {
      return this.t('form:steps:description', {
        no: stepNo,
        source: this.formatEndpoint(step.source),
        target: this.formatEndpoint(step.target),
        color: this.formatColor(step.color),
        length: this.formatLength(step.length)
      });
    },

    formatColor: function(color, defaultValue)
    {
      return Program.formatColor(color, defaultValue);
    },

    formatLength: function(length, defaultValue)
    {
      return Program.formatLength(length, defaultValue);
    },

    formatEndpoint: function(endpoint)
    {
      return Program.formatEndpoint(endpoint, this.base);
    },

    hideEditor: function()
    {
      var $editor = this.$id('editor');

      $editor.find('input').select2('destroy');
      $editor.remove();
    },

    showColorEditor: function()
    {
      var view = this;
      var step = view.model.getStep(view.selectedStep);

      view.hideEditor();

      var $value = view.$('.trw-testing-prop[data-prop="color"] > .trw-testing-prop-value');
      var $form = $('<form class="trw-programs-editor"></form>').attr('id', this.idPrefix + '-editor');
      var $input = $('<input>').val(step.color.join(','));

      $form.append($input);
      $form.append('<button class="btn btn-default"><i class="fa fa-check"></i></button>');

      $form.on('submit', function()
      {
        step.color = $input.select2('val');

        view.hideEditor();
        view.updateStep(step._id);

        return false;
      });

      var pos = $value.position();

      $form.css({
        top: pos.top + 'px',
        left: pos.left + 'px'
      });

      $form.appendTo('body');

      $input.select2({
        width: Math.max($value.outerWidth() - 40, 300) + 'px',
        multiple: true,
        allowClear: true,
        placeholder: ' ',
        data: Program.COLORS.map(function(color)
        {
          return {
            id: color,
            text: view.t('colors:' + color)
          };
        })
      });
    },

    showLengthEditor: function()
    {
      var view = this;
      var step = view.model.getStep(view.selectedStep);

      view.hideEditor();

      var $value = view.$('.trw-testing-prop[data-prop="length"] > .trw-testing-prop-value');
      var $form = $('<form class="trw-programs-editor"></form>').attr('id', this.idPrefix + '-editor');
      var $input = $('<input class="form-control">')
        .val(step.length.toString())
        .css({width: Math.max($value.outerWidth() - 40, 75)});

      $form.append($input);
      $form.append('<button class="btn btn-default"><i class="fa fa-check"></i></button>');

      $form.on('submit', function()
      {
        step.length = Math.max(0, parseInt($input.val(), 10) || 0);

        view.hideEditor();
        view.updateStep(step._id);

        return false;
      });

      var pos = $value.position();

      $form.css({
        top: pos.top + 'px',
        left: pos.left + 'px'
      });

      $form.appendTo('body');
    }

  });
});
