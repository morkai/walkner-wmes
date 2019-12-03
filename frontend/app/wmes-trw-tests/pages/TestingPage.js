// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'jsplumb',
  'app/i18n',
  'app/viewport',
  'app/data/localStorage',
  'app/core/Model',
  'app/core/View',
  'app/core/util/embedded',
  'app/core/util/uuid',
  'app/production/views/VkbView',
  'app/planning/util/contextMenu',
  'app/wmes-trw-testers/Tester',
  'app/wmes-trw-bases/Base',
  'app/wmes-trw-bases/templates/cluster',
  'app/wmes-trw-programs/Program',
  '../Test',
  '../views/WorkstationPickerDialogView',
  '../views/OrderPickerDialogView',
  '../views/BasePickerDialogView',
  '../views/ProgramPickerDialogView',
  'app/wmes-trw-tests/templates/testing',
  'app/wmes-trw-tests/templates/debug'
], function(
  _,
  $,
  jsPlumb,
  t,
  viewport,
  localStorage,
  Model,
  View,
  embedded,
  uuid,
  VkbView,
  contextMenu,
  Tester,
  Base,
  clusterTemplate,
  Program,
  Test,
  WorkstationPickerDialogView,
  OrderPickerDialogView,
  BasePickerDialogView,
  ProgramPickerDialogView,
  template,
  debugTemplate
) {
  'use strict';

  var CHECK_INTERVAL = 150;

  return View.extend({

    layoutName: 'blank',

    template: template,

    pageId: 'trw-testing',

    events: {

      'click [data-prop="workstation"]': function(e)
      {
        if (e.currentTarget.classList.contains('is-unclickable'))
        {
          return;
        }

        this.showWorkstationPickerDialog();
      },
      'click [data-prop="order"]': function()
      {
        if (this.model.get('line'))
        {
          this.showOrderPickerDialog();
        }
        else
        {
          this.showWorkstationPickerDialog();
        }
      },
      'click [data-prop="program"]': function()
      {
        if (this.model.base.get('name'))
        {
          this.showProgramPickerDialog();
        }
        else
        {
          this.showBasePickerDialog();
        }
      },
      'click #-menu': function()
      {
        contextMenu.show(this, 60, window.innerWidth - 60, {
          className: 'trw-testing-menu',
          menu: [
            {
              label: this.t('testing:menu:workstation'),
              handler: this.showWorkstationPickerDialog.bind(this)
            },
            {
              label: this.t('testing:menu:base'),
              handler: this.showBasePickerDialog.bind(this)
            },
            {
              label: this.t('testing:menu:debug:' + this.model.get('debug')),
              handler: this.toggleDebugMode.bind(this)
            }
          ]
        });
      },
      'click .trw-testing-ft': function()
      {
        var state = this.model.get('state');

        if (state === 'error' || /^test/.test(state))
        {
          this.startTest();
        }
      },
      'mouseenter .trw-base-cell': function(e)
      {
        var page = this;

        if (!page.model.get('debug'))
        {
          return;
        }

        var endpointIo = page.model.get('endpointIo') || {};
        var endpoints = endpointIo[e.currentTarget.id.replace('TRW:', '')];

        if (!endpoints)
        {
          return;
        }

        var $debug = page.$id('debug');

        endpoints.inputs.concat(endpoints.outputs).forEach(function(io)
        {
          page.debug.highlightedRows[io._id] = true;

          $debug.find('.trw-testing-debug-row[data-id="' + io._id + '"]').addClass('is-highlighted');
        });
      },
      'mouseleave .trw-base-cell': function()
      {
        if (!this.model.get('debug'))
        {
          return;
        }

        this.debug.highlightedRows = {};

        this.$id('debug').find('.is-highlighted').removeClass('is-highlighted');
      },
      'mouseenter .trw-testing-debug-row': function(e)
      {
        var page = this;
        var cellIo = page.model.get('cellIo') || {};
        var ioId = e.currentTarget.dataset.id;
        var cells = cellIo[ioId];

        if (!cells || !cells.length)
        {
          return;
        }

        cells.forEach(function(cellId)
        {
          page.debug.highlightedCells[cellId] = true;

          document.getElementById('TRW:' + cellId).classList.add('is-highlighted');
        });
      },
      'mouseleave .trw-testing-debug-row': function()
      {
        if (!this.model.get('debug'))
        {
          return;
        }

        this.debug.highlightedCells = {};

        this.$id('preview').find('.is-highlighted').removeClass('is-highlighted');
      },
      'mouseenter .trw-base-cluster': function(e)
      {
        var page = this;

        clearTimeout(page.timers.showImage);
        page.timers.showImage = setTimeout(function()
        {
          var cluster = page.model.program.getCluster(e.currentTarget.dataset.id);

          if (cluster)
          {
            page.$id('image').prop('src', cluster.image);
          }
        }, 666);
      },
      'mouseleave .trw-base-cluster': function()
      {
        clearTimeout(this.timers.showImage);
        this.$id('image').prop('src', '');
      }

    },

    localTopics: {
      'socket.connected': function()
      {
        this.loadModels();
      }
    },

    remoteTopics: {
      'trw.testers.edited': function(message)
      {
        if (message.model._id === this.model.tester.id)
        {
          this.model.tester.set(message.model);
        }
      },
      'trw.testers.deleted': function(message)
      {
        if (message.model._id === this.model.tester.id)
        {
          this.model.base.clear();
          this.model.tester.clear();
        }
      },
      'trw.bases.edited': function(message)
      {
        if (message.model._id === this.model.base.id)
        {
          this.model.base.set(message.model);
        }
      },
      'trw.bases.deleted': function(message)
      {
        if (message.model._id === this.model.base.id)
        {
          this.model.base.clear();
        }
      },
      'trw.programs.edited': function(message)
      {
        var newProgram = Object.assign({}, message.model);
        var oldProgram = this.model.program;

        if (newProgram._id !== oldProgram.id)
        {
          return;
        }

        if (newProgram.base === this.model.base.id)
        {
          newProgram.base = this.model.base.toJSON();

          oldProgram.set(newProgram);
        }
        else
        {
          oldProgram.clear();
        }
      },
      'trw.programs.deleted': function(message)
      {
        if (message.model._id === this.model.program.id)
        {
          this.model.program.clear();
        }
      }
    },

    initialize: function()
    {
      var page = this;
      var model = page.model = Object.assign(new Model({
        debug: false,
        ready: false,
        state: 'unknown',
        error: null,
        step: 1,
        test: null,
        line: localStorage.getItem('TRW:LINE') || '',
        workstation: parseInt(localStorage.getItem('TRW:WORKSTATION'), 10) || 0,
        order: sessionStorage.getItem('TRW:ORDER') || '',
        qtyTodo: parseInt(sessionStorage.getItem('TRW:QTY_TODO'), 10) || 0,
        qtyDone: -1
      }), {
        nlsDomain: 'wmes-trw-tests',
        tester: new Tester({_id: localStorage.getItem('TRW:TESTER') || null}),
        base: new Base({_id: localStorage.getItem('TRW:BASE') || null}),
        program: new Program({_id: sessionStorage.getItem('TRW:PROGRAM') || null}),
        test: new Test()
      });
      page.jsPlumb = null;
      page.debug = {
        lastValues: {},
        highlightedRows: {},
        highlightedCells: {}
      };

      page.vkbView = new VkbView();

      page.listenTo(model, 'change:debug', page.updateDebugInfo);
      page.listenTo(model, 'change:state', page.updateState);
      page.listenTo(model, 'change:step', page.updateMessage);
      page.listenTo(model, 'change:qtyTodo change:qtyDone', page.updateOrder);
      page.listenTo(model, 'change:order', page.onOrderChange);
      page.listenTo(model, 'change:line change:workstation', page.onLineChange);
      page.listenTo(model.tester, 'error', page.onTesterError);
      page.listenTo(model.tester, 'change', page.onTesterChange);
      page.listenTo(model.base, 'error', page.onBaseError);
      page.listenTo(model.base, 'change', page.onBaseChange);
      page.listenTo(model.program, 'error', page.onProgramError);
      page.listenTo(model.program, 'change', page.onProgramChange);

      page.setView('#-vkb', page.vkbView);

      $(window).on('resize.' + page.idPrefix, page.resizePreview.bind(page));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      document.body.classList.remove('trw-testing-page');
      $('.modal.fade').addClass('fade');

      if (this.jsPlumb)
      {
        this.jsPlumb.reset();
        this.jsPlumb = null;
      }
    },

    beforeRender: function()
    {
      document.body.classList.add('trw-testing-page');
    },

    afterRender: function()
    {
      $('.modal.fade').removeClass('fade');

      embedded.render(this);

      this.resizePreview();
      this.updateWorkstation();
      this.updateOrder();
      this.updateProgramName();
      this.updateMessage();
      this.loadModels();

      if (window.IS_EMBEDDED)
      {
        window.parent.postMessage({type: 'ready', app: 'trw'}, '*');

        this.scheduleAction(function()
        {
          this.model.set('ready', true);
          this.startTest();
        }, 3333);
      }
      else
      {
        this.model.set('ready', true);
        this.startTest();
      }

      if (this.model.get('debug'))
      {
        this.model.set('debug', false, {silent: true});
        this.model.toggleDebugMode();
      }
    },

    resizePreview: function()
    {
      var height = window.innerHeight
        - this.$('.trw-testing-hd').outerHeight()
        - this.$('.trw-testing-ft').outerHeight();

      this.$id('preview').css('height', height + 'px');
    },

    loadModels: function()
    {
      var page = this;

      if (!page.model.tester.id || !page.model.base.id)
      {
        page.model.program.clear();
        page.model.base.clear();
        page.model.tester.clear();

        return;
      }

      var programId = page.model.program.id;
      var req = page.model.base.fetch();

      req.fail(function()
      {
        if (req.status === 404)
        {
          page.model.base.clear();
          page.model.tester.clear();
        }
      });

      req.done(function(base)
      {
        page.model.tester.set(base.tester);
        page.model.base.set(base);

        if (!programId)
        {
          return;
        }

        page.model.program.set({_id: programId});

        req = page.model.program.fetch();

        req.fail(function()
        {
          if (req.status === 404)
          {
            page.model.program.clear();
          }
        });

        req.done(function()
        {
          var programBase = page.model.program.get('base');

          if (!programBase || programBase._id !== page.model.base.id)
          {
            page.model.program.clear();
          }
        });
      });
    },

    updateWorkstation: function()
    {
      var value;
      var line = this.model.get('line');
      var workstation = this.model.get('workstation');
      var clickable = false;

      if (line && workstation)
      {
        value = _.escape(line) + ' • ' + workstation;
      }
      else
      {
        value = this.t('testing:noWorkstation');
        clickable = true;
      }

      this.$prop('workstation', value).toggleClass('is-unclickable', !clickable);
    },

    updateOrder: function()
    {
      var value = this.model.get('order');
      var qtyTodo = this.model.get('qtyTodo');
      var qtyDone = this.model.get('qtyDone');
      var line = this.model.get('line');

      if (!line)
      {
        value = this.t('testing:noWorkstation');
      }
      else if (!value)
      {
        value = this.t('testing:noOrder');
      }
      else if (value === '000000000')
      {
        value = this.t('testing:woOrder');
      }
      else if (qtyTodo)
      {
        value += ' • ' + (qtyDone >= 0 ? qtyDone : '?') + '/' + qtyTodo;
      }

      this.$prop('order', value);
    },

    updateProgramName: function()
    {
      var value = this.model.program.get('name');

      if (!this.model.base.get('name'))
      {
        value = this.t('testing:noBase');
      }
      else if (!value)
      {
        value = this.t('testing:noProgram');
      }

      this.$prop('program', value);
    },

    updateProgramPreview: function()
    {
      var $canvas = this.$id('canvas');

      if (this.jsPlumb)
      {
        this.jsPlumb.reset(true);
      }

      $canvas.empty();

      var program = this.model.program;
      var base = this.model.base;

      if (!program.get('name') || !base.get('name'))
      {
        return;
      }

      this.setUpJsPlumb();
      this.renderCanvas();
    },

    setUpJsPlumb: function()
    {
      if (this.jsPlumb)
      {
        return;
      }

      this.jsPlumb = jsPlumb.getInstance({
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

      this.jsPlumb.bind('beforeDrag', function()
      {
        return false;
      });
    },

    renderCanvas: function()
    {
      var page = this;
      var clusters = page.model.base.get('clusters');
      var html = clusters.map(function(cluster)
      {
        return page.renderPartialHtml(clusterTemplate, {cluster: cluster});
      });

      page.$id('canvas').html(html);

      clusters.forEach(function(cluster)
      {
        cluster.rows.forEach(function(row, rowI)
        {
          row.forEach(function(cell, colI)
          {
            var $cluster = page.$('.trw-base-cluster[data-id="' + cluster._id + '"]');
            var $cell = $cluster.find('.trw-base-cell[data-row="' + rowI + '"][data-col="' + colI + '"]');
            var cellEl = $cell[0];
            var cellId = cluster._id + ':' + rowI + ':' + colI;

            cell.endpoints.forEach(function(endpoint)
            {
              page.jsPlumb.addEndpoint(cellEl, {
                uuid: cellId + ':' + endpoint,
                anchor: Program.ENDPOINT_TO_ANCHOR[endpoint],
                isSource: false,
                isTarget: false,
                allowLoopback: false,
                maxConnections: -1,
                endpoint: ['Dot', {radius: 10}],
                cssClass: 'trw-base-canvas-endpoint',
                connector: 'Bezier',
                connectorClass: 'trw-base-canvas-connector'
              });
            });
          });
        });
      });
    },

    updateState: function()
    {
      this.el.dataset.state = this.model.get('state');

      this.updateMessage();
    },

    updateMessage: function()
    {
      var state = this.model.get('state');
      var html = state + '?';

      if (t.has(this.model.nlsDomain, 'state:' + state))
      {
        html = this.t('state:' + state);
      }
      else if (state === 'test')
      {
        var program = this.model.test.get('program');
        var step = this.model.get('step');
        var programStep = program.steps[step - 1];

        if (programStep)
        {
          this.updateStepMessage();

          html = '';
        }
      }
      else if (state === 'error')
      {
        html = this.model.get('error');
      }

      this.$id('message').html(html);
    },

    updateStepMessage: function()
    {
      var program = this.model.test.get('program');
      var stepNo = this.model.get('step');
      var step = program.steps[stepNo - 1];

      this.$id('step').text(this.t('state:step', {no: stepNo}));
      this.updateStepProp('source', Program.formatEndpoint(step.source, program.base));
      this.updateStepProp('target', Program.formatEndpoint(step.target, program.base));
      this.updateStepProp('color', Program.formatColor(step.color, '?'));
      this.updateStepProp('length', Program.formatLength(step.length, '?'));
    },

    updateStepProp: function(prop, value)
    {
      this.$('.trw-testing-prop[data-prop="' + prop + '"]')
        .find('.trw-testing-prop-value')
        .text(value);
    },

    showWorkstationPickerDialog: function()
    {
      var dialogView = new WorkstationPickerDialogView({
        model: this.model,
        vkb: this.vkbView
      });

      this.listenTo(dialogView, 'picked', function(data)
      {
        this.model.set({
          line: data.line,
          workstation: data.workstation
        });

        viewport.closeDialog();
      });

      viewport.showDialog(dialogView, this.t('workstationPicker:title'));
    },

    showOrderPickerDialog: function()
    {
      var dialogView = new OrderPickerDialogView({
        model: this.model,
        vkb: this.vkbView
      });

      this.listenTo(dialogView, 'picked', function(data)
      {
        this.model.set({
          order: data.order,
          qtyTodo: data.qtyTodo
        });

        viewport.closeDialog();
      });

      viewport.showDialog(dialogView, this.t('orderPicker:title'));
    },

    showBasePickerDialog: function()
    {
      var dialogView = new BasePickerDialogView({
        model: this.model,
        vkb: this.vkbView
      });

      this.listenTo(dialogView, 'picked', function(data)
      {
        this.model.tester.set(data.base.tester);
        this.model.base.set(data.base);

        viewport.closeDialog();
      });

      viewport.showDialog(dialogView, this.t('basePicker:title'));
    },

    showProgramPickerDialog: function()
    {
      var dialogView = new ProgramPickerDialogView({
        model: this.model,
        vkb: this.vkbView
      });

      this.listenTo(dialogView, 'picked', function(data)
      {
        this.model.program.set(data.program);

        viewport.closeDialog();
      });

      viewport.showDialog(dialogView, this.t('programPicker:title'));
    },

    $prop: function(name, value)
    {
      var $prop = this.$('.trw-testing-prop[data-prop="' + name + '"]');

      if (arguments.length === 2)
      {
        $prop.find('.trw-testing-prop-value').html(value);
      }

      return $prop;
    },

    onTesterError: function()
    {
      this.model.base.clear();
      this.model.tester.clear();
    },

    onTesterChange: function()
    {
      if (this.model.tester.id)
      {
        localStorage.setItem('TRW:TESTER', this.model.tester.id);
      }
      else
      {
        localStorage.removeItem('TRW:TESTER');
      }

      this.model.base.clear();
      this.model.program.clear();

      this.updateProgramName();
      this.updateMessage();
      this.startTest();
    },

    onBaseError: function()
    {
      this.model.base.clear();
    },

    onBaseChange: function()
    {
      if (this.model.base.id)
      {
        localStorage.setItem('TRW:BASE', this.model.base.id);
      }
      else
      {
        localStorage.removeItem('TRW:BASE');
      }

      if (this.model.program.id)
      {
        this.model.program.clear();
      }
      else
      {
        this.updateProgramName();
        this.updateProgramPreview();
      }

      this.updateMessage();
      this.startTest();
    },

    onProgramError: function()
    {
      this.model.program.clear();
    },

    onProgramChange: function()
    {
      if (this.model.program.id)
      {
        sessionStorage.setItem('TRW:PROGRAM', this.model.program.id);
      }
      else
      {
        sessionStorage.removeItem('TRW:PROGRAM');
      }

      this.updateProgramName();
      this.updateProgramPreview();
      this.loadCounter();
      this.startTest();
    },

    onOrderChange: function()
    {
      if (this.model.get('line'))
      {
        sessionStorage.setItem('TRW:ORDER', this.model.get('order'));
        sessionStorage.setItem('TRW:QTY_TODO', this.model.get('qtyTodo'));
      }
      else
      {
        sessionStorage.removeItem('TRW:ORDER');
        sessionStorage.removeItem('TRW:QTY_TODO');
      }

      this.model.program.clear();

      this.loadCounter();
      this.updateOrder();
      this.startTest();
    },

    onLineChange: function()
    {
      if (this.model.get('line'))
      {
        localStorage.setItem('TRW:LINE', this.model.get('line'));
        localStorage.setItem('TRW:WORKSTATION', this.model.get('workstation'));
      }
      else
      {
        localStorage.removeItem('TRW:LINE');
        localStorage.removeItem('TRW:WORKSTATION');
      }

      this.updateWorkstation();
      this.updateOrder();
      this.startTest();
    },

    loadCounter: function()
    {
      var page = this;

      if (page.counterSub)
      {
        page.counterSub.cancel();
        page.counterSub = null;
      }

      if (page.counterReq)
      {
        page.counterReq.abort();
        page.counterReq = null;
      }

      var order = page.model.get('order');
      var program = page.model.program.id;

      page.model.set('qtyDone', 0);

      if (order === '000000000')
      {
        order = '';
      }

      if (!order || !program)
      {
        return;
      }

      page.counterSub = page.pubsub.subscribe('trw.counters.updated.' + order + '.' + program, function(message)
      {
        page.model.set('qtyDone', message.count);
      });

      var req = page.counterReq = page.ajax({
        url: '/trw/counters?limit(1)&populate(order,(qty))&order=' + order + '&program=' + program
      });

      page.counterReq.done(function(res)
      {
        if (res.totalCount === 1)
        {
          var counter = res.collection[0];

          page.model.set({
            qtyTodo: counter.order ? counter.order.qty : 0,
            qtyDone: counter.count
          });
        }
      });

      page.counterReq.always(function()
      {
        if (page.counterReq === req)
        {
          page.counterReq = null;
        }
      });
    },

    scheduleAction: function(action, delay)
    {
      var page = this;
      var test = page.model.get('test');

      if (page.timers.nextAction)
      {
        clearTimeout(page.timers.nextAction);
        page.timers.nextAction = null;
      }

      page.timers.nextAction = setTimeout(function()
      {
        if (page.model.get('test') === test)
        {
          action.call(page);
        }
      }, delay || 1);
    },

    startTest: function()
    {
      if (!this.model.get('ready'))
      {
        return this.model.set({
          state: 'not-ready'
        });
      }

      if (this.timers.nextAction)
      {
        clearTimeout(this.timers.nextAction);
        this.timers.nextAction = null;
      }

      if (!this.model.get('line'))
      {
        return this.model.set({
          state: 'no-line'
        });
      }

      if (!this.model.base.get('name'))
      {
        return this.model.set({
          state: 'no-base'
        });
      }

      if (!this.model.get('order'))
      {
        return this.model.set({
          state: 'no-order'
        });
      }

      if (!this.model.program.get('name'))
      {
        return this.model.set({
          state: 'no-program'
        });
      }

      this.scheduleAction(this.runTest);
    },

    runTest: function()
    {
      var program = this.model.program.toJSON();

      program.base = this.model.base.toJSON();
      program.base.tester = this.model.tester.toJSON();

      if (this.model.get('debug'))
      {
        console.log('runTest', {program: program});
      }

      var allIo = {};

      program.base.tester.io.forEach(function(io)
      {
        allIo[io._id] = io;
      });

      var endpointIo = {};
      var cellIo = {};
      var missingIo = [];

      program.base.clusters.forEach(function(cluster)
      {
        cluster.rows.forEach(function(row, rowI)
        {
          row.forEach(function(cell, colI)
          {
            var inputs = [];
            var outputs = [];
            var cellId = cluster._id + ':' + rowI + ':' + colI;

            cell.io.forEach(function(ioId)
            {
              var io = allIo[ioId];

              if (!io)
              {
                missingIo.push(ioId);

                return;
              }

              if (io.type === 'output')
              {
                outputs.push(io);
              }
              else
              {
                inputs.push(io);
              }

              if (!cellIo[ioId])
              {
                cellIo[ioId] = [];
              }

              cellIo[ioId].push(cellId);
            });

            endpointIo[cellId] = {
              inputs: inputs,
              outputs: outputs
            };
          });
        });
      });

      if (missingIo.length)
      {
        return this.error('missingIo', {io: missingIo.join(', ')});
      }

      this.model.test.clear();
      this.model.test.set({
        startedAt: new Date(),
        finishedAt: null,
        line: this.model.get('line'),
        workstation: this.model.get('workstation'),
        order: this.model.get('order'),
        pce: -1,
        program: program
      });
      this.model.set({
        state: 'test',
        pass: 1,
        step: 1,
        error: null,
        test: uuid(),
        endpointIo: endpointIo,
        cellIo: cellIo,
        allIo: allIo,
        setIo: {},
        checkIo: {}
      });
      this.updateMessage();

      if (this.model.get('debug'))
      {
        console.log({endpointIo: endpointIo, allIo: allIo});
      }

      this.setIo(true, this.runStep);
    },

    error: function(message, data)
    {
      this.model.set({
        state: 'error',
        error: this.t('testing:error:' + message, data || {})
      });

      return this.scheduleAction(this.startTest, 10000);
    },

    runStep: function()
    {
      var program = this.model.test.get('program');
      var stepNo = this.model.get('step');
      var step = program.steps[stepNo - 1];
      var endpointIo = this.model.get('endpointIo');
      var setIo = {};
      var checkIo = {};
      var missingEndpoints = [];

      if (this.model.get('debug'))
      {
        console.log('runStep', {stepNo: stepNo, step: step});
      }

      if (step.source.cluster)
      {
        var sourceId = step.source.cluster + ':' + step.source.row + ':' + step.source.col;
        var sourceEndpoint = endpointIo[sourceId];

        if (sourceEndpoint)
        {
          sourceEndpoint.outputs.forEach(function(io)
          {
            setIo[io._id] = io;
          });
        }
        else
        {
          missingEndpoints.push(sourceId);
        }
      }

      if (step.target.cluster)
      {
        var targetId = step.target.cluster + ':' + step.target.row + ':' + step.target.col;
        var targetEndpoint = endpointIo[targetId];

        if (targetEndpoint)
        {
          targetEndpoint.inputs.forEach(function(io)
          {
            checkIo[io._id] = io;
          });
        }
        else
        {
          missingEndpoints.push(targetId);
        }
      }

      if (missingEndpoints.length)
      {
        return this.error('missingEndpoints', {endpoints: missingEndpoints.join(', ')});
      }

      this.model.set({
        setIo: setIo,
        checkIo: checkIo,
        lastValidCheckAt: 0
      });

      if (this.model.get('debug'))
      {
        console.log({setIo: setIo, checkIo: checkIo});
      }

      if (this.model.get('state') === 'test')
      {
        this.updateConnections();
      }

      this.setIo(false, this.checkIo, CHECK_INTERVAL);
    },

    setIo: function(reset, nextAction, delay)
    {
      var page = this;
      var outputs = [];
      var allIo = page.model.get('allIo');
      var setIo = page.model.get('setIo');
      var on = 0;
      var off = 8000;

      // TODO remove
      if (page.model.get('line').includes('LM-42'))
      {
        on = 8000;
        off = 0;
      }

      _.forEach(allIo, function(io)
      {
        if (io.type !== 'output')
        {
          return;
        }

        outputs.push({
          device: io.device,
          channel: io.channel,
          value: !reset && setIo[io._id] ? on : off
        });
      });

      if (page.model.get('debug'))
      {
        console.log('setIo', {outputs: outputs});
      }

      page.runCommand('setIo', {outputs: outputs}, function(err)
      {
        if (err)
        {
          return page.error('setIo', {error: err.message});
        }

        page.scheduleAction(nextAction, delay);
      });
    },

    checkIo: function()
    {
      var page = this;
      var inputs = [];
      var checkIo = page.model.get('checkIo');

      _.forEach(checkIo, function(io)
      {
        if (io.type === 'output')
        {
          return;
        }

        inputs.push({
          device: io.device,
          channel: io.channel
        });
      });

      if (page.model.get('debug'))
      {
        console.log('checkIo', {inputs: inputs});
      }

      page.runCommand('getIo', {inputs: inputs}, function(err, res)
      {
        if (err)
        {
          return page.error('getIo', {error: err.message});
        }

        var ok = [];
        var nok = [];
        var testing = page.model.get('state') === 'test';
        var anyAnalog = false;

        _.forEach(checkIo, function(io)
        {
          var value = res[io.device][io.channel];
          var min = io.min;
          var max = io.max;

          if (min === 0 && max === 0)
          {
            min = 900;
            max = 1024;
          }

          if (value >= min && value <= max)
          {
            (testing ? ok : nok).push(io._id);
          }
          else
          {
            (testing ? nok : ok).push(io._id);
          }

          if (io.type === 'analog')
          {
            anyAnalog = true;
          }
        });

        if (page.model.get('debug'))
        {
          console.log('getIo', {
            success: nok.length === 0,
            ok: ok,
            nok: nok,
            res: res
          });
        }

        if (nok.length)
        {
          page.model.set('lastValidCheckAt', 0);

          page.scheduleAction(page.checkIo, CHECK_INTERVAL);

          return;
        }

        var validCheckAt = Date.now();
        var lastValidCheckAt = page.model.get('lastValidCheckAt');
        var validDuration = validCheckAt - lastValidCheckAt;

        if (!lastValidCheckAt)
        {
          page.model.set('lastValidCheckAt', validCheckAt);
        }

        var minValidDuration = CHECK_INTERVAL * (anyAnalog ? 6 : 3);

        if (page.model.get('pass') > 1)
        {
          minValidDuration /= 3;
        }

        if (testing && (!lastValidCheckAt || validDuration < minValidDuration))
        {
          page.scheduleAction(page.checkIo, CHECK_INTERVAL);

          return;
        }

        var currentStep = page.model.get('step');
        var nextProgramStep = page.model.test.get('program').steps[currentStep];

        if (nextProgramStep)
        {
          page.model.set('step', currentStep + 1);
          page.scheduleAction(page.runStep);
        }
        else
        {
          page.scheduleAction(page.nextPass);
        }
      });
    },

    nextPass: function()
    {
      var currentPass = this.model.get('pass');

      if (currentPass > 1)
      {
        return this.tearDown();
      }

      if (this.model.get('debug'))
      {
        console.log('nextPass', {currentPass: currentPass});
      }

      this.model.set({
        pass: currentPass + 1,
        step: 1,
        setIo: {},
        checkIo: {}
      });

      this.setIo(true, this.runStep);
    },

    tearDown: function()
    {
      var page = this;

      if (/^TEST/.test(page.model.get('line')))
      {
        if (page.model.get('debug'))
        {
          console.log('tearDown skipped');
        }

        page.setIo(true, page.saveTest);

        return;
      }

      if (page.model.get('state') === 'test-teardown')
      {
        if (page.model.get('debug'))
        {
          console.log('tearDown completed');
        }

        page.setIo(true, page.saveTest);

        return;
      }

      if (page.model.get('debug'))
      {
        console.log('tearDown started');
      }

      page.model.set({
        state: 'test-teardown',
        step: 1,
        setIo: {},
        checkIo: {}
      });

      page.setIo(true, page.runStep, 150);
    },

    saveTest: function()
    {
      if (this.model.get('debug'))
      {
        console.log('saveTest');
      }

      this.model.test.set({
        finishedAt: new Date()
      });
      this.model.set({
        state: 'test-saving'
      });

      this.scheduleAction(this.trySaveTest.bind(this, 1));
    },

    trySaveTest: function(tryNo)
    {
      if (this.model.get('debug'))
      {
        console.log('trySaveTest', {tryNo: tryNo});
      }

      var page = this;
      var req = page.ajax({
        method: 'POST',
        url: '/trw/tests',
        data: JSON.stringify(page.model.test.toJSON())
      });

      req.fail(function()
      {
        if (tryNo === 3)
        {
          var error = req.responseJSON
            && req.responseJSON.error
            && req.responseJSON.error.message
            || req.statusText;

          return page.model.set({
            state: 'error',
            error: page.t('testing:error:save', {error: error})
          });
        }

        page.scheduleAction(page.trySaveTest.bind(page, tryNo + 1), 1000 * tryNo);
      });

      req.done(function()
      {
        page.scheduleAction(page.finishTest);
      });
    },

    finishTest: function()
    {
      if (this.model.get('debug'))
      {
        console.log('finishTest');
      }

      this.model.test.clear();
      this.model.set({
        state: 'test-success'
      });

      if (!/^TEST/.test(this.model.get('line')))
      {
        this.scheduleAction(this.startTest, 5000);
      }
    },

    runCommand: function(cmd, data, done)
    {
      var init = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      };
      var url = window.ENV === 'development'
        ? 'https://dev.wmes.pl'
        : 'http://localhost';

      fetch(url + '/trw/' + cmd, init)
        .then(function(res)
        {
          if (res.ok)
          {
            return res.json();
          }

          throw new Error('status code: ' + res.status);
        })
        .then(function(res)
        {
          if (res.error)
          {
            throw res.error;
          }

          done(null, res);
        })
        .catch(done);
    },

    updateConnections: function()
    {
      var page = this;

      if (!page.jsPlumb)
      {
        return;
      }

      page.jsPlumb.deleteEveryConnection();

      var steps = page.model.program.get('steps');
      var stepNo = page.model.get('step');

      for (var stepI = 0; stepI < stepNo; ++stepI)
      {
        var step = steps[stepI];

        if (!step.source.cluster || !step.target.cluster)
        {
          continue;
        }

        var faded = stepI < stepNo - 1;
        var cssClass = ['trw-base-canvas-connector'];

        if (faded)
        {
          cssClass.push('trw-base-canvas-faded');
        }

        var connection = page.jsPlumb.connect({
          uuids: [
            Program.formatEndpointUuid(step.source),
            Program.formatEndpointUuid(step.target)
          ],
          parameters: {step: step._id},
          detachable: false,
          cssClass: cssClass.join(' ')
        });

        if (!connection)
        {
          return;
        }

        var label = connection.getOverlay('LABEL');

        label.setLabel((stepI + 1).toString());
        label.setVisible(true);

        if (faded)
        {
          label.addClass('trw-base-canvas-faded');
        }
      }
    },

    ioSet: function(device, channel, value, done)
    {
      this.runCommand('setIo', {outputs: [{device: device, channel: channel, value: value}]}, function(err)
      {
        if (done)
        {
          done(err);
        }

        if (err)
        {
          return console.warn('Failed to set IO: %s', err.message);
        }

        console.info('IO %s:%s set to: %s', device, channel, value);
      });
    },

    toggleDebugMode: function()
    {
      this.debug.lastValues = {};
      this.debug.highlightedRows = {};
      this.debug.highlightedCells = {};

      this.model.set('debug', !this.model.get('debug'));
      this.$el.toggleClass('trw-testing-debugging', this.model.get('debug'));
    },

    updateDebugInfo: function()
    {
      var page = this;

      clearTimeout(page.timers.updateDebugInfo);

      if (!page.model.get('debug'))
      {
        page.$id('debug').addClass('hidden');

        return;
      }

      var inputs = [];
      var ioMap = {};
      var cellIo = page.model.get('cellIo') || {};

      _.forEach(page.model.get('allIo'), function(io)
      {
        ioMap[io.device + ':' + io.channel] = io;
        inputs.push({device: io.device, channel: io.channel});
      });

      page.runCommand('getIo', {inputs: inputs}, function(err, res)
      {
        if (!page.model.get('debug'))
        {
          return;
        }

        var $debug = page.$id('debug');

        if (err)
        {
          $debug.html('???');
        }
        else if (!_.isEqual(res, page.debug.lastValues))
        {
          page.debug.lastValues = res;

          var rows = [];
          var setCells = {};

          _.forEach(res, function(channels, device)
          {
            _.forEach(channels, function(value, channel)
            {
              var io = ioMap[device + ':' + channel];

              (cellIo[io._id] || []).forEach(function(cellId)
              {
                var setCell = setCells[cellId];

                if (setCell && setCell.value > 0 && setCell.io.type !== 'output')
                {
                  return;
                }

                if (setCell && setCell.io.type !== 'output' && io.type === 'output')
                {
                  return;
                }

                setCells[cellId] = {
                  value: value,
                  io: io
                };

                var cellEl = document.getElementById('TRW:' + cellId);
                var subLabelEl = cellEl.querySelector('.trw-base-cell-subLabel');

                subLabelEl.textContent = value.toString();
              });

              rows.push(_.assign(
                {
                  value: value,
                  highlighted: page.debug.highlightedRows[io._id]
                },
                io
              ));
            });
          });

          $debug.html(page.renderPartialHtml(debugTemplate, {rows: rows}));
        }

        $debug.removeClass('hidden');

        page.timers.updateDebugInfo = setTimeout(page.updateDebugInfo.bind(page), 1000);
      });
    }

  });
});
