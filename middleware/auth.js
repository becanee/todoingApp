exports.authUser = (req, res, next) => {
   if (req.session.userID) {
      next();
   } else {
      req.flash('authreq', `Fail ! <br />Authentication Required`)
      res.redirect("/login");
   }
 }; 