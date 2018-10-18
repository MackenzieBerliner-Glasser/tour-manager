const { HttpError } = require('./errors');
const getLocationWeather = require('./weather-service');

module.exports = function createLocationWeather(api = getLocationWeather) {
    return (req, res, next) => {
        if(req.body.zip) {

            api(req.body.zip)
                .then(data => {
                    req.stop = data;
                    next();
                })
                .catch(next);
        }
        else {
            const error = new HttpError({
                code: 400,
                message: 'Bad Request: Zip Code Required'
            });
            next(error);
        }
    };
};
