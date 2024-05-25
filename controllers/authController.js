const authUser = require('../models/authUser');

exports.login = async (req, res, next) => {
    try {
        const check = await authUser.findOne({ email: req.body.email });
        if (check && check.password === req.body.password) {
            req.session.loggedIn = true;
            req.session.normaluser = check.email;

            req.session.save((err) => {
                if (err) {
                    console.error('Error saving session:', err);
                }
                if (check.userstatus) {
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                    res.redirect('/home');
                } else {
                    res.render('user/login', { wrongEmail: 'You are blocked' });
                }
            });
        } else {
            res.render('user/login', {
                wrongEmail: 'Please check your Email',
                wrongPassword: 'Please check your Password',
            });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send('Internal Server Error');
    }
};
exports.auth = async (req,res, next) =>
{
    if (req.session.loggedIn) {
        try {
            const check = await authUser.findOne({ email: req.session.normaluser });
                if (check.userstatus) {
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                    next(); // Call next only when login is successful
                } else {
                    res.render('user/login', { wrongEmail: 'You are blocked' });
                }
            }
        catch (error) {
            console.error('Session save error:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.render('user/login', {
            wrongEmail: 'Please check your Email',
            wrongPassword: 'Please check your Password',
        });
    }
}
