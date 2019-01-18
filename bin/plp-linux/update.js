'use strict';

const {exec} = require('child_process');
const URL = require('url');
const path = require('path');
const net = require('net');
const request = require('request');
const step = require('h5.step');

const LINUX_USER = 'root';
const LINUX_PASS = process.env.WMES_LINUX_PASS || 'r00t';
const PLINK_EXE = path.join(__dirname, 'plink.exe');
const UPDATE_SCRIPT = path.join(__dirname, 'update.sh');
const LOGS_PATH = path.join(process.env.WMES_LOGS_PATH || 'C:\\logs', 'putty');

const startedAt = Date.now();
const inParallel = 5;
const inProgress = new Set();
const remaining = [];

process.argv.forEach(argv =>
{
  if (/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/.test(argv))
  {
    remaining.push({
      _id: argv,
      host: `Update ${remaining.length + 1}`
    });
  }
});

step(
  function()
  {
    const next = this.next();
    const proxyParts = URL.parse(process.env.http_proxy || '');

    if (!proxyParts.host || !proxyParts.port)
    {
      console.log('Not starting the proxy server.');

      return next();
    }

    console.log('Starting the proxy server...');

    const server = this.proxyServer = net.createServer();

    server.on('connection', localSocket =>
    {
      const proxy = net.connect(+proxyParts.port, proxyParts.host);

      proxy.on('connect', function()
      {
        proxy.pipe(localSocket);
        localSocket.pipe(proxy);
      });

      localSocket.on('error', () => {});
      proxy.on('error', () => {});
    });

    server.on('error', () => {});
    server.once('error', finalize);
    server.once('listening', finalize);
    server.once('close', finalize);

    server.listen(8080);

    function finalize(err)
    {
      server.removeListener('error', finalize);
      server.removeListener('listening', finalize);
      server.removeListener('close', finalize);

      next(err);
    }
  },
  function(err)
  {
    if (err && err.code !== 'EADDRINUSE')
    {
      return this.skip(new Error(`Failed to start the proxy: ${err.message}`));
    }

    if (remaining.length)
    {
      console.log('Not fetching the hosts!');

      return next();
    }

    console.log('Fetching the hosts...');

    const url = 'http://127.0.0.1/pings?limit(1000)&sort(-time)'
      + `&time>=${Date.now() - 8 * 3600 * 1000}`
      + `&host=regex=${encodeURIComponent('^(UP|HP|DELL)-')}`;
    const next = this.next();

    request({method: 'GET', url, json: true}, (err, res, body) =>
    {
      if (err)
      {
        return next(err);
      }

      if (res.statusCode !== 200)
      {
        body = require('./pings.json');
      }

      const hosts = new Set();

      if (body && Array.isArray(body.collection))
      {
        body.collection.forEach(client =>
        {
          if (!hosts.has(client.host) || client.host.includes('Default'))
          {
            remaining.push(client);
            hosts.add(client.host);
          }
        });
      }

      next();
    });
  },
  function(err)
  {
    if (err)
    {
      return this.skip(new Error(`Failed to get hosts: ${err.message}`));
    }

    console.log(`Found ${remaining.length} hosts!`);

    remaining.sort((a, b) =>
    {
      const agentA = (a.headers['user-agent'] || '').match(/Chrome\/([0-9]+)/);
      const agentB = (a.headers['user-agent'] || '').match(/Chrome\/([0-9]+)/);

      if (agentA && agentB)
      {
        return parseInt(agentA[1], 10) - parseInt(agentB[1], 10);
      }

      return b.time - a.time;
    });

    const next = this.next();

    for (let i = 0; i < inParallel; ++i)
    {
      updateNext(next);
    }
  },
  function(err)
  {
    if (err)
    {
      console.error(err.message);
    }
    else
    {
      console.log(`Done in ${(Date.now() - startedAt) / 1000}s`);
    }

    if (this.proxyServer)
    {
      this.proxyServer.close(() => {});
    }
  }
);

function updateNext(done)
{
  if (remaining.length === 0)
  {
    if (inProgress.size === 0)
    {
      done();
    }

    return;
  }

  const startedAt = Date.now();
  const client = remaining.shift();

  inProgress.add(client);

  console.log(`${client.host.padEnd(16, ' ')} ${client._id.padEnd(15, ' ')} ...`);

  doUpdate(client._id, () =>
  {
    inProgress.delete(client);

    console.log(`${client.host.padEnd(16, ' ')} ${client._id.padEnd(15, ' ')} ${(Date.now() - startedAt) / 1000}`);

    updateNext(done);
  });
}

function doUpdate(ip, done)
{
  const cmd = [
    `echo y | "${PLINK_EXE}"`,
    `-pw "${LINUX_PASS}"`,
    `-m "${UPDATE_SCRIPT}"`,
    `${LINUX_USER}@"${ip}"`,
    `> "${path.join(LOGS_PATH, `${ip}.txt`)}" 2>&1`
  ];

  exec(cmd.join(' '), {timeout: 10 * 60 * 1000}, done);
}
