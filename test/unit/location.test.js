require('dotenv').config();
const createLocationWeather = require('../../lib/util/location');

describe('location services', () => {

    it('finds city, state, and weather for a zip', done => {
       
        const req = {
            body: { zip: '97209' }
        };
        let called = false;
        let error;
        const next = err => {
            called = true;
            error = err;
            
            expect(called).toBeTruthy();
            expect(error).toBeUndefined();
            expect(req.stop.location).toEqual({ city: 'Portland', state: 'OR', zip: '97209' });
            expect(req.stop.weather).toEqual({ condition: expect.any(String), temperature: expect.any(String) });
            done();
        };
        createLocationWeather()(req, null, next);

    });

    it('calls next when it gets bad zipcode', done => {
        const error = { statusCode: 404 };
        const api = () => {
            return Promise.reject(error);
        };

        const req = {
            body: { zip: 'abde' }
        };
        const next = err => {
            expect(err).toEqual(error);
            done();
        };
        createLocationWeather(api)(req, null, next);
    });
});
