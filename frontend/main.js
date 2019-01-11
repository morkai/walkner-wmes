// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

(function()
{
  'use strict';

  var location = window.location;

  if (location.protocol === 'http:' && location.pathname === '/' && location.port === '')
  {
    window.location.protocol = 'https:';
  }

  if (!location.origin)
  {
    location.origin = location.protocol + '//' + location.hostname + (location.port ? (':' + location.port) : '');
  }

  window.COMPUTERNAME = (location.href.match(/COMPUTERNAME=(.*?)(?:(?:#|&).*)?$/i) || [null, null])[1];
  window.INSTANCE_ID = Math.round(Date.now() + Math.random() * 9999999).toString(36).toUpperCase();
  window.IS_EMBEDDED = window.parent !== window;
  window.IS_IE = window.navigator.userAgent.indexOf('Trident/') !== -1;
  window.IS_MOBILE = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i
    .test(window.navigator.userAgent);

  document.body.classList.toggle('is-ie', window.IS_IE);
  document.body.classList.toggle('is-mobile', window.IS_MOBILE);
  document.body.classList.toggle('is-embedded', window.IS_EMBEDDED);

  if (window.ENV === 'testing')
  {
    var matches = location.hash.match(/^(?:#proxy=([0-9]+))?(#.*?)?$/);

    if (!matches || matches[1] === undefined || matches[1] === localStorage.getItem('PROXY'))
    {
      location.href = '/redirect?referrer=' + encodeURIComponent(
        location.origin + '/#proxy=' + Date.now() + (matches && matches[2] ? matches[2] : '#')
      );

      return;
    }

    window.location.hash = matches && matches[2] ? matches[2] : '#';

    localStorage.setItem('PROXY', matches[1]);
  }

  if (window.IS_EMBEDDED)
  {
    window.parent.postMessage({type: 'init', host: location.hostname}, '*');
  }

  if (window.navigator.serviceWorker)
  {
    window.navigator.serviceWorker.register('/sw.js');
  }

  var oldSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.send = function()
  {
    this.setRequestHeader('X-WMES-INSTANCE', window.INSTANCE_ID);

    if (window.COMPUTERNAME)
    {
      this.setRequestHeader('X-WMES-CNAME', window.COMPUTERNAME);
    }

    if (window.WMES_APP_ID)
    {
      this.setRequestHeader('X-WMES-APP', window.WMES_APP_ID);
    }

    if (window.WMES_LINE_ID)
    {
      this.setRequestHeader('X-WMES-LINE', window.WMES_LINE_ID);
    }

    return oldSend.apply(this, arguments);
  };

  var domains = [];
  var i18n = null;
  var select2 = null;

  require.onError = function(err)
  {
    console.error(err);

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
    || !navigator.onLine
    || !document.getElementsByTagName('html')[0].hasAttribute('manifest'))
  {
    return window.requireApp();
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

    window.requireApp();
  }

  appCache.onnoupdate = doStartApp;
  appCache.oncached = doStartApp;
  appCache.onerror = doStartApp;
  appCache.onobsolete = reload;
  appCache.onupdateready = reload;
})();
