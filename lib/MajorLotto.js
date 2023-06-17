'use strict'

module.exports = async (browser, link) => {
    const page = await browser.newPage()

    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1) {
            request.abort();
        } else {
            request.continue();
        }
    });

    await page.goto(link, {waitUntil: 'networkidle2'});

    const result = await page.$eval('.s-results', el => el.innerHTML);
    let results = {};
    let time = '9pm';
    let combination = result.trim();

    if (result.indexOf(':') != -1) combination = result.split(':')[1].trim();

    results[time.toLowerCase()] = combination.split('-');

    return results;
}