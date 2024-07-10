const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Could've done this with a database, and using a controller for user related CRUD operations. But this is just for bonus points, so I'll keep it simple
const users = [
    // password is 1234 but encrypted
    { id: 1, username: 'user1', password: '$2a$12$ojab8InM3uSUlvx/vjk9.uT7mJEYM89Z.kf7UacoZCsXhTeN2Ja9C', role: 'user' }, // password: password1
    { id: 2, username: 'admin', password: '$2a$12$ojab8InM3uSUlvx/vjk9.uT7mJEYM89Z.kf7UacoZCsXhTeN2Ja9C', role: 'admin' } // password: password1
];

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);

    if (!user) return res.status(400).send('Cannot find user');

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            const accessToken = jwt.sign({ username: user.username, role: user.role }, process.env.SECRET_KEY);
            res.json({ accessToken });
        } else {
            res.status(403).send('User or password incorrect');
        }
    });
});

module.exports = router;