// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/time',
  'app/core/View',
  'app/core/util/bindLoadingMessage',
  '../views/LineStateView',
  'app/wmes-ct-state/templates/diagPage',
  'app/wmes-ct-state/templates/diagRow'
], function(
  _,
  $,
  time,
  View,
  bindLoadingMessage,
  LineStateView,
  pageTemplate,
  rowTemplate
) {
  'use strict';

  return View.extend({

    nlsDomain: 'wmes-ct-state',
    template: pageTemplate,

    breadcrumbs: function()
    {
      return [
        {href: '#ct', label: this.t('BREADCRUMBS:base')},
        this.t('BREADCRUMBS:diag')
      ];
    },

    remoteTopics: {
      'ct.todos.saved': function(todo)
      {
        this.addTodo(todo, false);
      },
      'ct.todos.ignored': function(todo)
      {
        this.addTodo(todo, true);
      }
    },

    initialize: function()
    {
      this.scrollY = 0;
      this.scrollLock = true;

      $(window).on('scroll.' + this.idPrefix, this.onWindowScroll.bind(this));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
    },

    afterRender: function()
    {
      this.scrollY = window.scrollY;
    },

    onWindowScroll: function()
    {
      if (window.scrollY < this.scrollY)
      {
        this.scrollLock = false;
      }
      else if (window.scrollY > this.scrollY && !this.scrollLock)
      {
        this.scrollLock = this.isScrolledToBottom();
      }

      this.scrollY = window.scrollY;
    },

    addTodo: function(todo, ignored)
    {
      this.$('tbody').append(this.renderPartialHtml(rowTemplate, {
        row: {
          ignored: ignored,
          time: time.format(todo.time, 'YYYY-MM-DD, HH:mm:ss.SSS'),
          line: todo.line,
          station: todo.station ? todo.station.toString() : '',
          action: this.t('todo:action:' + todo.action),
          data: this.serializeData(todo)
        }
      }));

      if (this.scrollLock)
      {
        this.scrollToBottom();
      }
    },

    scrollToBottom: function()
    {
      window.scrollTo({
        top: document.body.scrollHeight,
        left: 0,
        behavior: 'smooth'
      });
    },

    isScrolledToBottom: function()
    {
      return (document.body.scrollHeight - window.scrollY - window.innerHeight) < 5;
    },

    serializeData: function(todo)
    {
      if (_.isEmpty(todo.data))
      {
        return '';
      }

      var serializer = this.dataSerializers[todo.action];

      if (serializer)
      {
        return serializer(todo);
      }

      return '<pre>' + JSON.stringify(todo.data, null, 2) + '</pre>';
    },

    dataSerializers: {

      cart: function(todo)
      {
        return todo.data.cart || '?';
      },

      input: function(todo)
      {
        return todo.data.state === true
          ? '1'
          : todo.data.state === false
            ? '0'
            : '?';
      },

      sn: function(todo)
      {
        return '<a href="#prodShiftOrders/' + todo.data.prodShiftOrder + '">'
          + todo.data.serialNo
          + '</a>';
      }

    }

  });
});
