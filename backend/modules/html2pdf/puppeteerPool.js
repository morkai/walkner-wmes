// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

'use strict';

const lightningPool = require('lightning-pool');
const puppeteer = require('puppeteer');

module.exports = function setUpPuppeteerPool(app, module)
{
  const options = Object.assign({
    min: 2,
    max: 5,
    idleTimeoutMillis: 30000
  }, module.config.puppeteerPoolOptions);

  const factory = {
    create: () =>
    {
      return new Promise((resolve, reject) =>
      {
        puppeteer.launch(module.config.puppeteerLaunchOptions).then(resolve, reject);
      });
    },
    destroy: browser =>
    {
      return new Promise((resolve, reject) =>
      {
        browser.close().then(resolve, reject);
      });
    },
    reset: browser =>
    {
      return new Promise((resolve, reject) =>
      {
        browser.pages()
          .then(
            pages => Promise.all(pages.map(page => page.close())),
            reject
          )
          .then(resolve, reject);
      });
    }
  };

  module.puppeteerPool = lightningPool.createPool(factory, options);
};
