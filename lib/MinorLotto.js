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

    const lottoDT = await page.evaluate(() => document.querySelector('.thetime.date span').textContent);
    const data = await page.$$('.thecontent .thumbnail + p');
    
    let results = {};
    await new Promise((resolve, reject) => {
        data.forEach(async (res, i) => {
            const result = await page.evaluate(el => el.innerHTML, res); 
            let htmlRes = result.replace(/\s/g,'').split('<br>');

            htmlRes.forEach(arr => {
                arr = arr.replace(/(<([^>]+)>)/ig, "");
                let time = arr.split(':')[0].trim();
                let combination = arr.split(':')[1].trim();

                results[time.toLowerCase()] = combination.split('-').map(Number);
            });
            if (i === data.length - 1) {
                resolve();
            }
        });
    });

    let response = {
        date: lottoDT.trim(),
        draw: results
    }

    return response;
}