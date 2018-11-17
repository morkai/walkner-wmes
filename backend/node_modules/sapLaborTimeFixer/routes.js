// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const {createHash} = require('crypto');
const {exec} = require('child_process');
const multer = require('multer');

module.exports = function setUpSapLaborTimeFixerRoutes(app, module)
{
  const express = app[module.config.expressId];
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];

  const XData = mongoose.model('XData');

  const canView = userModule.auth('ORDERS:VIEW');
  const canManage = userModule.auth('ORDERS:MANAGE');

  express.get('/sapLaborTimeFixer/xData', canView, express.crud.browseRoute.bind(null, app, XData));

  express.post(
    '/sapLaborTimeFixer/xData',
    canManage,
    multer({
      storage: multer.diskStorage({}),
      fileFilter: function(req, file, done)
      {
        return done(null, /xlsx?$/i.test(file.originalname)
          && (file.mimetype === 'application/vnd.ms-excel'
            || file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'));
      }
    }).single('xData'),
    (req, res, next) =>
    {
      if (!req.file)
      {
        return next(app.createError('INVALID_FILE', 400));
      }

      parseXData(req.file.path, (err, result) =>
      {
        if (err)
        {
          return next(app.createError(err.message, 'PARSE_FAILURE', 500));
        }

        if (!result.json)
        {
          return res.json({_id: result.hash});
        }

        req.body._id = result.hash;
        req.body.createdAt = new Date();
        req.body.creator = userModule.createUserInfo(req.session.user, req);
        req.body.title = req.file.originalname.replace(/\.xlsx?$/i, '');
        req.body.data = result.json;

        next();
      });
    },
    express.crud.addRoute.bind(null, app, XData)
  );

  express.get('/sapLaborTimeFixer/xData/:id', canView, express.crud.readRoute.bind(null, app, XData));

  express.put('/sapLaborTimeFixer/xData/:id', canManage, express.crud.editRoute.bind(null, app, XData));

  express.delete('/sapLaborTimeFixer/xData/:id', canManage, express.crud.deleteRoute.bind(null, app, XData));

  function parseXData(filePath, done)
  {
    const command = `"${module.config.parserExe}" "${filePath}"`;
    const options = {
      maxBuffer: 10 * 1024 * 1024
    };

    exec(command, options, (err, stdout, stderr) =>
    {
      if (err)
      {
        return done(err);
      }

      if (stderr)
      {
        return done(app.createError(stderr));
      }

      if (!stdout)
      {
        return done(app.createError('Empty?!'));
      }

      const hash = createHash('md5').update(stdout).digest('hex');
      let json = null;

      XData.findById(hash, {_id: 1}).lean().exec((err, xData) =>
      {
        if (err)
        {
          return done(err);
        }

        if (!xData)
        {
          try
          {
            json = JSON.parse(stdout);
          }
          catch (err)
          {
            return done(err);
          }
        }

        done(null, {hash, json});
      });
    });
  }
};
