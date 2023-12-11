const express = require('express');
const UserRepo = require('../repos/user-repo');

const router = express.Router();

router.get('/users', async (req, res) => {
    const data = await UserRepo.find();
    res.json(data);
});

router.get('/users/count', async (req, res) => {
    const data = await UserRepo.count();
    res.json(data);
});

router.get('/users/:id', async (req, res) => {
    const {id} = req.params;
    const data = await UserRepo.findById(id);
    if(data) {
        res.json(data);
    } else {
        res.sendStatus(404);
    }
});

router.post('/users', async(req, res) => {
    const {username, bio} = req.body;
    const data = await UserRepo.create(username, bio);
    res.json(data);
});

router.put('/users/:id', async (req, res) => {
    const {username, bio} = req.body;
    const {id} = req.params;
    const data = await UserRepo.update(id, username, bio);
    if(data) {
        res.json(data);
    }else {
        res.sendStatus(404);
    }
});

router.delete('/users/:id', async (req, res) => {
    const {id} = req.params;
    const data = await UserRepo.delete(id);
    if(data) {
        res.json(data);
    }else {
        res.sendStatus(404);
    }
});

module.exports = router;
