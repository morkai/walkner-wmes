// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

'use strict';

var path = require('path');
var fs = require('fs');
var spawn = require('child_process').spawn;
var _ = require('lodash');
var step = require('h5.step');
var moment = require('moment');
var multer = require('multer');
var gm = require('gm');
var report = require('./report');

module.exports = function setUpOpinionSurveysRoutes(app, opinionSurveysModule)
{
  var express = app[opinionSurveysModule.config.expressId];
  var userModule = app[opinionSurveysModule.config.userId];
  var mongoose = app[opinionSurveysModule.config.mongooseId];
  var settings = app[opinionSurveysModule.config.settingsId];
  var reportsModule = app[opinionSurveysModule.config.reportsId];
  var OpinionSurvey = mongoose.model('OpinionSurvey');
  var OpinionSurveyResponse = mongoose.model('OpinionSurveyResponse');
  var OpinionSurveyAction = mongoose.model('OpinionSurveyAction');

  var canView = userModule.auth();
  var canManage = userModule.auth('OPINION_SURVEYS:MANAGE');

  express.get('/opinion', sendCurrentSurveyRoute);

  express.get('/opinionSurveys/dictionaries', canView, dictionariesRoute);

  express.get(
    '/opinionSurveys/settings',
    canView,
    function limitToOpinionSurveysSettings(req, res, next)
    {
      req.rql.selector = {
        name: 'regex',
        args: ['_id', '^opinionSurveys\\.']
      };

      return next();
    },
    express.crud.browseRoute.bind(null, app, settings.Setting)
  );
  express.put('/opinionSurveys/settings/:id', canManage, settings.updateRoute);

  express.get(
    '/opinionSurveys/report',
    canView,
    reportsModule.helpers.sendCachedReport.bind(null, 'opinionSurvey'),
    reportRoute
  );

  express.get('/opinionSurveys/qr', sendQrCodeRoute);
  express.post('/opinionSurveys/preview', canManage, saveSurveyPreviewRoute);
  express.get('/opinionSurveys/:id.pdf', sendSurveyPdfRoute);
  express.get('/opinionSurveys/:id.html', sendSurveyHtmlRoute);

  setUpCrudRoutes(canView, 'OpinionSurvey', 'surveys');

  express.get('/opinionSurveys/scanTemplates/:id.jpg', sendScanTemplateJpgRoute);
  express.post(
    '/opinionSurveys/scanTemplates;uploadImage',
    canManage,
    multer({
      putSingleFilesInArray: true,
      limits: {
        files: 1,
        fileSize: '5mb'
      }
    }),
    uploadImageRoute
  );
  setUpCrudRoutes(canManage, 'OpinionSurveyScanTemplate', 'scanTemplates');

  express.get(
    '/opinionSurveys/responses',
    canView,
    express.crud.browseRoute.bind(null, app, OpinionSurveyResponse)
  );
  express.post(
    '/opinionSurveys/responses',
    userModule.auth('LOCAL', 'OPINION_SURVEYS:MANAGE'),
    prepareResponseForAdd,
    express.crud.addRoute.bind(null, app, OpinionSurveyResponse)
  );
  express.get(
    '/opinionSurveys/responses/:id',
    canView,
    express.crud.readRoute.bind(null, app, OpinionSurveyResponse)
  );
  express.put(
    '/opinionSurveys/responses/:id',
    canManage,
    express.crud.editRoute.bind(null, app, OpinionSurveyResponse)
  );
  express.delete(
    '/opinionSurveys/responses/:id',
    canManage,
    express.crud.deleteRoute.bind(null, app, OpinionSurveyResponse)
  );

  express.get(
    '/opinionSurveys/actions',
    canView,
    express.crud.browseRoute.bind(null, app, OpinionSurveyAction)
  );
  express.post(
    '/opinionSurveys/actions',
    canView,
    canManageAction,
    prepareActionForAdd,
    express.crud.addRoute.bind(null, app, OpinionSurveyAction)
  );
  express.get(
    '/opinionSurveys/actions/:id',
    canView,
    express.crud.readRoute.bind(null, app, OpinionSurveyAction)
  );
  express.get('/opinionSurveys/actions;rid', canView, findActionByRidRoute);
  express.put(
    '/opinionSurveys/actions/:id',
    canView,
    canManageAction,
    prepareActionForEdit,
    express.crud.editRoute.bind(null, app, OpinionSurveyAction)
  );
  express.delete(
    '/opinionSurveys/actions/:id',
    canManage,
    express.crud.deleteRoute.bind(null, app, OpinionSurveyAction)
  );

  _.forEach(opinionSurveysModule.DICTIONARIES, setUpCrudRoutes.bind(null, canManage));

  express.get('/r/opinions/:filter', redirectToListRoute);
  express.get('/r/opinion/:rid', redirectToDetailsRoute);

  function setUpCrudRoutes(canView, modelName, dictionaryName)
  {
    var Model = mongoose.model(modelName);
    var urlPrefix = '/opinionSurveys/' + dictionaryName;

    express.get(urlPrefix, canView, express.crud.browseRoute.bind(null, app, Model));
    express.post(urlPrefix, canManage, express.crud.addRoute.bind(null, app, Model));
    express.get(urlPrefix + '/:id', canView, express.crud.readRoute.bind(null, app, Model));
    express.put(urlPrefix + '/:id', canManage, express.crud.editRoute.bind(null, app, Model));
    express.delete(urlPrefix + '/:id', canManage, express.crud.deleteRoute.bind(null, app, Model));
  }

  function dictionariesRoute(req, res, next)
  {
    var results = {};

    step(
      function findSettingsStep()
      {
        settings.find({_id: /^opinionSurveys/}, this.next());
      },
      function handleFindSettingsResultStep(err, settings)
      {
        if (err)
        {
          return this.skip(err);
        }

        results.settings = settings;
      },
      function findDictionariesStep()
      {
        var step = this;

        _.forEach(opinionSurveysModule.DICTIONARIES, function(modelName)
        {
          mongoose.model(modelName).find().lean().exec(step.group());
        });
      },
      function sendResultStep(err, dictionaries)
      {
        if (err)
        {
          return next(err);
        }

        _.forEach(Object.keys(opinionSurveysModule.DICTIONARIES), function(dictionaryName, i)
        {
          results[dictionaryName] = dictionaries[i];
        });

        res.json(results);
      }
    );
  }

  function sendCurrentSurveyRoute(req, res, next)
  {
    var currentDate = moment().startOf('day').toDate();
    var currentSurvey = null;

    step(
      function findCurrentSurveyStep()
      {
        var conditions = {
          startDate: {$lte: currentDate},
          endDate: {$gte: currentDate}
        };

        OpinionSurvey.findOne(conditions).sort({startDate: -1}).lean().exec(this.next());
      },
      function findNextSurveyStep(err, survey)
      {
        if (err)
        {
          return this.skip(err);
        }

        if (survey)
        {
          currentSurvey = survey;

          return;
        }

        OpinionSurvey.findOne({startDate: {$gte: currentDate}}).sort({startDate: 1}).lean().exec(this.next());
      },
      function sendCurrentSurveyStep(err, nextSurvey)
      {
        if (err)
        {
          return next(err);
        }

        res.format({
          json: function()
          {
            if (currentSurvey)
            {
              res.send(currentSurvey);
            }
            else
            {
              res.sendStatus(404);
            }
          },
          html: function()
          {
            if (currentSurvey)
            {
              res.render('opinionSurveys:current', {
                cache: false,
                moment: moment,
                survey: currentSurvey
              });
            }
            else
            {
              res.render('opinionSurveys:closed', {
                cache: false,
                moment: moment,
                survey: nextSurvey
              });
            }
          }
        });
      }
    );
  }

  function sendQrCodeRoute(req, res, next)
  {
    if (!/^[A-Za-z0-9-_/]+$/.test(req.query.data))
    {
      return next(express.createHttpError('INVALID_DATA', 400));
    }

    res.type('png');

    var args = [
      '-b', 58,
      '--vers=5',
      '--scale=1.5',
      '--directpng',
      '--data="' + req.query.data + '"'
    ];

    var p = spawn(opinionSurveysModule.config.zintExe, args);

    p.on('error', next);

    p.stdout.pipe(res);
  }

  function sendSurveyPdfRoute(req, res, next)
  {
    var surveyId = req.params.id;
    var surveyPdfFile = path.join(opinionSurveysModule.config.surveysPath, surveyId + '.pdf');
    var customPdfFile = path.join(opinionSurveysModule.config.surveysPath, surveyId + '.custom.pdf');
    var recreate = req.query.recreate;
    var custom = req.query.custom;

    step(
      function statFileStep()
      {
        if (recreate === '1')
        {
          return;
        }

        var surveyDone = this.parallel();
        var customDone = this.parallel();

        fs.stat(surveyPdfFile, function(err, stats) { surveyDone(null, stats); });
        fs.stat(customPdfFile, function(err, stats) { customDone(null, stats); });
      },
      function checkExistenceStep(err, surveyStats, customStats)
      {
        if (recreate === '1')
        {
          return opinionSurveysModule.buildSurveyPdf(surveyId, surveyPdfFile, this.next());
        }

        if (custom === '1')
        {
          if (customStats)
          {
            return this.skip(null, customPdfFile);
          }

          return this.skip(express.createHttpError('NOT_FOUND', 404));
        }

        if (custom === '0')
        {
          if (surveyStats)
          {
            return this.skip(null, surveyPdfFile);
          }

          return this.skip(express.createHttpError('NOT_FOUND', 404));
        }

        if (customStats)
        {
          return this.skip(null, customPdfFile);
        }

        if (surveyStats)
        {
          return this.skip(null, surveyPdfFile);
        }

        return opinionSurveysModule.buildSurveyPdf(surveyId, surveyPdfFile, this.next());
      },
      function sendFileStep(err, pdfFile)
      {
        if (err)
        {
          return next(err);
        }

        res.type('pdf');
        res.sendFile(pdfFile);

        if (/^PREVIEW/.test(surveyId))
        {
          setTimeout(fs.unlink.bind(fs, pdfFile, function() {}), 30000);
        }
      }
    );
  }

  function saveSurveyPreviewRoute(req, res, next)
  {
    var key = req.body._id = _.uniqueId('PREVIEW-' + Date.now().toString(36) + '-').toUpperCase();
    var survey = new OpinionSurvey(req.body);

    survey.validate(function(err)
    {
      if (err)
      {
        return next(err);
      }

      opinionSurveysModule.surveyPreviews[key] = survey.toJSON();

      res.json(key);

      setTimeout(function() { delete opinionSurveysModule.surveyPreviews[key]; }, 30000);
    });
  }

  function sendSurveyHtmlRoute(req, res, next)
  {
    var template = req.query.template;

    if (!_.isString(template) || !/^[a-z0-9-]+$/i.test(template))
    {
      return next(express.createHttpError('INVALID_TEMPLATE', 400));
    }

    var id = req.params.id;

    step(
      function()
      {
        if (/^PREVIEW/.test(id))
        {
          setImmediate(this.next(), null, opinionSurveysModule.surveyPreviews[id]);
        }
        else
        {
          OpinionSurvey.findById(req.params.id).lean().exec(this.next());
        }
      },
      function(err, survey)
      {
        if (err)
        {
          return next(err);
        }

        if (!survey)
        {
          return next(express.createHttpError('NOT_FOUND', 404));
        }

        res.render('opinionSurveys:' + template, {
          cache: false,
          moment: moment,
          survey: survey
        });
      }
    );
  }

  function findActionByRidRoute(req, res, next)
  {
    var rid = parseInt(req.query.rid, 10);

    if (isNaN(rid) || rid <= 0)
    {
      return res.sendStatus(400);
    }

    OpinionSurveyAction.findOne({rid: rid}, {_id: 1}).lean().exec(function(err, action)
    {
      if (err)
      {
        return next(err);
      }

      if (action)
      {
        return res.json(action._id);
      }

      return res.sendStatus(404);
    });
  }

  function reportRoute(req, res, next)
  {
    var options = {};

    _.forEach(['surveys', 'divisions', 'superiors', 'employers'], function(prop)
    {
      var value = req.query[prop];

      options[prop] = _.isString(value) && !_.isEmpty(value) ? value.split(',') : [];
    });

    reportsModule.helpers.generateReport(
      app,
      reportsModule,
      report,
      'opinionSurvey',
      req.reportHash,
      options,
      function(err, reportJson)
      {
        if (err)
        {
          return next(err);
        }

        res.type('json');
        res.send(reportJson);
      }
    );
  }

  function redirectToListRoute(req, res)
  {
    res.redirect('/#opinionSurveyActions');
  }

  function redirectToDetailsRoute(req, res, next)
  {
    OpinionSurveyAction.findOne({rid: parseInt(req.params.rid, 10)}, {_id: 1}).lean().exec(function(err, action)
    {
      if (err)
      {
        return next(err);
      }

      if (action)
      {
        return res.redirect('/#opinionSurveyActions/' + action._id);
      }

      return res.sendStatus(404);
    });
  }

  function sendScanTemplateJpgRoute(req, res, next)
  {
    if (!/^[a-z0-9]+$/.test(req.params.id))
    {
      return next(express.createHttpError('INVALID_ID'), 400);
    }

    res.sendFile(path.join(opinionSurveysModule.config.templatesPath, req.params.id + '.jpg'));
  }

  function uploadImageRoute(req, res, next)
  {
    var file = Array.isArray(req.files.image) ? req.files.image[0] : null;
    var imageId = Date.now().toString(36) + Math.round(1000000000 + Math.random() * 8999999999).toString(36);
    var templatePath = path.join(opinionSurveysModule.config.templatesPath, imageId + '.jpg');

    step(
      function deskewStep()
      {
        if (!file || !/^image/.test(file.mimetype))
        {
          return this.skip(new Error('INVALID_MIME_TYPE'));
        }

        opinionSurveysModule.deskewImage(file.path, file.path, this.next());
      },
      function resizeStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        gm(file.path)
          .autoOrient()
          .quality(100)
          .resize(1280)
          .noProfile()
          .write(templatePath, this.next());
      },
      function getSizeStep(err)
      {
        if (err)
        {
          return this.skip(err);
        }

        gm(templatePath).size(this.next());
      },
      function finalizeStep(err, size)
      {
        if (err)
        {
          fs.unlink(templatePath, _.noop);

          next(err);
        }
        else
        {
          res.json({
            image: imageId,
            width: size.width,
            height: size.height
          });
        }

        if (file)
        {
          fs.unlink(file.path, _.noop);
        }
      }
    );
  }

  function prepareResponseForAdd(req, res, next)
  {
    _.assign(req.body, {
      _id: (new mongoose.Types.ObjectId()).toString(),
      creator: userModule.createUserInfo(req.session.user, req),
      createdAt: new Date()
    });

    if (req.query.guest)
    {
      req.body.creator.label = '?';
    }

    next();
  }

  function canManageAction(req, res, next)
  {
    var user = req.session.user;

    if (user.super || _.includes(user.privileges, 'OPINION_SURVEYS:MANAGE') || user.prodFunction === 'manager')
    {
      return next();
    }

    var conditions = {
      _id: req.body.survey,
      'superiors._id': user._id
    };

    OpinionSurvey.findOne(conditions, {_id: 1}).lean().exec(function(err, survey)
    {
      if (err)
      {
        return next(err);
      }

      if (!survey)
      {
        return res.sendStatus(403);
      }

      return next();
    });
  }

  function prepareActionForAdd(req, res, next)
  {
    _.assign(req.body, {
      creator: userModule.createUserInfo(req.session.user, req),
      createdAt: new Date()
    });

    next();
  }

  function prepareActionForEdit(req, res, next)
  {
    _.assign(req.body, {
      updater: userModule.createUserInfo(req.session.user, req),
      updatedAt: new Date()
    });

    next();
  }
};
