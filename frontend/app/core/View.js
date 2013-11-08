define([
  'underscore',
  'jquery',
  'backbone.layout',
  'app/broker',
  'app/socket',
  'app/pubsub',
  './util'
],
function(
  _,
  $,
  Layout,
  broker,
  socket,
  pubsub,
  util
) {
  'use strict';

  function View(options)
  {
    util.defineSandboxedProperty(this, 'broker', broker);
    util.defineSandboxedProperty(this, 'pubsub', pubsub);
    util.defineSandboxedProperty(this, 'socket', socket);

    util.subscribeTopics(this, 'broker', this.localTopics, true);
    util.subscribeTopics(this, 'pubsub', this.remoteTopics, true);

    this.timers = {};

    this.promises = [];

    Layout.call(this, options);
  }

  util.inherits(View, Layout);

  View.prototype.cleanup = function()
  {
    if (_.isFunction(this.destroy))
    {
      this.destroy();
    }

    util.cleanupSandboxedProperties(this);

    if (_.isObject(this.timers))
    {
      _.each(this.timers, clearTimeout);

      this.timers = null;
    }

    if (Array.isArray(this.promises))
    {
      var promises = this.promises;

      this.promises = null;

      promises.forEach(function(promise)
      {
        promise.abort();
      });
    }
  };

  View.prototype.isRendered = function()
  {
    return this.hasRendered === true;
  };

  View.prototype.isDetached = function()
  {
    return !$.contains(document.documentElement, this.el);
  };

  View.prototype.ajax = function(options)
  {
    return this.promised($.ajax(options));
  };

  View.prototype.promised = function(promise)
  {
    if (_.isFunction(promise.abort))
    {
      this.promises.push(promise);

      var view = this;

      promise.always(function()
      {
        if (Array.isArray(view.promises))
        {
          view.promises.splice(view.promises.indexOf(promise), 1);
        }
      });
    }

    return promise;
  };

  return View;
});
