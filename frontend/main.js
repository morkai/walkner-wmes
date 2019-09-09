// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

(function()
{
  'use strict';

  var lastError = null;

  function logBrowserError(error, event)
  {
    if (!window.fetch)
    {
      return;
    }

    if (error.stack === lastError)
    {
      return;
    }

    lastError = error.stack || '';

    var stack = lastError.split(/\s+at\s+/);

    stack.shift();

    error = {
      type: error.name,
      message: error.message,
      stack: stack,
      time: event ? event.timeStamp : -1
    };

    var navigator = window.navigator;
    var screen = window.screen;
    var headers = getCommonHeaders();

    headers['Content-Type'] = 'application/json';

    fetch('/logs/browserErrors', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        error: error,
        browser: {
          time: new Date(),
          navigator: {
            language: navigator.language,
            languages: navigator.languages,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            platform: navigator.platform,
            userAgent: navigator.userAgent
          },
          screen: {
            availHeight: screen.availHeight,
            availWidth: screen.availWidth,
            width: screen.width,
            height: screen.height,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight
          },
          location: window.location.href,
          history: JSON.parse(require('app/data/localStorage').getItem('WMES_RECENT_LOCATIONS') || [])
        },
        versions: window.updater && window.updater.versions || {}
      })
    }).then(function() {}, function() {});
  }

  function getCommonHeaders()
  {
    var headers = {};

    if (window.INSTANCE_ID)
    {
      headers['X-WMES-INSTANCE'] = window.INSTANCE_ID;
    }

    if (window.COMPUTERNAME)
    {
      headers['X-WMES-CNAME'] = window.COMPUTERNAME;
    }

    if (window.WMES_APP_ID)
    {
      headers['X-WMES-APP'] = window.WMES_APP_ID;
    }

    if (window.WMES_LINE_ID)
    {
      headers['X-WMES-LINE'] = window.WMES_LINE_ID;
    }

    if (window.WMES_STATION)
    {
      headers['X-WMES-STATION'] = window.WMES_STATION;
    }

    return headers;
  }

  window.WMES_GET_COMMON_HEADERS = getCommonHeaders;
  window.WMES_LOG_BROWSER_ERROR = logBrowserError;

  window.addEventListener('error', function(e)
  {
    logBrowserError(e.error, e);
  });

  var navigator = window.navigator;
  var location = window.location;

  if (location.protocol === 'http:' && location.pathname === '/' && location.port === '')
  {
    location.protocol = 'https:';
  }

  if (!location.origin)
  {
    location.origin = location.protocol + '//' + location.hostname + (location.port ? (':' + location.port) : '');
  }

  window.COMPUTERNAME = (location.href.match(/COMPUTERNAME=(.*?)(?:(?:#|&).*)?$/i) || [null, null])[1];
  window.INSTANCE_ID = Math.round(Date.now() + Math.random() * 9999999).toString(36).toUpperCase();
  window.IS_EMBEDDED = window.parent !== window || window.location.href.indexOf('_embedded=1') !== -1;
  window.IS_IE = navigator.userAgent.indexOf('Trident/') !== -1;
  window.IS_MOBILE = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i
    .test(navigator.userAgent);
  window.IS_LINUX = navigator.userAgent.indexOf('X11; Linux') !== -1;

  if (window.IS_EMBEDDED
    || window.IS_LINUX
    || !navigator.serviceWorker
    || !navigator.serviceWorker.getRegistrations
    || location.protocol !== 'https:'
    || location.pathname !== '/')
  {
    delete window.SERVICE_WORKER;
  }

  document.body.classList.toggle('is-ie', window.IS_IE);
  document.body.classList.toggle('is-mobile', window.IS_MOBILE);
  document.body.classList.toggle('is-embedded', window.IS_EMBEDDED);
  document.body.classList.toggle('is-linux', window.IS_LINUX);

  document.body.dataset.appId = window.WMES_APP_ID;

  try
  {
    if (window.IS_EMBEDDED && window.parent.WMES_APP_ID)
    {
      document.body.dataset.parentAppId = window.parent.WMES_APP_ID;
    }
  }
  catch (err) {} // eslint-disable-line no-empty

  if (window.ENV === 'testing')
  {
    var matches = location.hash.match(/^(?:#proxy=([0-9]+))?(#.*?)?$/);

    if (!matches || matches[1] === undefined || matches[1] === localStorage.getItem('PROXY'))
    {
      location.href = '/redirect?referrer=' + encodeURIComponent(
        location.origin + location.pathname + '#proxy=' + Date.now() + (matches && matches[2] ? matches[2] : '#')
      );

      return;
    }

    location.hash = matches && matches[2] ? matches[2] : '#';

    localStorage.setItem('PROXY', matches[1]);
  }

  if (window.IS_EMBEDDED)
  {
    window.parent.postMessage({type: 'init', host: location.hostname}, '*');
  }

  if (window.SERVICE_WORKER)
  {
    window.navigator.serviceWorker.register(window.SERVICE_WORKER)
      .then(function() { console.log('[sw] Registered!'); })
      .catch(function(err) { console.error('[sw] Failed to register:', err); });
  }

  var oldSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send = function()
  {
    var headers = getCommonHeaders();

    Object.keys(headers).forEach(function(key)
    {
      this.setRequestHeader(key, headers[key]);
    }, this);

    return oldSend.apply(this, arguments);
  };

  var domains = [];
  var i18n = null;
  var select2 = null;

  require.onError = function(err)
  {
    console.error(Object.keys(err), err);

    var loadingEl = document.getElementById('app-loading');

    if (!loadingEl)
    {
      return;
    }

    loadingEl.className = 'error';

    var spinnerEl = loadingEl.getElementsByClassName('fa-spin')[0];

    if (spinnerEl)
    {
      spinnerEl.classList.remove('fa-spin');
    }
  };

  require.onResourceLoad = function(context, map)
  {
    if (map.prefix === 'i18n')
    {
      var keys = context.defined[map.id];
      var domain = map.id.substr(map.id.lastIndexOf('/') + 1);

      if (i18n !== null)
      {
        i18n.register(domain, keys, map.id);
      }
      else
      {
        domains.push([domain, keys, map.id]);
      }
    }
    else if (map.id === 'app/i18n')
    {
      i18n = context.defined[map.id];
      i18n.config = context.config.config.i18n;

      domains.forEach(function(domainData)
      {
        i18n.register(domainData[0], domainData[1], domainData[2]);
      });

      domains = null;
    }
    else if (map.id === 'select2')
    {
      select2 = context.defined[map.id];
      select2.lang = function(lang)
      {
        window.jQuery.extend(window.jQuery.fn.select2.defaults, select2.lang[lang]);
      };
    }
    else if (/^select2-lang/.test(map.id))
    {
      var lang = map.id.substr(map.id.lastIndexOf('/') + 1);

      select2.lang[lang] = context.defined[map.id];
    }
  };

  var appCache = window.applicationCache;

  if (!appCache
    || appCache.status === 0
    || !navigator.onLine
    || !document.getElementsByTagName('html')[0].hasAttribute('manifest'))
  {
    return tryRequireApp(0);
  }

  var reload = location.reload.bind(location);
  var reloadTimer = setTimeout(reload, 90000);

  function doStartApp()
  {
    clearTimeout(reloadTimer);
    reloadTimer = null;

    appCache.onnoupdate = null;
    appCache.oncached = null;
    appCache.onerror = null;
    appCache.onobsolete = null;
    appCache.onupdateready = null;

    tryRequireApp();
  }

  appCache.onnoupdate = doStartApp;
  appCache.oncached = doStartApp;
  appCache.onerror = doStartApp;
  appCache.onobsolete = reload;
  appCache.onupdateready = reload;

  function tryRequireApp(i)
  {
    if (i === 10)
    {
      throw new Error('No window.requireApp()?!');
    }

    if (typeof window.requireApp === 'function')
    {
      window.requireApp();
    }
    else
    {
      setTimeout(tryRequireApp, 1000, i + 1);
    }
  }
})();
