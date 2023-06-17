const LottoScraper = require('./lib/LottoScraper');
const moment = require('moment');
const fs = require('fs');

var scraper = new LottoScraper({headless: false});
var global = JSON.parse(fs.readFileSync('./global.json', 'utf8'));

const lotto = async (lottoDraw, customDate = null) => {
    let data = defaultValues(lottoDraw, customDate);
    let url = await scraper.getLink(data.lotto, data.drawDate);
    let results = {};

    if (lottoDraw <= 4) results = await searchMinor(url); // Minor Draw
    else results = await searchMajor(url); // Major Draw

    return results;
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


void (async() => {
    try {
        let lottoDate = moment().format();
        let results = await lotto(global.draws.stl2d, lottoDate);
        
        let drawTime = moment(lottoDate).format('ha');
        let drawDate = moment(lottoDate).format('MMMM DD, YYYY');
        if (results.date == drawDate) {
            console.log(drawTime);
            drawTime = '11am';
            if (drawTime in results.draw && results.draw[drawTime].filter(x => isNaN(x)).length == 0) {
                console.log("All good");
            }
        }
    } catch (error) {
        console.log(error);
    }

})()
