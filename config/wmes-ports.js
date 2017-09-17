'use strict';

const reportsPushPort = 60000;
let nextPort = 60010;

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
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++,
    pullHost: '127.0.0.1',
    pullPort: reportsPushPort,
    pushHost: '127.0.0.1',
    pushPort: reportsPushPort
  },
  'wmes-reports-2': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++,
    pullHost: '127.0.0.1',
    pullPort: reportsPushPort
  },
  'wmes-reports-3': {
    pubHost: '127.0.0.1',
    pubPort: nextPort++,
    repHost: '127.0.0.1',
    repPort: nextPort++,
    pullHost: '127.0.0.1',
    pullPort: reportsPushPort
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
  }
};
