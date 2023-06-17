'use strict'

const fs = require('fs');
const minor = require('./MinorLotto');
const major = require('./MajorLotto');
const puppeteer = require('puppeteer-extra')

puppeteer.use(require('puppeteer-extra-plugin-stealth')());
const global = JSON.parse(fs.readFileSync('./global.json', 'utf8'));

class LottoScraper {
    constructor (opts = { }) {
      this._opts = opts;
    }

    async browser () {
        if (!this._browser) {
          this._browser = this._opts.browser || await puppeteer.launch(this._opts);
        }
    
        return this._browser;
    }


    async minorDraw (url) {
        const browser = await this.browser();
        let results = await minor(browser, url);

        return results;
    }

    async majorDraw (url) {
      const browser = await this.browser();
      let results = await major(browser, url);

      return results;
    } 

    async close () {
      const browser = await this.browser();
      await browser.close();
  
      this._browser = null;
    }

    async getLink(draw, drawDate) {
      return global[draw].link + drawDate;
    }
}

module.exports = LottoScraper;