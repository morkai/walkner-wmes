// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'viewerjs',
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
  'app/wmes-trw-programs/Program',
  '../Test',
  '../views/WorkstationPickerDialogView',
  '../views/OrderPickerDialogView',
  '../views/TesterPickerDialogView',
  '../views/ProgramPickerDialogView',
  'app/wmes-trw-tests/templates/testing'
], function(
  _,
  $,
  Viewer,
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
  Program,
  Test,
  WorkstationPickerDialogView,
  OrderPickerDialogView,
  TesterPickerDialogView,
  ProgramPickerDialogView,
  template
) {
  'use strict';

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
        if (this.model.tester.get('name'))
        {
          this.showProgramPickerDialog();
        }
        else
        {
          this.showTesterPickerDialog();
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
              label: this.t('testing:menu:tester'),
              handler: this.showTesterPickerDialog.bind(this)
            }
          ]
        });
      },
      'click .trw-testing-ft': function()
      {
        var state = this.model.get('state');

        if (state === 'test-success' || state === 'error')
        {
          this.startTest();
        }
      }

    },

    localTopics: {
      'socket.connected': function()
      {
        this.loadTesterAndProgram();
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
          this.model.tester.clear();
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

        if (newProgram.tester === this.model.tester.id)
        {
          newProgram.tester = this.model.tester.toJSON();

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
        program: new Program({_id: sessionStorage.getItem('TRW:PROGRAM') || null}),
        test: new Test()
      });

      page.vkbView = new VkbView();

      page.listenTo(model, 'change:state', page.updateState);
      page.listenTo(model, 'change:step', page.updateMessage);
      page.listenTo(model, 'change:qtyTodo change:qtyDone', page.updateOrder);
      page.listenTo(model, 'change:order', page.onOrderChange);
      page.listenTo(model, 'change:line change:workstation', page.onLineChange);
      page.listenTo(model.tester, 'error', page.onTesterError);
      page.listenTo(model.tester, 'change', page.onTesterChange);
      page.listenTo(model.program, 'error', page.onProgramError);
      page.listenTo(model.program, 'change', page.onProgramChange);

      page.setView('#-vkb', page.vkbView);
    },

    destroy: function()
    {
      document.body.classList.remove('trw-testing-page');
      $('.modal.fade').addClass('fade');
    },

    beforeRender: function()
    {
      document.body.classList.add('trw-testing-page');
    },

    afterRender: function()
    {
      $('.modal.fade').removeClass('fade');

      embedded.render(this);

      this.updateWorkstation();
      this.updateOrder();
      this.updateProgramName();
      this.updateMessage();
      this.loadTesterAndProgram();
      this.setUpViewer();

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
    },

    loadTesterAndProgram: function()
    {
      var page = this;

      if (!page.model.tester.id)
      {
        page.model.program.clear();
        page.model.tester.clear();

        return;
      }

      var programId = page.model.program.id;
      var req = page.model.tester.fetch();

      req.fail(function()
      {
        if (req.status === 404)
        {
          page.model.tester.clear();
        }
      });

      req.done(function()
      {
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
          var programTester = page.model.program.get('tester');

          if (!programTester || programTester._id !== page.model.tester.id)
          {
            page.model.program.clear();
          }
        });
      });
    },

    setUpViewer: function()
    {
      var viewer = new Viewer(this.$id('viewer-images')[0], {
        inline: true,
        button: false,
        keyboard: false,
        navbar: false,
        title: false,
        tooltip: false,
        backdrop: false,
        initialViewIndex: 0,
        toolbar: {},
        toggleOnDblclick: false,
        view: function(e)
        {
          console.log('viewer#view', e);
        },
        rendering: function()
        {
          console.log('viewer#rendering');
          // document.getElementById('marks').style.display = 'none';
        },
        rendered: function()
        {
          console.log('viewer#rendered');
          // clearTimeout(adjustMarksTimer);
          // adjustMarksTimer = setTimeout(adjustMarks, 300);
        },
        viewed: function()
        {
          console.log('viewer#viewed');
          // viewer.zoomTo(1);
        }
      });

      viewer.show();
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
      else if (qtyTodo)
      {
        value += ' • ' + (qtyDone >= 0 ? qtyDone : '?') + '/' + qtyTodo;
      }

      this.$prop('order', value);
    },

    updateProgramName: function()
    {
      var value = this.model.program.get('name');

      if (!this.model.tester.get('name'))
      {
        value = this.t('testing:noTester');
      }
      else if (!value)
      {
        value = this.t('testing:noProgram');
      }

      this.$prop('program', value);
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
          html = this.t('state:step:prefix', {n: step}) + Program.colorize(programStep.name);
        }
      }
      else if (state === 'error')
      {
        html = this.model.get('error');
      }

      this.$id('message').html(html);
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

        sessionStorage.removeItem('TRW:PROGRAM');

        viewport.closeDialog();
      });

      viewport.showDialog(dialogView, this.t('orderPicker:title'));
    },

    showTesterPickerDialog: function()
    {
      var dialogView = new TesterPickerDialogView({
        model: this.model,
        vkb: this.vkbView
      });

      this.listenTo(dialogView, 'picked', function(data)
      {
        this.model.tester.set(data.tester);

        viewport.closeDialog();
      });

      viewport.showDialog(dialogView, this.t('testerPicker:title'));
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
      var $prop = this.$('.trw-testing-hd-prop[data-prop="' + name + '"]');

      if (arguments.length === 2)
      {
        $prop.find('.trw-testing-hd-prop-value').html(value);
      }

      return $prop;
    },

    onTesterError: function()
    {
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

      this.model.program.clear();

      this.updateProgramName();
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
        localStorage.setItem('TRW:PROGRAM', this.model.program.id);
      }
      else
      {
        localStorage.removeItem('TRW:PROGRAM');
      }

      this.updateProgramName();
      this.loadCounter();
      this.startTest();
    },

    onOrderChange: function()
    {
      if (this.model.get('line'))
      {
        sessionStorage.setItem('TRW:ORDER', this.model.get('line'));
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

      if (!this.model.tester.get('name'))
      {
        return this.model.set({
          state: 'no-tester'
        });
      }

      if (!this.model.program.get('name'))
      {
        return this.model.set({
          state: 'no-program'
        });
      }

      if (!this.model.get('order'))
      {
        return this.model.set({
          state: 'no-order'
        });
      }

      this.scheduleAction(this.runTest);
    },

    runTest: function()
    {
      var program = this.model.program.toJSON();
      var allIo = {};

      program.tester.io.forEach(function(io)
      {
        allIo[io._id] = io;
      });

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
        step: 1,
        error: null,
        test: uuid(),
        allIo: allIo,
        setIo: {},
        checkIo: {}
      });

      this.setIo(true, this.runStep);
    },

    runStep: function()
    {
      var program = this.model.test.get('program');
      var stepNo = this.model.get('step');
      var step = program.steps[stepNo - 1];
      var allIo = this.model.get('allIo');
      var setIo = this.model.get('setIo');
      var checkIo = this.model.get('checkIo');

      step.setIo.forEach(function(id)
      {
        setIo[id] = allIo[id];
      });

      step.checkIo.forEach(function(id)
      {
        checkIo[id] = allIo[id];
      });

      this.setIo(false, this.checkIo);
    },

    setIo: function(reset, nextAction)
    {
      var page = this;
      var outputs = [];
      var allIo = page.model.get('allIo');
      var setIo = page.model.get('setIo');

      _.forEach(allIo, function(io)
      {
        if (io.type !== 'output')
        {
          return;
        }

        outputs.push({
          device: io.device,
          channel: io.channel,
          value: !reset && setIo[io._id] ? 0 : 8000
        });
      });

      page.runCommand('setIo', {outputs: outputs}, function(err)
      {
        if (err)
        {
          page.model.set({
            state: 'error',
            error: page.t('testing:error:setIo', {error: err.message})
          });

          return page.scheduleAction(page.startTest, 10000);
        }

        page.scheduleAction(nextAction);
      });
    },

    checkIo: function()
    {
      var page = this;
      var inputs = [];
      var checkIo = page.model.get('checkIo');

      _.forEach(checkIo, function(io)
      {
        if (io.type !== 'input')
        {
          return;
        }

        inputs.push({
          device: io.device,
          channel: io.channel
        });
      });

      page.runCommand('getIo', {inputs: inputs}, function(err, res)
      {
        if (err)
        {
          page.model.set({
            state: 'error',
            error: page.t('testing:error:getIo', {error: err.message})
          });

          return page.scheduleAction(page.startTest, 10000);
        }

        var ok = [];
        var nok = [];

        _.forEach(checkIo, function(io)
        {
          var value = res[io.device][io.channel];

          if (value > 900)
          {
            ok.push(io._id);
          }
          else
          {
            nok.push(io._id);
          }
        });

        if (nok.length)
        {
          page.scheduleAction(page.checkIo, 100);
        }
        else
        {
          var currentStep = page.model.get('step');
          var nextProgramStep = page.model.test.get('program').steps[currentStep];

          if (nextProgramStep)
          {
            page.model.set('step', currentStep + 1);
            page.scheduleAction(page.runStep);
          }
          else
          {
            page.scheduleAction(page.tearDown);
          }
        }
      });
    },

    tearDown: function()
    {
      if (/^TEST/.test(this.model.get('line')))
      {
        this.setIo(true, this.saveTest);

        return;
      }

      this.model.set({
        state: 'test-teardown'
      });

      this.checkTearDown();
    },

    checkTearDown: function()
    {
      var page = this;
      var inputs = [];
      var checkIo = page.model.get('checkIo');

      _.forEach(checkIo, function(io)
      {
        inputs.push({
          device: io.device,
          channel: io.channel
        });
      });

      page.runCommand('getIo', {inputs: inputs}, function(err, res)
      {
        if (err)
        {
          page.model.set({
            state: 'error',
            error: page.t('testing:error:getIo', {error: err.message})
          });

          return page.scheduleAction(page.startTest, 10000);
        }

        var ok = [];
        var nok = [];

        _.forEach(checkIo, function(io)
        {
          var value = res[io.device][io.channel];

          if (value < 100)
          {
            ok.push(io._id);
          }
          else
          {
            nok.push(io._id);
          }
        });

        if (nok.length)
        {
          page.scheduleAction(page.checkTearDown, 100);
        }
        else
        {
          page.setIo(true, page.saveTest);
        }
      });
    },

    saveTest: function()
    {
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

      fetch('http://localhost/trw/' + cmd, init)
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
    }

  });
});