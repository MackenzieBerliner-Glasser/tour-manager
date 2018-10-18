const router = require('express').Router();
const Tour = require('../models/tour');
const createLocationWeather = require('../util/location');

const updateOptions = {
    new: true,
    runValidators: true
};

module.exports = router
    .post('/', (req, res) => {
        const { title, activities, launchDate, stops } = req.body;
        Tour.create({ title, activities, launchDate, stops }).then(tour => 
            res.json(tour)
        );
    })
    .get('/', (req, res) => {
        Tour.find().then(tours => res.json(tours));
    })
    .get('/:id', (req, res) => {
        const { id } = req.params;
        Tour.findById(id).then(tour => res.json(tour));
    })
    .post('/:id/stops', createLocationWeather(), (req, res, next) => {
        const { id } = req.params;
        Tour.findByIdAndUpdate(id, { $push: { stops: req.stop } }, updateOptions)
            .then(tour => res.json(tour))
            .catch(next);
    })
    .put('/:tourId/stops/:stopId/attendance', (req, res, next) => {
        const { tourId, stopId } = req.params;
        console.log(stopId);
        const { attendance } = req.body;
        Tour.findOneAndUpdate(
            { '_id': tourId, 'stops._id': stopId }, 
            { $set: { 'stops.$.attendance': attendance } }, 
            { new: true }
        )
            .then(result => res.json(result))
            .catch(next);
    })
    .delete('/:tourId/stops/:stopId', (req, res, next) => {
        const { tourId, stopId } = req.params;
        Tour.findByIdAndUpdate(tourId, 
            { $pull: { stops: { _id: stopId } } }, 
            { new: true }
        )
            .lean()
            .then(updatedTour => res.json(updatedTour))
            .catch(next);
    });
