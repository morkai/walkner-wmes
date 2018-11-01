// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpIsaShiftPersonnel(app, isaModule)
{
  const mongoose = app[isaModule.config.mongooseId];
  const fteModule = app[isaModule.config.fteId];

  const IsaShiftPersonnel = mongoose.model('IsaShiftPersonnel');
  const IsaEvent = mongoose.model('IsaEvent');

  isaModule.getShiftPersonnel = getShiftPersonnel;
  isaModule.updateShiftPersonnel = updateShiftPersonnel;

  app.broker.subscribe('app.started', loadShiftPersonnel);

  function loadShiftPersonnel()
  {
    getShiftPersonnel(fteModule.currentShift.date, function(err, shiftPersonnel)
    {
      if (err)
      {
        isaModule.error('Failed to load the shift personnel: %s', err.message);
      }
      else
      {
        app.broker.publish('isaShiftPersonnel.updated', shiftPersonnel);
      }
    });
  }

  function getShiftPersonnel(shiftDate, done)
  {
    if (!shiftDate)
    {
      shiftDate = fteModule.currentShift.date;
    }

    IsaShiftPersonnel.findById(shiftDate).lean().exec(function(err, shiftPersonnel)
    {
      if (err)
      {
        return done(err);
      }

      if (!shiftPersonnel)
      {
        return done(null, {
          _id: shiftDate,
          users: [],
          updatedAt: new Date()
        });
      }

      return done(null, shiftPersonnel);
    });
  }

  function updateShiftPersonnel(shiftDate, users, updater, done)
  {
    const update = {
      _id: shiftDate || fteModule.currentShift.date,
      users: users || [],
      updatedAt: new Date()
    };
    const conditions = {
      _id: update._id
    };
    const options = {
      upsert: true,
      returnOriginal: false
    };

    IsaShiftPersonnel.findOneAndUpdate(conditions, update, options, function(err, shiftPersonnel)
    {
      done(err, shiftPersonnel);

      if (shiftPersonnel)
      {
        app.broker.publish('isaShiftPersonnel.updated', shiftPersonnel);

        recordEvent(updater, shiftPersonnel);
      }
    });
  }

  function recordEvent(updater, shiftPersonnel)
  {
    const event = new IsaEvent({
      requestId: null,
      orgUnits: [],
      type: 'shiftPersonnelUpdated',
      time: shiftPersonnel.updatedAt,
      user: updater,
      data: {
        shiftDate: shiftPersonnel._id,
        users: shiftPersonnel.users
      }
    });

    event.save(function(err)
    {
      if (err)
      {
        isaModule.error('Failed to save event [%s]: %s', event.type, err.message);
      }
    });
  }
};
