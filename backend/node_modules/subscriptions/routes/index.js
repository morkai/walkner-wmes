// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

module.exports = function setUpSubscriptionsRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const Subscription = mongoose.model('Subscription');
  const User = mongoose.model('User');

  const canView = userModule.auth('USER');
  const canManage = userModule.auth('SUBSCRIPTIONS:MANAGE');

  express.get('/subscriptions', canView, express.crud.browseRoute.bind(null, app, Subscription));
  express.post('/subscriptions', canManage, express.crud.addRoute.bind(null, app, Subscription));
  express.get('/subscriptions/:id', canView, express.crud.readRoute.bind(null, app, Subscription));
  express.put('/subscriptions/:id', canManage, express.crud.editRoute.bind(null, app, Subscription));
  express.delete('/subscriptions/:id', canManage, express.crud.deleteRoute.bind(null, app, Subscription));

  express.get('/subscriptions/:type/:target', canView, readRoute);
  express.post('/subscriptions/:type/:target', canView, toggleRoute);

  function readRoute(req, res, next)
  {
    if (req.query.unsub === '1')
    {
      return toggleRoute(req, res, next);
    }

    const userInfo = userModule.createUserInfo(req.session.user, req);

    step(
      function()
      {
        Subscription
          .findOne({
            user: userInfo.id.toString(),
            type: req.params.type,
            target: req.params.target
          })
          .lean()
          .exec(this.parallel());

        User
          .findById(userInfo.id, {login: 1, firstName: 1, lastName: 1})
          .lean()
          .exec(this.parallel());
      },
      function(err, subscription, user)
      {
        if (err)
        {
          return next(err);
        }

        res.json({subscription, user});
      }
    );
  }

  function toggleRoute(req, res, next)
  {
    const userInfo = userModule.createUserInfo(req.session.user, req);

    step(
      function()
      {
        Subscription
          .findOne({
            user: userInfo.id.toString(),
            type: req.params.type,
            target: req.params.target
          })
          .lean()
          .exec(this.parallel());

        User
          .findById(userInfo.id, {login: 1, firstName: 1, lastName: 1})
          .lean()
          .exec(this.parallel());
      },
      function(err, subscription, user)
      {
        if (err)
        {
          return next(err);
        }

        if (!user)
        {
          return this.skip(app.createError(`User not found.`, 'USER_NOT_FOUND', 400));
        }

        this.oldSubscription = subscription;
        this.user = user;

        if (subscription)
        {
          Subscription.deleteOne({_id: subscription._id}).exec(this.next());
        }
        else if (req.query.unsub !== '1')
        {
          this.newSubscription = new Subscription({
            user: userInfo.id.toString(),
            type: req.params.type,
            target: req.params.target
          });

          this.newSubscription.save(this.next());
        }
      },
      function(err)
      {
        if (err)
        {
          return next(err);
        }

        if (this.oldSubscription)
        {
          res.format({
            json: () =>
            {
              if (req.query.unsub === '1')
              {
                return res.redirect('/');
              }

              res.json({
                action: 'unsubscribe',
                subscription: this.oldSubscription,
                user: this.user
              });
            },
            default: () =>
            {
              res.redirect('/');
            }
          });

          app.broker.publish('subscriptions.deleted', {
            model: this.oldSubscription,
            user: req.session.user
          });
        }
        else if (this.newSubscription)
        {
          res.json({
            action: 'subscribe',
            subscription: this.newSubscription,
            user: this.user
          });

          app.broker.publish('subscriptions.added', {
            model: this.newSubscription,
            user: req.session.user
          });
        }
        else
        {
          res.sendStatus(400);
        }
      }
    );
  }
};
