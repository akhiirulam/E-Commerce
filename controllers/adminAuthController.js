let adminemail ;
let  adminpassword;

exports.adminlogin = async (req,res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    adminemail = "admin@gmail.com";
    adminpassword = "123";
    const email = req.body.email;
    const password = req.body.password;
    
      try{
        if (email === adminemail && password === adminpassword) {
  
          req.session.adminloggedIn = true;
          req.session.user = email;
          req.session.password= password;
          req.session.save((err) => {
              if (err) {
                console.error('Error saving session:', err);
              }
              res.redirect('/adminDashboard');
            });
        } else {
          res.render('adminlogin', { wrongEmail:"Please check your Email",wrongPassword:"Please check your Password"});
        }
      } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send('Internal Server Error');
      }
  };

exports.auth = async (req,res, next) =>
{
    
    if (req.session.adminloggedIn) {
        try {
            
                if (adminemail == req.session.user && adminpassword ==  req.session.password) {
                    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                    next(); // Call next only when login is successful
                } else {
                    res.render('adminlogin', { wrongEmail: 'You are blocked' });
                }
            }
        catch (error) {
            console.error('Session save error:', error);
            res.status(500).send('Internal Server Error');
        }
    } else {
        res.render('adminlogin', {
            wrongEmail: 'Please check your Email',
            wrongPassword: 'Please check your Password',
        });
    }
}
