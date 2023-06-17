const LottoScraper = require('./lib/LottoScraper');
const moment = require('moment');
const fs = require('fs');

var scraper = new LottoScraper({headless: true});
var global = JSON.parse(fs.readFileSync('./global.json', 'utf8'));

const lotto = async (lottoDraw, customDate = null) => {
    let data = defaultValues(lottoDraw, customDate);
    let url = await scraper.getLink(data.lotto, data.drawDate);
    let results = {};

    if (lottoDraw <= 4) results = await searchMinor(url); // Minor Draw
    else results = await searchMajor(url); // Major Draw

    console.log(results);

    if (Object.keys(results).length != 0) {
        await saveToFile(getLottoName(lottoDraw), results, data.lottoDate);
    }
}
const saveToFile = async (jsonFile, results, lottoDate) => {
    let jsonLotto = JSON.parse(fs.readFileSync(`./data/${jsonFile}.json`, 'utf8'));
    jsonLotto[lottoDate] = results;

    fs.writeFile(`./data/${jsonFile}.json`, JSON.stringify(jsonLotto, null, 2), function(err) {
        console.log(moment(lottoDate).format('MMMM-D-YYYY ') + jsonFile.toUpperCase() + ' results stored.');
        
        global[jsonFile].lastDateSearched = lottoDate;
        fs.writeFile('./global.json', JSON.stringify(global, null, 2), function(err) {});
    });
}

const searchMinor = async (url) => {
    let result = await scraper.minorDraw(url);
    await scraper.close();
    return result;
}
const searchMajor = async (url) => {
    let result = await scraper.majorDraw(url);
    await scraper.close();
    return result;
}
const defaultValues = function(draw, customDate) {
    let lottoDraw, lottoDrawDate;

    if (draw == global.draws.digit2) lottoDraw = 'digit2';
    else if (draw == global.draws.digit3) lottoDraw = 'digit3';
    else if (draw == global.draws.stl2d) lottoDraw = 'stl2d';
    else if (draw == global.draws.stl3d) lottoDraw = 'stl3d';
    else if (draw == global.draws.stlpares) lottoDraw = 'stlpares';
    else if (draw == global.draws.digit4) lottoDraw = 'digit4';
    else if (draw == global.draws.digit6) lottoDraw = 'digit6';

    lottoDrawDate = moment(global[lottoDraw].lastDateSearched).format();

    if (customDate != null) lottoDrawDate = customDate;

    return {
        lotto: lottoDraw,
        lottoDate: lottoDrawDate,
        drawDate: moment(lottoDrawDate).format('MMMM-D-YYYY').toLowerCase()
    }
}
const getLottoName = function(lottoDraw) {
    return Object.keys(global.draws)[lottoDraw];
}


void (async() => {
    /*let endDate = '2019-06-23T00:00:00+08:00';
    let lottoDate = moment(global[getLottoName(global.draws.stl2d)].lastDateSearched).format();
    while (lottoDate != endDate) {
        lottoDate = moment(lottoDate).add(1, 'days').format();
        await lotto(global.draws.stl2d, lottoDate);
    }*/

    //lottoDate = moment(lottoDate).add(1, 'days').format();
    let lottoDate = moment().subtract(1, 'days').format();
    await lotto(global.draws.stl2d, lottoDate);

})()
