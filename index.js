const fs  = require('fs');
const yml = require('js-yaml');
const xml = require('xml-js');
const moment  = require('moment');
const Request = require('request');
const Warbler = require('@sevenspice/warbler');

/*
 * Conversion table to weather glyph.
 */
const weather_table = {
    '200': '⛈',
    '201': '⛈',
    '202': '⛈',
    '210': '⛈',
    '211': '⛈',
    '212': '⛈',
    '221': '⛈',
    '230': '⛈',
    '231': '⛈',
    '232': '⛈',
    '300': '🌧',
    '301': '🌧',
    '302': '🌧',
    '310': '🌧',
    '311': '🌧',
    '312': '🌧',
    '313': '🌧',
    '314': '🌧',
    '321': '🌧',
    '500': '🌦',
    '501': '🌦',
    '502': '🌦',
    '503': '🌦',
    '504': '🌦',
    '511': '☃',
    '520': '☂',
    '521': '☂',
    '522': '☂',
    '531': '☂',
    '600': '☃',
    '601': '☃',
    '602': '☃',
    '611': '☃',
    '612': '☃',
    '613': '☃',
    '615': '☃',
    '616': '☃',
    '620': '☃',
    '621': '☃',
    '622': '☃',
    '701': '🌫',
    '711': '🌫',
    '721': '🌫',
    '731': '🌫',
    '741': '🌫',
    '751': '🌫',
    '761': '🌫',
    '762': '🌫',
    '771': '🌫',
    '781': '🌫',
    '800': '☀',
    '801': '🌤',
    '802': '🌤',
    '803': '🌤',
    '804': '🌤'
};

// Kelvin constant.
const KELVIN = 273.15;

/**
 * Import .env.yaml.
 * @return {object} configuration data.
 */
const loadEnv = () => {
    return new Promise( (resolve, reject) => {
        fs.readFile('.env.yaml', 'utf-8', (error, content) => {
            if(error) reject(error);
            else resolve(yml.safeLoad(content));
        });
    });
};

/**
 * Create Tweet text sentence.
 * @param {string} city city name.
 * @param {object} rainfall rainfall informations.
 * @param {object} weather  weather informations.
 * @return {string} tweet text sentence.
 */
const tweet_sentence = (city, rainfall, weather) => {
    const result = weather.weather.pop();
    let   emoji  = weather_table[result.id];

    if(typeof emoji === 'undefined'){
        emoji = '？';
    }

    let sentence = `${ city } => ${ emoji } `;
    sentence += `🌡 ${ Math.floor(weather.main.temp - KELVIN) }° `;
    sentence += `💧 ${ weather.main.humidity }% `;
    if(rainfall.railfall > 0.0){
        sentence += `☔ ${ rainfall.railfall } mm/hour`;
    }
    sentence += '\r\n';

    return sentence;
};

/**
 * Extract the amount of rainfall.
 * @param {string} content response content.
 * @return {object} rainfall informations.
 */
const extractionYahooRainfall = (content) => {
    const json = xml.xml2json(content);
    // Exploding Elements.
    const element    = JSON.parse(json).elements.pop();
    const resultInfo = element.elements.pop();
    const feature    = resultInfo.elements.pop();

    // List of observed and predicted rainfall.
    const list = feature.elements.pop().elements;

    // Acquisition of the most recent observation.
    const type     = list[0].elements.shift().elements.pop().text;
    const railfall = list[0].elements.pop().elements.pop().text;

    return { type: type, railfall: railfall };
};

/**
 * Call Yahoo Open Local Platform API.
 * @param {string} endpoint endpoint url.
 * @param {string} appid    application id.
 * @param {float}  long     longitude.
 * @param {float}  lat      latitude.
 * @return {string} rainfall informations.
 */
const callYahooApi = (endpoint, appid, long, lat) => {
    return new Promise( (resolve, reject) => {
        try{
            Request.get({
                url: endpoint,
                qs: {
                    coordinates: `${long},${lat}`,
                    appid: appid
                }
            }, (error, response, body) => {
                if(error) reject(error);
                else resolve(body);
            });
        }catch(error){
            reject(error);
        }
    });
};

