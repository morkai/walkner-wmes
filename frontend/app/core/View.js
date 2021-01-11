// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'backbone',
  'backbone.layout',
  'app/broker',
  'app/socket',
  'app/pubsub',
  'app/i18n',
  './util',
  './util/html',
  './util/forms/formGroup'
],
function(
  _,
  $,
  Backbone,
  Layout,
  broker,
  socket,
  pubsub,
  t,
  util,
  html,
  formGroup
) {
  'use strict';

  function View(options)
  {
    var view = this;

    view.idPrefix = _.uniqueId('v');
    view.options = options || {};
    view.timers = {};
    view.promises = [];

    _.forEach(view.sections, function(selector, section)
    {
      if (typeof selector !== 'string' || selector === '#')
      {
        view.sections[section] = '#' + view.idPrefix + '-' + section;
      }
      else
      {
        view.sections[section] = selector.replace('#-', '#' + view.idPrefix + '-');
      }
    });

    util.defineSandboxedProperty(view, 'broker', broker);
    util.defineSandboxedProperty(view, 'pubsub', pubsub);
    util.defineSandboxedProperty(view, 'socket', socket);

    Object.defineProperty(view, 't', {
      enumerable: true,
      configurable: true,
      get: function()
      {
        delete view.t;

        view.t = t.forDomain(view.getDefaultNlsDomain());

        return view.t;
      }
    });

    Layout.call(view, options);

    util.subscribeTopics(view, 'broker', view.localTopics, true);

    if (view.remoteTopicsAfterSync)
    {
      if (view.remoteTopicsAfterSync === true)
      {
        view.remoteTopicsAfterSync = 'model';
      }

      if (typeof view.remoteTopicsAfterSync === 'string' && view[view.remoteTopicsAfterSync])
      {
        view.listenToOnce(
          view[view.remoteTopicsAfterSync],
          'sync',
          util.subscribeTopics.bind(util, view, 'pubsub', view.remoteTopics, true)
        );
      }
    }
    else
    {
      util.subscribeTopics(view, 'pubsub', view.remoteTopics, true);
    }
  }

  util.inherits(View, Layout);

  View.prototype.delegateEvents = function(events)
  {
    if (!events)
    {
      events = _.result(this, 'events');
    }

    if (!events)
    {
      return this;
    }

    this.undelegateEvents();

    Object.keys(events).forEach(function(key)
    {
      var method = events[key];

      if (!_.isFunction(method))
      {
        method = this[method];
      }

      if (!_.isFunction(method))
      {
        return;
      }

      var match = key.match(/^(\S+)\s*(.*)$/);
      var eventName = match[1] + '.delegateEvents' + this.cid;
      var selector = match[2];

      if (selector === '')
      {
        this.$el.on(eventName, method.bind(this));
      }
      else
      {
        if (_.isString(this.idPrefix))
        {
          selector = selector.replace(/#-/g, '#' + this.idPrefix + '-');
        }

        this.$el.on(eventName, selector, method.bind(this));
      }
    }, this);
  };

  View.prototype.listenTo = function(obj)
  {
    if (obj)
    {
      return Layout.prototype.listenTo.apply(this, arguments);
    }
  };

  View.prototype.listenToOnce = function(obj)
  {
    if (obj)
    {
      return Layout.prototype.listenToOnce.apply(this, arguments);
    }
  };

  View.prototype.getViews = function(fn)
  {
    if (typeof fn === 'string' && /^#-/.test(fn))
    {
      fn = fn.replace('#-', '#' + this.idPrefix + '-');
    }

    return Layout.prototype.getViews.call(this, fn);
  };

  View.prototype.setView = function(name, view, insert, insertOptions)
  {
    if (typeof name === 'string' && /^#-/.test(name))
    {
      name = name.replace('#-', '#' + this.idPrefix + '-');
    }

    if (!(name instanceof Backbone.View) && !(view instanceof Backbone.View))
    {
      return null;
    }

    return Layout.prototype.setView.call(this, name, view, insert, insertOptions);
  };

  View.prototype.cleanup = function()
  {
    this.destroy();
    this.cleanupSelect2();
    this.cleanupPopovers();

    util.cleanupSandboxedProperties(this);

    if (_.isObject(this.timers))
    {
      _.forEach(this.timers, clearTimeout);

      this.timers = {};
    }

    this.cancelRequests();
  };

  View.prototype.destroy = function() {};

  View.prototype.cleanupSelect2 = function()
  {
    var view = this;

    view.$('.select2-container').each(function()
    {
      view.$('#' + this.id.replace('s2id_', '')).select2('destroy');
    });
  };

  View.prototype.cleanupPopovers = function()
  {
    var view = this;

    view.$('.popover').each(function()
    {
      view.$('[aria-describedby="' + this.id + '"]').popover('destroy');
    });

    view.$('.tooltip').each(function()
    {
      view.$('[aria-describedby="' + this.id + '"]').tooltip('destroy');
    });
  };

  View.prototype.beforeRender = function() {};

  View.prototype.serialize = function()
  {
    return _.assign(this.getCommonTemplateData(), this.getTemplateData());
  };

  View.prototype.getCommonTemplateData = function()
  {
    var helpers = this.getTemplateHelpers();

    return {
      idPrefix: this.idPrefix,
      helpers: helpers,
      t: helpers.t,
      id: helpers.id
    };
  };

  View.prototype.getTemplateData = function()
  {
    return {};
  };

  View.prototype.getTemplateHelpers = function()
  {
    var idPrefix = this.idPrefix;

    return {
      t: this.t,
      id: function()
      {
        return idPrefix + '-' + Array.prototype.slice.call(arguments).join('-');
      },
      props: this.props.bind(this),
      formGroup: formGroup.bind(null, this)
    };
  };

  View.prototype.renderPartial = function(partial, data)
  {
    return $(this.renderPartialHtml(partial, data));
  };

  View.prototype.renderPartialHtml = function(partial, data)
  {
    return partial(_.assign(this.getCommonTemplateData(), data));
  };

  View.prototype.afterRender = function() {};

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
    if (!promise || !_.isFunction(promise.abort))
    {
      return promise;
    }

    this.promises.push(promise);

    var view = this;

    promise.always(function()
    {
      if (Array.isArray(view.promises))
      {
        view.promises.splice(view.promises.indexOf(promise), 1);
      }
    });

    return promise;
  };

  View.prototype.cancelRequests = function()
  {
    this.promises.forEach(function(promise) { promise.abort(); });

    this.promises = [];
  };

  View.prototype.cancelAnimations = function(clearQueue, jumpToEnd)
  {
    this.$el.stop(clearQueue !== false, jumpToEnd !== false);
    this.$(':animated').stop(clearQueue !== false, jumpToEnd !== false);
  };

  View.prototype.$id = function(idSuffix)
  {
    var selector = '#';

    if (_.isString(this.idPrefix))
    {
      selector += this.idPrefix + '-';
    }

    selector += idSuffix;

    var $el = this.$el.find(selector);

    return $el.length ? $el : $(selector);
  };

  View.prototype.getDefaultModel = function()
  {
    return this[this.modelProperty] || this.model || this.collection;
  };

  View.prototype.getDefaultNlsDomain = function()
  {
    if (this.nlsDomain)
    {
      return _.result(this, 'nlsDomain');
    }

    var model = this.getDefaultModel();

    if (model)
    {
      if (model.getNlsDomain)
      {
        return model.getNlsDomain();
      }

      if (model.nlsDomain)
      {
        return model.nlsDomain;
      }
    }

    return 'core';
  };

  View.prototype.props = function(data, options)
  {
    var view = this;

    if (!options)
    {
      options = data;
      data = options.data;
    }

    var propsHtml = '<div class="props ' + (options.first ? 'first' : '') + '">';
    var defaultNlsDomain = view.getDefaultNlsDomain();

    [].concat(_.isArray(options) ? options : options.props).forEach(function(prop)
    {
      if (typeof prop === 'string')
      {
        prop = {id: prop};
      }

      var escape = prop.escape === false ? false : (prop.id.charAt(0) !== '!');
      var id = escape ? prop.id : prop.id.substring(1);
      var nlsDomain = prop.nlsDomain || options.nlsDomain || defaultNlsDomain;
      var label = prop.label || t(nlsDomain, 'PROPERTY:' + id);
      var value = _.isFunction(prop.value)
        ? prop.value(data[id], prop, view)
        : _.isUndefined(prop.value) ? data[id] : prop.value;

      if (_.isFunction(prop.visible) && !prop.visible(value, prop, view))
      {
        return;
      }

      if (prop.visible != null && !prop.visible)
      {
        return;
      }

      var propAttrs = Object.assign(
        {'data-prop': id},
        prop.attrs,
        {className: {prop: true}}
      );

      [prop.className, prop.attrs && prop.attrs.className].forEach(function(rawClassName)
      {
        if (typeof rawClassName === 'string' && rawClassName.length)
        {
          rawClassName = rawClassName.split(' ');
        }

        if (Array.isArray(rawClassName))
        {
          rawClassName.forEach(function(className)
          {
            propAttrs.className[className] = true;
          });
        }
        else if (rawClassName && typeof rawClassName === 'object')
        {
          Object.assign(propAttrs.className, rawClassName);
        }
      });

      var nameAttrs = Object.assign(
        {},
        prop.nameAttrs,
        {className: {'prop-name': true}}
      );

      [prop.nameClassName, prop.nameAttrs && prop.nameAttrs.className].forEach(function(rawClassName)
      {
        if (typeof rawClassName === 'string' && rawClassName.length)
        {
          rawClassName = rawClassName.split(' ');
        }

        if (Array.isArray(rawClassName))
        {
          rawClassName.forEach(function(className)
          {
            nameAttrs.className[className] = true;
          });
        }
        else if (rawClassName && typeof rawClassName === 'object')
        {
          Object.assign(nameAttrs.className, rawClassName);
        }
      });

      var valueAttrs = Object.assign(
        {},
        prop.valueAttrs,
        {className: {'prop-value': true}}
      );

      [prop.valueClassName, prop.valueAttrs && prop.valueAttrs.className].forEach(function(rawClassName)
      {
        if (typeof rawClassName === 'string' && rawClassName.length)
        {
          rawClassName = rawClassName.split(' ');
        }

        if (Array.isArray(rawClassName))
        {
          rawClassName.forEach(function(className)
          {
            valueAttrs.className[className] = true;
          });
        }
        else if (rawClassName && typeof rawClassName === 'object')
        {
          Object.assign(valueAttrs.className, rawClassName);
        }
      });

      if (typeof value !== 'string')
      {
        value = value == null ? '' : String(value);
      }

      if (escape)
      {
        value = _.escape(value);
      }

      var nameTag = html.tag('div', nameAttrs, label);
      var valueTag = html.tag('div', valueAttrs, value);

      propsHtml += html.tag('div', propAttrs, nameTag + valueTag);
    });

    return propsHtml + '</div>';
  };

  return View;
});
