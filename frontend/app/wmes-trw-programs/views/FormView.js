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
  'app/wmes-trw-bases/templates/message',
  '../Program',
  './MessageEditFormView',
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
  messageTemplate,
  Program,
  MessageEditFormView,
  template
) {
  'use strict';

  function getRelativeCoordinates(e, el)
  {
    var offset = {
      left: el.offsetLeft,
      top: el.offsetTop
    };

    el = el.offsetParent;

    while (el)
    {
      offset.left += el.offsetLeft;
      offset.top += el.offsetTop;
      el = el.offsetParent;
    }

    return {
      x: e.pageX - offset.left,
      y: e.pageY - offset.top
    };
  }

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

        this.addStep(step).click();
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
      },
      'mouseenter .trw-base-cluster': function(e)
      {
        this.showClusterPopover(e.currentTarget.dataset.id);
      },
      'mouseleave .trw-base-cluster': function()
      {
        this.hideClusterPopover();
      },
      'mousedown #-canvas': function(e)
      {
        if (e.target.classList.contains('trw-base-canvas-inner'))
        {
          this.onMsgCreateStart(e);
        }
      },
      'mousedown .trw-base-message': function(e)
      {
        if (e.button === 0)
        {
          this.selectMsg(e);
        }
      },
      'dblclick .trw-base-message': function(e)
      {
        if (e.button === 0)
        {
          this.selectMsg(e);
          this.showEditMessageDialog();
        }
      },
      'contextmenu .trw-base-message': function(e)
      {
        this.selectMsg(e);
        this.showMsgMenu(e);

        return false;
      }

    }, FormView.prototype.events),

    onMsgCreateStart: function(e)
    {
      var view = this;

      view.cancelMsg();

      var msg = view.msg;
      var $canvas = view.$id('canvas');
      var startPos = getRelativeCoordinates(e.originalEvent, $canvas[0]);

      msg.startPos = startPos;
      msg.$canvas = $canvas;
      msg.$ghost = $('<div class="trw-programs-msg-ghost"></div>')
        .css({
          top: startPos.y + 'px',
          left: startPos.x + 'px',
          width: '0px',
          height: '0px'
        })
        .appendTo($canvas);

      $canvas
        .on('mousemove.msg' + view.idPrefix, view.onMsgCreateMove.bind(view));

      $(window)
        .on('mouseup.msg' + view.idPrefix, view.onMsgCreateEnd.bind(view));
    },

    onMsgCreateMove: function(e)
    {
      var view = this;
      var msg = view.msg;

      msg.endPos = getRelativeCoordinates(e.originalEvent, msg.$canvas[0]);

      var box = view.calcMsgBox(msg.startPos, msg.endPos);

      msg.$ghost.css({
        top: box.top + 'px',
        left: box.left + 'px',
        width: box.width + 'px',
        height: box.height + 'px'
      });
    },

    calcMsgBox: function(startPos, endPos)
    {
      var startX = Math.min(startPos.x, endPos.x);
      var startY = Math.min(startPos.y, endPos.y);
      var endX = Math.max(startPos.x, endPos.x);
      var endY = Math.max(startPos.y, endPos.y);

      return {
        top: startY,
        left: startX,
        width: endX - startX,
        height: endY - startY
      };
    },

    onMsgCreateEnd: function(e)
    {
      if (this.msg.endPos
        && this.$(e.target).closest(this.msg.$canvas[0]).length)
      {
        this.addMsg(this.msg.startPos, this.msg.endPos);
      }

      this.cancelMsg();
    },

    addMsg: function(startPos, endPos)
    {
      var msg = {
        _id: uuid(),
        steps: [this.model.getStepIndex(this.selectedStep) + 1],
        text: '',
        hAlign: 'center',
        vAlign: 'center',
        fontSize: 24,
        fontColor: '#FF0000',
        bgColor: null,
        borderColor: '#FF0000',
        borderWidth: 4
      };

      Object.assign(msg, this.calcMsgBox(startPos, endPos));

      if (msg.width < 10 || msg.height < 10)
      {
        return;
      }

      this.model.get('messages').push(msg);
      this.recountStepMessages();
      this.updateMessages();
      this.selectMsg(msg._id);
      this.showEditMessageDialog();
    },

    deleteMsg: function()
    {
      var msg = this.msg;

      if (!msg.selected)
      {
        return;
      }

      this.model.attributes.messages = this.model.attributes.messages.filter(function(message)
      {
        return message._id !== msg.selected.id;
      });

      var $el = msg.selected.$el;

      this.unselectMsg();

      $el.remove();

      this.recountStepMessages();
    },

    cancelMsg: function()
    {
      var msg = this.msg;

      if (!msg.startPos)
      {
        return;
      }

      $(window).off('.msg' + this.idPrefix);
      msg.$canvas.off('.msg' + this.idPrefix);
      msg.$ghost.remove();

      msg.$canvas = null;
      msg.$ghost = null;
      msg.startPos = null;
      msg.endPos = null;
    },

    selectMsg: function(e)
    {
      if (typeof e === 'string')
      {
        e = {currentTarget: this.$('.trw-base-message[data-id="' + e + '"]')[0]};
      }

      var view = this;

      view.unselectMsg();

      var msg = view.msg;
      var $canvas = view.$id('canvas');
      var $el = view.$(e.currentTarget).addClass('is-selected');
      var id = $el[0].dataset.id;
      var sel = msg.selected = {
        id: id,
        model: _.find(view.model.get('messages'), function(m) { return m._id === id; }),
        $canvas: $canvas,
        $el: $el,
        offset: null,
        startPos: {
          x: $el[0].offsetLeft,
          y: $el[0].offsetTop
        },
        endPos: {
          x: 0,
          y: 0
        },
        lastPos: null,
        resizing: false,
        dragging: false
      };

      var outer = $el[0];
      var inner = outer.firstElementChild;

      outer.style.top = outer.offsetTop + 'px';
      outer.style.left = outer.offsetLeft + 'px';
      outer.style.marginTop = '0';
      outer.style.marginLeft = '0';
      inner.style.width = inner.offsetWidth + 'px';
      inner.style.height = inner.offsetHeight + 'px';

      $el.removeClass('is-centered-top is-centered-left');

      if (e.button !== 0)
      {
        return;
      }

      sel.offset = {
        x: e.target.offsetWidth - e.offsetX,
        y: e.target.offsetHeight - e.offsetY
      };

      sel.lastPos = {
        x: e.pageX,
        y: e.pageY
      };

      if (e.target.classList.contains('trw-base-message-resize'))
      {
        sel.resizing = true;
        sel.endPos = getRelativeCoordinates(e.originalEvent, $canvas[0]);

        $canvas
          .addClass('trw-programs-resizing')
          .on('mousemove.msg' + view.idPrefix, view.onMsgResizeMove.bind(view));

        $(window)
          .on('mouseup.msg' + view.idPrefix, view.onMsgResizeEnd.bind(view));
      }
      else
      {
        sel.dragging = true;
        sel.endPos.x = sel.startPos.x;
        sel.endPos.y = sel.startPos.y;

        $canvas
          .addClass('trw-programs-dragging')
          .on('mousemove.msg' + view.idPrefix, view.onMsgDragMove.bind(view));

        $(window)
          .on('mouseup.msg' + view.idPrefix, view.onMsgDragEnd.bind(view));
      }
    },

    onMsgResizeMove: function(e)
    {
      var sel = this.msg.selected;

      sel.endPos = getRelativeCoordinates(e.originalEvent, sel.$canvas[0]);
      sel.endPos.x += sel.offset.x;
      sel.endPos.y += sel.offset.y;

      var box = this.calcMsgBox(sel.startPos, sel.endPos);
      var outer = sel.$el[0];
      var inner = outer.firstElementChild;

      outer.style.top = box.top + 'px';
      outer.style.left = box.left + 'px';
      inner.style.width = box.width + 'px';
      inner.style.height = box.height + 'px';
    },

    onMsgResizeEnd: function()
    {
      var sel = this.msg.selected;
      var box = this.calcMsgBox(sel.startPos, sel.endPos);

      Object.assign(sel.model, box);

      this.unselectMsg();
    },

    onMsgDragMove: function(e)
    {
      var sel = this.msg.selected;

      sel.endPos.x += e.pageX - sel.lastPos.x;
      sel.endPos.y += e.pageY - sel.lastPos.y;
      sel.lastPos.x = e.pageX;
      sel.lastPos.y = e.pageY;

      var outer = sel.$el[0];

      outer.style.top = sel.endPos.y + 'px';
      outer.style.left = sel.endPos.x + 'px';
    },

    onMsgDragEnd: function()
    {
      this.stopMsgDrag();

      var sel = this.msg.selected;

      if (sel.model.top === sel.endPos.y && sel.model.left === sel.endPos.x)
      {
        return;
      }

      sel.model.top = sel.endPos.y;
      sel.model.left = sel.endPos.x;

      this.unselectMsg();
    },

    stopMsgDrag: function()
    {
      var sel = this.msg.selected;

      if (!sel || !sel.dragging)
      {
        return;
      }

      sel.dragging = false;

      sel.$canvas.removeClass('trw-programs-dragging');

      $(window).off('.msg' + this.idPrefix);
      sel.$canvas.off('.msg' + this.idPrefix);
    },

    unselectMsg: function()
    {
      var sel = this.msg.selected;

      if (!sel)
      {
        return;
      }

      sel.$canvas.removeClass('trw-programs-resizing trw-programs-dragging');
      sel.$canvas.find('.trw-base-message.is-selected').removeClass('is-selected');

      $(window).off('.msg' + this.idPrefix);
      sel.$canvas.off('.msg' + this.idPrefix);

      sel.model = null;
      sel.$canvas = null;
      sel.$el = null;
      this.msg.selected = null;
    },

    showMsgMenu: function(e)
    {
      var options = {
        menu: [
          {
            label: this.t('form:messages:menu:edit'),
            handler: this.showEditMessageDialog.bind(this)
          },
          {
            label: this.t('form:messages:menu:delete'),
            handler: this.deleteMsg.bind(this)
          }
        ]
      };

      contextMenu.show(this, e.pageY, e.pageX, options);
    },

    showEditMessageDialog: function()
    {
      var message = new Model(this.msg.selected.model);
      var dialogView = new MessageEditFormView({
        model: message
      });

      this.listenTo(message, 'change', function()
      {
        Object.assign(this.model.getMessage(message.id), message.attributes);
        this.recountStepMessages();
        this.updateMessages();
      });

      viewport.showDialog(dialogView, this.t('form:messages:title'));
    },

    initialize: function()
    {
      FormView.prototype.initialize.apply(this, arguments);

      this.jsPlumb = null;
      this.base = null;
      this.selectedStep = null;
      this.msg = {
        startPos: null,
        endPos: null,
        $canvas: null,
        $ghost: null
      };

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
        this.cancelMsg();
        this.unselectMsg();
        this.hideEditor();
      }
      else if (e.key === 'Delete')
      {
        this.deleteMsg();
      }
    },

    setUpJsPlumb: function()
    {
      var view = this;

      view.jsPlumb = jsPlumb.getInstance({
        Container: this.$id('canvas')[0],
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

        if (!(el instanceof jsPlumb.Connection))
        {
          return;
        }

        view.showConnectionMenu(e, el.getParameters());
      });
    },

    showConnectionMenu: function(e, params) // eslint-disable-line no-unused-vars
    {
      // TODO
      return;

      /*
      var options = {
        menu: [
          {
            label: this.t('form:connectorEdit:menuItem'),
            handler: this.showConnectorEditDialog.bind(this, params)
          }
        ]
      };

      contextMenu.show(this, e.pageY, e.pageX, options);
      */
    },

    showConnectorEditDialog: function(params)
    {
      console.log(params);
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
      this.cancelMsg();
      this.unselectMsg();

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

      var html = [];

      view.base.clusters.forEach(function(cluster)
      {
        html.push(view.renderPartialHtml(clusterTemplate, {cluster: cluster}));
      });

      view.$id('canvas').html(html.join(''));

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
              view.jsPlumb.addEndpoint(cellEl, {
                uuid: cellId + ':' + endpoint,
                anchor: Program.ENDPOINT_TO_ANCHOR[endpoint],
                isSource: true,
                isTarget: true,
                allowLoopback: false,
                maxConnections: -1,
                endpoint: ['Dot', {
                  radius: 10
                }],
                cssClass: 'trw-base-canvas-endpoint',
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

    renderMessage: function(message)
    {
      return this.renderPartialHtml(messageTemplate, Program.formatMessage(message, true));
    },

    renderSteps: function()
    {
      var view = this;

      view.$id('steps').html('');

      view.model.get('steps').forEach(function(step)
      {
        view.addStep(step);
      });
    },

    stepHasAnyMessage: function(stepNo)
    {
      return _.any(this.model.get('messages'), function(message)
      {
        return message.steps.indexOf(stepNo) !== -1;
      });
    },

    addStep: function(step)
    {
      var $steps = this.$id('steps');
      var stepNo = $steps[0].childElementCount + 1;

      var $step = $('<div class="trw-programs-step"></div>')
        .attr('data-id', step._id);
      var $label = $('<span class="trw-programs-step-label">' + this.formatDescription(stepNo, step) + '</span>');
      var $messages = $('<i class="fa fa-comments-o trw-programs-step-messages"></i>')
        .toggleClass('hidden', !this.stepHasAnyMessage(stepNo));

      $step
        .append($label)
        .append($messages)
        .appendTo($steps);

      return $step;
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
        this.firstElementChild.textContent = this.firstElementChild.textContent.replace(/^[0-9]+\./, (i + 1) + '.');
        this.querySelector('.trw-programs-step-messages').classList.toggle('hidden', !view.stepHasAnyMessage(i + 1));
      });

      view.jsPlumb.getConnections().forEach(function(connection)
      {
        var stepIndex = view.model.getStepIndex(connection.getParameter('step'));

        connection.getOverlay('LABEL').setLabel((stepIndex + 1).toString());
      });
    },

    recountStepMessages: function()
    {
      var view = this;

      view.$('.trw-programs-step').each(function(i)
      {
        this.querySelector('.trw-programs-step-messages').classList.toggle('hidden', !view.stepHasAnyMessage(i + 1));
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
      this.updateMessages();
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
      this.updateMessages();
    },

    findStepIndex: function(stepEl)
    {
      for (var i = 0; i < stepEl.parentNode.childElementCount; ++i)
      {
        if (stepEl.parentNode.children[i] === stepEl)
        {
          return i;
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
      this.updateMessages();
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
            Program.formatEndpointUuid(step.source),
            Program.formatEndpointUuid(step.target)
          ],
          parameters: {step: step._id},
          detachable: selected,
          cssClass: cssClass.join(' '),
          connector: step.connector
        });
      });
    },

    updateStep: function(stepId)
    {
      var step = this.model.getStep(stepId);
      var $step = this.$step(stepId);

      $step.find('.trw-programs-step-label').text(
        this.formatDescription(this.model.getStepIndex(stepId) + 1, step)
      );

      if (stepId === this.selectedStep)
      {
        this.updateSelectedStep();
      }
    },

    updateMessages: function()
    {
      var view = this;
      var stepIndex = view.model.getStepIndex(view.selectedStep);
      var stepNo = stepIndex + 1;
      var html = [];

      view.model.get('messages').forEach(function(message)
      {
        if (message.steps.indexOf(stepNo) !== -1)
        {
          html.push(view.renderMessage(message));
        }
      });

      var $canvas = view.$id('canvas');

      $canvas.find('.trw-base-message').remove();
      $canvas.append(html.join(''));
      $canvas.find('.trw-base-message').each(function()
      {
        var box = this.getBoundingClientRect();

        if (this.classList.contains('is-centered-top'))
        {
          this.style.top = '50%';
          this.style.marginTop = Math.round((box.height / 2) * -1) + 'px';
        }

        if (this.classList.contains('is-centered-left'))
        {
          this.style.left = '50%';
          this.style.marginLeft = Math.round((box.width / 2) * -1) + 'px';
        }
      });
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

      $input.select2('focus');
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

      $input.focus();
    },

    showClusterPopover: function(clusterId)
    {
      var view = this;

      view.hideClusterPopover();

      var cluster = view.model.getCluster(clusterId);

      if (!cluster || !cluster.image)
      {
        return;
      }

      var image = new Image();

      image.src = cluster.image;

      view.$clusterPopover = view.$cluster(clusterId).popover({
        container: document.body,
        placement: 'top',
        trigger: 'manual',
        html: true,
        content: function()
        {
          return '<img src="' + cluster.image + '"'
            + ' width="' + image.naturalWidth + '"'
            + ' height="' + image.naturalHeight + '">';
        },
        template: function(template)
        {
          return $(template).addClass('trw-base-cluster-popover');
        }
      });

      view.timers.showClusterPopover = setTimeout(function()
      {
        if (view.$clusterPopover && view.$clusterPopover[0].dataset.id === clusterId)
        {
          view.$clusterPopover.popover('show');
        }
      }, 333);
    },

    hideClusterPopover: function(clusterId)
    {
      clearTimeout(this.timers.showClusterPopover);

      if (!this.$clusterPopover)
      {
        return;
      }

      if (clusterId && this.$clusterPopover[0].dataset.id !== clusterId)
      {
        return;
      }

      this.$clusterPopover.popover('destroy');
      this.$clusterPopover = null;
    }

  });
});
