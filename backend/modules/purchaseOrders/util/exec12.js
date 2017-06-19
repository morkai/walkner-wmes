// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

/* jshint unused:false*/

'use strict';

// Extracted from https://github.com/joyent/node/blob/9b8837b3554cb38fe9412922f064529329f5fff7/lib/child_process.js

const util = require('util');
const spawn = require('child_process').spawn;

function normalizeExecArgs(command /* , options, callback */)
{
  let file, args, options, callback;

  if (typeof arguments[1] === 'function')
  {
    options = undefined;
    callback = arguments[1];
  }
  else
  {
    options = arguments[1];
    callback = arguments[2];
  }

  if (process.platform === 'win32')
  {
    file = process.env.comspec || 'cmd.exe';
    args = ['/s', '/c', '"' + command + '"'];
    // Make a shallow copy before patching so we don't clobber the user's
    // options object.
    options = util._extend({}, options);
    options.windowsVerbatimArguments = true;
  }
  else
  {
    file = '/bin/sh';
    args = ['-c', command];
  }

  if (options && options.shell)
  {
    file = options.shell;
  }

  return {
    cmd: command,
    file: file,
    args: args,
    options: options,
    callback: callback
  };
}

exports.exec = function(command /* , options, callback */)
{
  const opts = normalizeExecArgs.apply(null, arguments);
  return exports.execFile(opts.file,
    opts.args,
    opts.options,
    opts.callback);
};

exports.execFile = function(file /* args, options, callback */)
{
  let args, callback;
  let options = {
    encoding: 'utf8',
    timeout: 0,
    maxBuffer: 200 * 1024,
    killSignal: 'SIGTERM',
    cwd: null,
    env: null
  };

  // Parse the parameters.

  if (typeof arguments[arguments.length - 1] === 'function')
  {
    callback = arguments[arguments.length - 1];
  }

  if (util.isArray(arguments[1]))
  {
    args = arguments[1];
    options = util._extend(options, arguments[2]);
  }
  else
  {
    args = [];
    options = util._extend(options, arguments[1]);
  }

  const child = spawn(file, args, {
    cwd: options.cwd,
    env: options.env,
    gid: options.gid,
    uid: options.uid,
    windowsVerbatimArguments: !!options.windowsVerbatimArguments
  });

  let encoding;
  let _stdout;
  let _stderr;
  if (options.encoding !== 'buffer' && Buffer.isEncoding(options.encoding))
  {
    encoding = options.encoding;
    _stdout = '';
    _stderr = '';
  }
  else
  {
    _stdout = [];
    _stderr = [];
    encoding = null;
  }
  let stdoutLen = 0;
  let stderrLen = 0;
  let killed = false;
  let exited = false;
  let timeoutId;

  let ex = null;

  function exithandler(code, signal)
  {
    if (exited)
    {
      return;
    }

    exited = true;

    if (timeoutId)
    {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    if (!callback)
    {
      return;
    }

    // merge chunks
    let stdout;
    let stderr;
    if (!encoding)
    {
      stdout = Buffer.concat(_stdout);
      stderr = Buffer.concat(_stderr);
    }
    else
    {
      stdout = _stdout;
      stderr = _stderr;
    }

    if (!ex && code === 0 && signal === null)
    {
      callback(null, stdout, stderr);
      return;
    }

    let cmd = file;
    if (args.length !== 0)
    {
      cmd += ' ' + args.join(' ');
    }

    if (!ex)
    {
      ex = new Error('Command failed: ' + cmd + '\n' + stderr);
      ex.killed = child.killed || killed;
      ex.code = code;
      ex.signal = signal;
    }

    ex.cmd = cmd;
    callback(ex, stdout, stderr);
  }

  function errorhandler(e)
  {
    ex = e;
    child.stdout.destroy();
    child.stderr.destroy();
    exithandler();
  }

  function kill()
  {
    child.stdout.destroy();
    child.stderr.destroy();

    killed = true;
    try
    {
      child.kill(options.killSignal);
    }
    catch (e)
    {
      ex = e;
      exithandler();
    }
  }

  if (options.timeout > 0)
  {
    timeoutId = setTimeout(function()
    {
      kill();
      timeoutId = null;
    }, options.timeout);
  }

  child.stdout.addListener('data', function(chunk)
  {
    stdoutLen += chunk.length;

    if (stdoutLen > options.maxBuffer)
    {
      ex = new Error('stdout maxBuffer exceeded.');
      kill();
    }
    else
    if (!encoding)
    {
      _stdout.push(chunk);
    }
    else
    {
      _stdout += chunk;
    }
  });

  child.stderr.addListener('data', function(chunk)
  {
    stderrLen += chunk.length;

    if (stderrLen > options.maxBuffer)
    {
      ex = new Error('stderr maxBuffer exceeded.');
      kill();
    }
    else
    if (!encoding)
    {
      _stderr.push(chunk);
    }
    else
    {
      _stderr += chunk;
    }
  });

  if (encoding)
  {
    child.stderr.setEncoding(encoding);
    child.stdout.setEncoding(encoding);
  }

  child.addListener('close', exithandler);
  child.addListener('error', errorhandler);

  return child;
};
