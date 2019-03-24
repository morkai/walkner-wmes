'use strict';

if (process.env.WMES_PORTS)
{
  try { return module.exports = require(process.env.WMES_PORTS); }
  catch (err) {} // eslint-disable-line no-empty
}

const REPORTS_PUSH_PORT = 28000;

let nextPort = 28010;

module.exports = {
  'wmes-frontend': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'wmes-watchdog': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'wmes-attachments': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'wmes-importer-sap': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'wmes-importer-results': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'wmes-reports-1': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1,
      pushHost: '127.0.0.1',
      pushPort: REPORTS_PUSH_PORT
    }
  },
  'wmes-reports-2': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  },
  'wmes-reports-3': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  },
  'wmes-alerts': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'wmes-planning': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'wmes-reports-4': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  },
  'wmes-help': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  },
  'wmes-reports-5': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  },
  'wmes-reports-6': {
    server: {
      pubHost: '127.0.0.1',
      pubPort: nextPort++,
      repHost: '127.0.0.1',
      repPort: nextPort++,
      pullHost: '127.0.0.1',
      pullPort: REPORTS_PUSH_PORT
    },
    client: {
      pubHost: '127.0.0.1',
      pubPort: nextPort - 2,
      repHost: '127.0.0.1',
      repPort: nextPort - 1
    }
  },
  'wmes-luma2': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++
  }
};
