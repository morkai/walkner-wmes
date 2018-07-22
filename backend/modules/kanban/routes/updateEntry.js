// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const step = require('h5.step');

const updateLocks = new Map();

module.exports = function stateRoute(app, module, req, res, next)
{
  const userModule = app[module.config.userId];
  const mongoose = app[module.config.mongooseId];
  const KanbanEntry = mongoose.model('KanbanEntry');

  const entryId = parseInt(req.params.id, 10);
  const {property, arrayIndex, newValue} = req.body;
  const date = new Date();
  const user = userModule.createUserInfo(req.session.user, req);

  step(
    function()
    {
      lockUpdate(entryId, this.next());
    },
    function()
    {
      module.getState(this.parallel());

      KanbanEntry.findById(entryId, {changes: 1}).lean().exec(this.parallel());
    },
    function(err, state, entryChanges)
    {
      if (err)
      {
        return this.skip(err);
      }

      if (!entryChanges)
      {
        return this.skip(app.createError(`Entry changes not found: ${entryId}`, 'NOT_FOUND', 404));
      }

      const entry = state.maps.entries[entryId];

      if (!entry)
      {
        return this.skip(app.createError(`Entry not found: ${entryId}`, 'NOT_FOUND', 404));
      }

      let oldValue = entry[property];

      if (typeof oldValue === 'undefined')
      {
        return this.skip(app.createError(`Invalid property: ${property}`, 'INPUT', 400));
      }

      let updatePropertyDot = property;
      let updatePropertyUs = property;

      if (arrayIndex >= 0)
      {
        if (!Array.isArray(oldValue) || typeof oldValue[arrayIndex] === 'undefined')
        {
          return this.skip(app.createError(`Invalid array index: ${arrayIndex}`, 'INPUT', 400));
        }

        oldValue = oldValue[arrayIndex];
        updatePropertyDot += `.${arrayIndex}`;
        updatePropertyUs += `_${arrayIndex}`;
      }

      if (newValue === oldValue)
      {
        return this.skip();
      }

      const update = {
        $set: {
          [updatePropertyDot]: newValue,
          [`updates.${updatePropertyUs}`]: {
            date,
            user,
            data: oldValue
          }
        }
      };
      const {changes} = entryChanges;
      const lastChange = changes[changes.length - 1];

      if (lastChange
        && (date - lastChange.date) < 15 * 60 * 1000
        && String(lastChange.user.id) === String(user.id))
      {
        lastChange.date = date;
        lastChange.data[updatePropertyUs] = [
          typeof lastChange.data[updatePropertyUs] === 'undefined' ? oldValue : lastChange.data[updatePropertyUs][0],
          newValue
        ];

        update.$set[`changes.${changes.length - 1}`] = lastChange;
      }
      else
      {
        update.$push = {
          changes: {
            $each: [{
              date,
              user,
              data: {
                [updatePropertyUs]: [oldValue, newValue]
              }
            }]
          }
        };
      }

      this.state = state;
      this.message = {
        entryId,
        property,
        arrayIndex,
        newValue,
        updates: update.$set[`updates.${updatePropertyUs}`]
      };

      KanbanEntry.collection.update({_id: entryId}, update, this.next());
    },
    function(err, result)
    {
      if (err)
      {
        return next(err);
      }

      res.sendStatus(204);

      if (result && result.result.nModified === 1)
      {
        this.state.lists.entries = null;

        app.broker.publish('kanban.entries.updated', this.message);
      }

      unlockUpdate(entryId);
    }
  );
};

function lockUpdate(entryId, done)
{
  if (updateLocks.has(entryId))
  {
    updateLocks.get(entryId).push(done);
  }
  else
  {
    updateLocks.set(entryId, []);

    done();
  }
}

function unlockUpdate(entryId)
{
  const entryLocks = updateLocks.get(entryId);

  if (!entryLocks)
  {
    return;
  }

  if (entryLocks.length === 0)
  {
    updateLocks.delete(entryId);
  }
  else
  {
    setImmediate(entryLocks.shift());
  }
}
