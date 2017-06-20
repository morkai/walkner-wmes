// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const fs = require('fs');
const ejs = require('ejs');
const _ = require('lodash');
const step = require('h5.step');
const request = require('request');
const moment = require('moment');
const resolveProductName = require('../../util/resolveProductName');

module.exports = function setUpNotifier(app, module)
{
  const PROBLEMS = {
    MISSING: 'Brak zlecenia',
    EMPTY: 'Brak operacji'
  };

  const mailSender = app[module.config.mailSenderId];
  const mongoose = app[module.config.mongooseId];
  const User = mongoose.model('User');
  const Order = mongoose.model('Order');
  const InvalidOrder = mongoose.model('InvalidOrder');

  const emailTemplateFile = __dirname + '/notifier.email.pl.ejs';
  const renderEmail = ejs.compile(fs.readFileSync(emailTemplateFile, 'utf8'), {
    cache: true,
    filename: emailTemplateFile,
    compileDebug: false,
    rmWhitespace: true
  });

  module.notifyUsers = notifyUsers;

  app.broker.subscribe('orders.invalid.synced', m => notifyUsers({updatedAt: m.timestamp}));

  function notifyUsers(invalidOrdersConditions, done)
  {
    step(
      function()
      {
        InvalidOrder
          .find(invalidOrdersConditions)
          .lean()
          .exec(this.next());
      },
      function(err, invalidOrders)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (!invalidOrders.length)
        {
          return this.skip();
        }

        this.invalidOrders = _.keyBy(invalidOrders, '_id');

        const conditions = {
          _id: {$in: _.keys(this.invalidOrders)}
        };
        const fields = {
          startDate: 1,
          mrp: 1,
          nc12: 1,
          name: 1,
          description: 1,
          qty: 1,
          'qtyDone.total': 1
        };

        Order.find(conditions, fields).lean().exec(this.next());
      },
      function(err, orders)
      {
        if (err)
        {
          return this.skip(err);
        }

        this.mrpToInvalidOrders = {};
        this.etoInvalidOrders = [];

        orders.forEach(o =>
        {
          const invalidOrder = this.invalidOrders[o._id];

          if (invalidOrder.status !== 'invalid')
          {
            return;
          }

          invalidOrder.order = o;

          if (!this.mrpToInvalidOrders[o.mrp])
          {
            this.mrpToInvalidOrders[o.mrp] = [];
          }

          const templateData = {
            no: o._id,
            nc12: o.nc12,
            qtyTodo: o.qty,
            qtyDone: o.qtyDone ? (o.qtyDone.total || 0) : 0,
            productName: resolveProductName(o),
            startDate: moment(o.startDate).format('L'),
            mrp: o.mrp,
            problem: PROBLEMS[invalidOrder.problem] || invalidOrder.problem,
            iptStatus: invalidOrder.iptStatus,
            iptComment: invalidOrder.iptComment,
            wmesUrl: module.config.emailUrlPrefix,
            wmesInvalidOrdersUrl: module.config.emailUrlPrefix + '#invalidOrders',
            wmesOrderUrl: module.config.emailUrlPrefix + '#orders/' + o._id,
            iptCheckOrderUrl: module.config.iptUrl.replace('${order}', o._id)
          };

          this.mrpToInvalidOrders[o.mrp].push(templateData);

          if (o.nc12.startsWith('8'))
          {
            this.etoInvalidOrders.push(templateData);
          }
        });

        if (!_.isEmpty(this.etoInvalidOrders))
        {
          User.find({prodFunction: 'designer_eto'}, {email: 1}).lean().exec(this.next());
        }
        else if (_.isEmpty(this.mrpToInvalidOrders))
        {
          return this.skip();
        }
      },
      function(err, etoDesigners)
      {
        if (err)
        {
          module.error(`Failed to fetch ETO designers: ${err.message}`);
        }

        this.etoRecipients = (etoDesigners || [])
          .filter(u => !!u.email)
          .map(u => u.email);

        request.get(module.config.morUrl, {json: true, timeout: 10000}, this.next());
      },
      function(err, res, body)
      {
        if (err)
        {
          return this.skip(err);
        }

        const recipientToMrps = {};

        _.forEach(body.mrpToRecipients, (recipients, mrp) =>
        {
          if (!this.mrpToInvalidOrders[mrp])
          {
            return;
          }

          recipients.forEach(recipient =>
          {
            if (!recipientToMrps[recipient])
            {
              recipientToMrps[recipient] = [];
            }

            recipientToMrps[recipient].push(mrp);
          });
        });

        _.forEach(recipientToMrps, (mrps, recipient) =>
        {
          const invalidOrders = [];

          mrps.forEach(mrp =>
          {
            this.mrpToInvalidOrders[mrp].forEach(o => invalidOrders.push(o));
          });

          notifyUser(recipient, invalidOrders, this.group());
        });

        if (this.etoRecipients.length)
        {
          sendMail(this.etoRecipients, this.etoInvalidOrders, this.group());
        }
      },
      function(err)
      {
        if (err)
        {
          module.error(`Failed to notify: ${err.message}`);
        }

        if (_.isFunction(done))
        {
          done(err);
        }
      }
    );
  }

  function notifyUser(userId, orders, done)
  {
    User.findById(userId, {email: 1}).lean().exec((err, user) =>
    {
      if (err)
      {
        return done(err);
      }

      if (!user || !user.email)
      {
        return done();
      }

      sendMail(user.email, orders, done);
    });
  }

  function sendMail(to, orders, done)
  {
    const mailOptions = {
      to: to,
      subject: '[WMES] Nieprawidłowe zlecenia IPT: ',
      html: renderEmail({orders: orders})
    };

    if (Array.isArray(to))
    {
      mailOptions.replyTo = to;
    }

    if (orders.length > 4)
    {
      mailOptions.subject += orders.slice(0, 3).map(o => o.no).join(', ') + '...';
    }
    else
    {
      mailOptions.subject += orders.map(o => o.no).join(', ');
    }

    mailSender.send(mailOptions, err =>
    {
      if (err)
      {
        module.error(`Failed to send e-mail to ${mailOptions.to}: ${err.message}`);
      }

      done();
    });
  }
};
