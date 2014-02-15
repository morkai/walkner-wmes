'use strict';

var step = require('h5.step');
var mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');

var CSV_COLUMN_SEPARATOR = ';';
var CSV_ROW_SEPARATOR = '\r\n';
var CSV_FORMATTERS = {
  '"': function(value)
  {
    return '"' + value + '"';
  },
  '#': function(value)
  {
    return Number(value).toFixed(3).replace('.', ',');
  }
};

exports.browseRoute = function(app, Model, req, res, next)
{
  var queryOptions = mongoSerializer.fromQuery(req.rql);

  if (queryOptions.limit === 0)
  {
    queryOptions.limit = typeof Model.BROWSE_LIMIT === 'number' ? Model.BROWSE_LIMIT : 100;
  }

  step(
    function countStep()
    {
      Model.count(queryOptions.selector, this.next());
    },
    function findStep(err, totalCount)
    {
      if (err)
      {
        return this.done(next, err);
      }

      this.totalCount = totalCount;

      if (totalCount > 0)
      {
        var query = Model.find(queryOptions.selector, queryOptions.fields, queryOptions).lean();

        try
        {
          populateQuery(query, req.rql);
        }
        catch (err)
        {
          return this.done(next, err);
        }

        query.exec(this.next());
      }
    },
    function sendResponseStep(err, models)
    {
      if (err)
      {
        return this.done(next, err);
      }

      var totalCount = this.totalCount;

      if (typeof Model.customizeLeanObject === 'function' && totalCount > 0)
      {
        models = models.map(function(leanModel)
        {
          return Model.customizeLeanObject(leanModel, queryOptions.fields);
        });
      }

      res.format({
        json: function()
        {
          res.json({
            totalCount: totalCount,
            collection: models
          });
        }
      });
    }
  );
};

exports.addRoute = function(app, Model, req, res, next)
{
  var model = new Model(req.body);

  model.save(function(err)
  {
    if (err)
    {
      return next(err);
    }

    res.format({
      json: function()
      {
        res.send(201, model);
      }
    });

    app.broker.publish((Model.TOPIC_PREFIX || Model.collection.name) + '.added', {
      model: model.toJSON(),
      user: req.session.user
    });
  });
};

exports.readRoute = function(app, Model, req, res, next)
{
  var query = Model.findById(req.params.id);

  try
  {
    populateQuery(query, req.rql);
  }
  catch (err)
  {
    return next(err);
  }

  query.exec(function(err, model)
  {
    if (err)
    {
      return next(err);
    }

    if (model === null)
    {
      return res.send(404);
    }

    res.format({
      json: function()
      {
        try
        {
          res.send(model);
        }
        catch (err)
        {
          next(err);
        }
      }
    });
  });
};

exports.editRoute = function(app, Model, req, res, next)
{
  Model.findById(req.params.id, function(err, model)
  {
    if (err)
    {
      return next(err);
    }

    if (model === null)
    {
      return res.send(404);
    }

    model.set(req.body);
    model.save(function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.format({
        json: function()
        {
          res.send(model);
        }
      });

      app.broker.publish((Model.TOPIC_PREFIX || Model.collection.name) + '.edited', {
        model: model.toJSON(),
        user: req.session.user
      });
    });
  });
};

exports.deleteRoute = function(app, Model, req, res, next)
{
  Model.findById(req.params.id, function(err, model)
  {
    if (err)
    {
      return next(err);
    }

    if (model === null)
    {
      return res.send(404);
    }

    model.remove(function(err)
    {
      if (err)
      {
        return next(err);
      }

      res.format({
        json: function()
        {
          res.send(204);
        }
      });

      app.broker.publish((Model.TOPIC_PREFIX || Model.collection.name) + '.deleted', {
        model: model.toJSON(),
        user: req.session.user
      });
    });
  });
};

exports.exportRoute = function(filename, serializeRow, Model, req, res, next)
{
  var queryOptions = mongoSerializer.fromQuery(req.rql);
  var headerWritten = false;
  var columnNames = null;

  var queryStream = Model
    .find(queryOptions.selector, queryOptions.fields)
    .sort(queryOptions.sort)
    .lean()
    .stream();

  queryStream.on('error', next);

  queryStream.on('close', function()
  {
    writeHeader();
    res.end();
  });

  queryStream.on('data', function(doc)
  {
    var row = serializeRow(doc);

    if (!row)
    {
      return;
    }

    if (columnNames === null)
    {
      columnNames = Object.keys(row);
    }

    writeHeader();

    var line = columnNames
      .map(function(columnName)
      {
        var formatter = CSV_FORMATTERS[columnName.charAt(0)];

        return formatter ? formatter(row[columnName]) : row[columnName];
      })
      .join(CSV_COLUMN_SEPARATOR);

    res.write(line + CSV_ROW_SEPARATOR);
  });

  function writeHeader()
  {
    if (headerWritten)
    {
      return;
    }

    res.attachment(filename + '.csv');

    var line = columnNames
      .map(function(columnName)
      {
        return CSV_FORMATTERS[columnName.charAt(0)] ? columnName.substr(1) : columnName;
      })
      .join(CSV_COLUMN_SEPARATOR);

    res.write(line + CSV_ROW_SEPARATOR);

    headerWritten = true;
  }
};

function populateQuery(query, rql)
{
  rql.selector.args.forEach(function(term)
  {
    if (term.name === 'populate' && term.args.length > 0)
    {
      if (Array.isArray(term.args[1]))
      {
        query.populate(term.args[0], term.args[1].join(' '));
      }
      else
      {
        query.populate(term.args[0]);
      }
    }
  });
}
