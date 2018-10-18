require('dotenv').config();
const { dropCollection } = require('../util/db');
const request = require('supertest');
const app = require('../../lib/app');
const Chance = require('chance');
const chance = new Chance();

describe('Tours', () => {
    let tours = [
        {
            title: 'Worst Circus Ever',
            activities: [chance.animal(), chance.word()],
            launchDate: chance.date(),
            stops: []
        },
        {
            title: chance.string(),
            activities: [chance.animal(), chance.word()],
            launchDate: chance.date(),
            stops: []
        },
        {
            title: chance.string(),
            activities: [chance.animal(), chance.word()],
            launchDate: chance.date(),
            stops: []
        }
    ];
    let createdTours;

    const createTour = tour => {
        return request(app)
            .post('/api/tours')
            .send(tour)
            .then(res => res.body);
    };

    beforeEach(() => {
        return dropCollection('tours');
    });
    beforeEach(() => {
        return Promise.all(tours.map(createTour))
            .then(toursRes => createdTours = toursRes);
    });

    describe('tours', () => {

        it('creates a tour on post', () => {
            return request(app)
                .post('/api/tours')
                .send({
                    title: 'Worst Circus Ever',
                    activities: ['smelly petting zoo', 'broken rides'],
                    launchDate: '2014-04-16T07:00:00.000Z',
                    stops: []
                })
                .then(res => {
                    expect(res.body).toEqual({
                        _id: expect.any(String),
                        __v: expect.any(Number),
                        title: 'Worst Circus Ever',
                        activities: ['smelly petting zoo', 'broken rides'],
                        launchDate:'2014-04-16T07:00:00.000Z',
                        stops: []
                    });
                });
        });

        it('gets all tours on get', () => {
            return request(app)
                .get('/api/tours')
                .then(retrievedTours => {
                    createdTours.forEach(createdTour => {
                        expect(retrievedTours.body).toContainEqual(createdTour);
                    });
                });
        });

        it('gets tour by id on get', () => {
            return request(app)
                .get(`/api/tours/${createdTours[0]._id}`)
                .then(res => {
                    expect(res.body).toEqual({ ...createdTours[0], __v: expect.any(Number) });
                });
        });
    });

    describe('stops', () => {
        it('posts a stop to a tour', () => {
            return request(app)
                .post(`/api/tours/${createdTours[0]._id}/stops`)
                .send({ zip: '97209' })
                .then(res => {
                    expect(res.body).toEqual({ ...createdTours[0], stops: [{
                        _id: expect.any(String),
                        location: { city: 'Portland', state: 'OR', zip: '97209' },
                        weather: { condition: expect.any(String), temperature: expect.any(String) }
                    }] });
                });
        });
        it('updates the attendance of a stop', () => {
            const tourId = createdTours[0]._id;
            return request(app)
                .post(`/api/tours/${tourId}/stops`)
                .send({ zip: '97209' })
                .then(res => {
                    const stopId = res.body.stops[0]._id;
                    return request(app)
                        .put(`/api/tours/${tourId}/stops/${stopId}/attendance`)
                        .send({ attendance: 200 })
                        .then(res => {
                            expect(res.body.stops[0].attendance).toEqual(200);
                        });
                
                });
        });
        it('deletes a stop from tour', () => {
            const tourId = createdTours[0]._id;
            return request(app)
                .post(`/api/tours/${tourId}/stops`)
                .send({ zip: '97209' })
                .then(res => {
                    const stopId = res.body.stops[0]._id;
                    return request(app)
                        .delete(`/api/tours/${tourId}/stops/${stopId}`)
                        .then(result => {
                            expect(result.body).toEqual(createdTours[0]);
                        });
                });
        });
    });
});