/**
 * Call Open Weather Map API.
 * @param {string} endpoint endpoint url.
 * @param {string} appid    application id.
 * @param {float}  long     longitude.
 * @param {float}  lat      latitude.
 * @return {string} rainfall informations.
 */
const callOpenWeatherMapApi = (endpoint, appid, long, lat) => {
    return new Promise( (resolve, reject) => {
        try{
            Request.get({
                url: endpoint,
                qs: {
                    lat: lat,
                    lon: long,
                    appid: appid
                }
            }, (error, response, body) => {
                if(error) reject(error);
                else resolve(body);
            });
        }catch(error){
            reject(error);
        }
    });
};

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request}  request  HTTP request context.
 * @param {!express:Response} response HTTP response context.
 * @return {undefined}
 */
exports.weatherTweet = async (request, response) => {
    try{
        const now = moment();
        //
        // Setting Environment Variables.
        //
        const env = await loadEnv();
        const OPENWEATHERMAP_API_ENDPOINT     = env.OPENWEATHERMAP.API_ENDPOINT;
        const OPENWEATHERMAP_API_KEY          = env.OPENWEATHERMAP.API_KEY;
        const YAHOO_API_ENDPOINT              = env.YAHOO.API_ENDPOINT;
        const YAHOO_API_APPLICATION_ID        = env.YAHOO.API_APPLICATION_ID;
        const TWITTER_API_SCHEME              = env.TWITTER.API_SCHEME;
        const TWITTER_API_HOST                = env.TWITTER.API_HOST;
        const TWITTER_API_ENDPOINT            = env.TWITTER.API_ENDPOINT;
        const TWITTER_API_PROTOCOL            = env.TWITTER.API_PROTOCOL;
        const TWITTER_API_CONSUMER_KEY        = env.TWITTER.API_CONSUMER_KEY;
        const TWITTER_API_CONSUMER_SECRET     = env.TWITTER.API_CONSUMER_SECRET;
        const TWITTER_API_ACCESS_TOKEN        = env.TWITTER.API_ACCESS_TOKEN;
        const TWITTER_API_ACCESS_TOKEN_SECRET = env.TWITTER.API_ACCESS_TOKEN_SECRET;
        const cities = env.CITIES;
        const keys   = Object.keys(cities);

        let tweet = `${ now.format('YYYY年MM月DD日 HH:mm:ss') } 付近の気象情報 \r\n`;
        for(let i = 0; i < keys.length; i++){
            const yahoo_results   = await callYahooApi(YAHOO_API_ENDPOINT, YAHOO_API_APPLICATION_ID, cities[keys[i]].LONG, cities[keys[i]].LAT);
            const weather_results = await callOpenWeatherMapApi(OPENWEATHERMAP_API_ENDPOINT, OPENWEATHERMAP_API_KEY, cities[keys[i]].LONG, cities[keys[i]].LAT);
            const railfall = extractionYahooRainfall(yahoo_results);
            const weather  = JSON.parse(weather_results);
            tweet += tweet_sentence(cities[keys[i]].NAME, railfall, weather);
        }

        const timeout   = 10000;
        const timestamp = Math.round((new Date()).getTime() / 1000);
        const options   = {
            status: tweet
        };

        const walber = new Warbler(
            TWITTER_API_SCHEME
            , TWITTER_API_HOST
            , TWITTER_API_ENDPOINT
            , TWITTER_API_PROTOCOL
            , TWITTER_API_CONSUMER_KEY
            , TWITTER_API_CONSUMER_SECRET
            , TWITTER_API_ACCESS_TOKEN
            , TWITTER_API_ACCESS_TOKEN_SECRET
            , options, timeout
        );

        // tweet.
        Request.post({
            url: `${walber.getScheme()}://${walber.getHost()}${walber.getEntryPoint()}`,
            qs: walber.getOptions(),
            headers: {
                'Authorization': walber.getAuthString(timestamp, walber.getNonce())
                , 'content-type': 'application/x-www-form-urlencoded'
            },
        }, (error, _, body) => {
            response.status(200).send(body);
        });
    }catch(error){
        response.status(500).send(error); 
    }
};
