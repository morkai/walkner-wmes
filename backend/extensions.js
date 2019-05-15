// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

/* eslint-disable no-extend-native */

'use strict';

const util = require('util');

Object.defineProperty(Error.prototype, 'toJSON', {
  configurable: false,
  enumerable: false,
  writable: true,
  value: function()
  {
    const error = this;
    const result = {
      message: error.message,
      stack: error.stack
    };
    const keys = Object.keys(error);

    for (let i = 0; i < keys.length; ++i)
    {
      const key = keys[i];

      result[key] = error[key];
    }

    return result;
  }
});

console.inspect = function(value, depth, colors)
{
  console.log(util.inspect(value, {depth: depth || null, colors: colors !== false}));
};

console.bench = function(label, context, func)
{
  const time = process.hrtime();
  const result = func.call(context);
  const diff = process.hrtime(time);

  console.log(`[bench] ${label} ${(diff[0] * 1e9 + diff[1]) / 1e6} ms`);

  return result;
};

if (process.env.NODE_ENV === 'development')
{
  const chalk = require('chalk');
  const SEVERITY_COLORS = {
    debug: chalk.bgRgb(255, 255, 255).rgb(0, 0, 0),
    info: chalk.bgRgb(0, 0, 255).rgb(255, 255, 255),
    warn: chalk.bgYellowBright.rgb(0, 0, 0),
    error: chalk.bgRgb(255, 0, 0).rgb(255, 255, 255)
  };

  Object.assign(util.inspect.styles, {
    name: 'white',
    date: 'yellow'
  });

  require('h5.main/lib/utils/log').write = (log) =>
  {
    let line = `>>> ${log.severity.padEnd(5)} ${log.time.toISOString()}`;

    if (log.module)
    {
      line += ` [${log.module}]`;
    }

    if (log.submodule)
    {
      line += ` [${log.submodule}]`;
    }

    let errorStack = log.error ? log.error.stack : '';

    if (log.message)
    {
      line += ` ${String(log.message).toString().trim()}`;
    }
    else if (errorStack)
    {
      const matches = errorStack.match(/^(?:Error:\s*)?(.*?)(\s{2,}at .*?)?$/s);

      if (matches)
      {
        line += ` ${matches[1].trim()}`;
        errorStack = (matches[2] || '').trim();

        if (errorStack)
        {
          errorStack = `    ${errorStack}`;
        }
      }
      else
      {
        line += ` ${errorStack.trim()}`;
        errorStack = '';
      }
    }

    const severityColors = SEVERITY_COLORS[log.severity];

    if (chalk && severityColors)
    {
      console.log(severityColors(line));
    }
    else
    {
      console.log(line);
    }

    if (log.error)
    {
      delete log.error.message;
      delete log.error.stack;
      delete log.error.code;
      delete log.error.statusCode;

      if (!Object.keys(log.error).length)
      {
        delete log.error;
      }
    }

    if (errorStack)
    {
      console.log(errorStack);
    }

    delete log.appId;
    delete log.severity;
    delete log.time;
    delete log.module;
    delete log.submodule;
    delete log.message;

    if (Object.keys(log).length)
    {
      console.log(chalk.rgb(255, 255, 255)(util.inspect(log, {colors: true})));
    }
  };
}
