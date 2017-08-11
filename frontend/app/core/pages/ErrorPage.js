// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/i18n',
  'app/user',
  '../View',
  'app/core/templates/error'
], function(
  _,
  t,
  user,
  View,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    pageId: 'error',

    events: {
      'click #-notify > a': function()
      {
        var page = this;
        var body = this.buildMail();

        page.$id('notify').html('<i class="fa fa-spinner fa-spin"></i>');

        page.trySendMail('/mail;send', body, function(err)
        {
          if (err)
          {
            page.trySendMail(page.senderUrl, body, page.handleMailSent.bind(page));
          }
          else
          {
            page.handleMailSent();
          }
        });

        return false;
      },
      'click a[data-reload]': function()
      {
        window.location.reload();

        return false;
      }
    },

    breadcrumbs: function()
    {
      return [
        t.bound('core', 'ERROR:' + this.resolveCode() + ':title')
      ];
    },

    initialize: function()
    {
      var page = this;
      var code = page.resolveCode();

      try
      {
        page.adminEmail = atob(window.ADMIN_EMAIL);
        page.senderUrl = atob(window.REMOTE_MAIL_SENDER_URL);
        page.secretKey = atob(window.REMOTE_MAIL_SECRET_KEY);
        page.notify = true;
      }
      catch (err)
      {
        page.notify = false;
      }

      page.view = new View({
        template: function()
        {
          if (code === 403 && !user.isLoggedIn())
          {
            code += ':guest';
          }

          return template({
            idPrefix: page.idPrefix,
            message: t('core', 'ERROR:' + code + ':message'),
            notify: page.notify
          });
        }
      });
    },

    resolveCode: function()
    {
      var code = this.model.code;

      if (t.has('core', 'ERROR:' + code + ':title'))
      {
        return code;
      }

      if (code >= 400 && code < 500)
      {
        return 400;
      }

      if (code >= 500)
      {
        return 500;
      }

      return 0;
    },

    trySendMail: function(url, body, done)
    {
      this.ajax({
        method: 'POST',
        url: url,
        data: JSON.stringify({
          secretKey: this.secretKey,
          to: this.adminEmail,
          subject: t('core', 'ERROR:notify:subject', {
            code: this.model.code,
            user: user.getLabel()
          }),
          html: body
        }),
        success: function()
        {
          done();
        },
        error: function()
        {
          done(true);
        }
      });
    },

    handleMailSent: function(err)
    {
      this.$id('notify').html(t('core', 'ERROR:notify:' + (err ? 'failure' : 'success')));
    },

    buildMail: function()
    {
      var mail = [];
      var json = function(value)
      {
        return JSON.stringify(value, null, 2);
      };
      var prop = function(name, value)
      {
        mail.push(
          '<b>' + name + '=</b><br>',
          '<pre style="margin-top: 0; margin-bottom: 10px">' + String(value).trim() + '</pre>'
        );
      };

      prop('date', new Date().toLocaleString());
      prop('user', '<a href="' + window.location.origin + '/#users/' + user.data._id + '">' + user.getLabel() + '</a>'
        + '<br>' + json(_.assign({cname: window.COMPUTERNAME}, _.omit(user.data, 'privilegesMap')), null, 2));
      prop('router.currentRequest', this.model.req ? this.model.req.url : '?');
      prop('router.referrer', this.model.previousUrl || '?');
      prop('response.code', this.model.code);
      prop('response.body', this.model.xhr ? this.model.xhr.responseText : '');
      prop('window.location.href', window.location.href);
      prop('window.navigator', json(_.pick(window.navigator, [
        'language', 'languages', 'cookieEnabled', 'onLine', 'platform', 'userAgent'
      ])));
      prop('window.screen', json(_.assign(_.pick(window.screen, [
        'availHeight', 'availWidth', 'width', 'height'
      ])), {innerWidth: window.innerWidth, innerHeight: window.innerHeight}));

      return mail.join('');
    }

  });
});
