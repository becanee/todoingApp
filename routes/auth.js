const express = require('express');
const router = express.Router();
const { now } = require('moment');
const bcrypt = require('bcrypt');
const connect = require('../lib/db');
const { authUser } = require('../middleware/auth');

/* GET homepage */
router.get('/', (req, res) => {
   res.render('auth/index', { app: 'To-doing', sessionID: req.session.userID, sessionName: req.session.userName });
});



/* GET login page */
router.get('/login', (req, res) => {
   res.render('auth/login', { app: 'Login', email: '' });
});

/* POST login process */
router.post('/login-user', (req, res) => {
   let { email, password } = req.body;

   if (!email.length || !password.length) {
      req.flash('faildata', `Email & Password Field Cannot Be Empty`) 
      res.render('auth/login', { app: 'Login', email })
   }

   connect.query(`SELECT * FROM users WHERE email = ?`, email, (error, data) => {
      if (error) throw error;

      if (!data.length) {
         req.flash('faildata', `Incorrect Email`)
         res.render('auth/login', { app: 'Login', email }) 
      } else {  
         bcrypt.compare(password, data[0].password, (err, result) => {
            if (err) throw err;
            
            if (!result) {
               req.flash('faildata', `Incorrect Password`) 
               res.render('auth/login', { app: 'Login', email })
            } else {
               req.flash('successlogin', `Login Success ! <br />Welcome <b>${data[0].fullName}</b> Have Task Today ?`)
               req.session.userID = data[0].id;
               req.session.userName = data[0].fullName;
               res.redirect('/todo');
            }
         });
      }
   }) 
});



/* GET register page */
router.get('/register', (req, res, next) => {
   res.render('auth/register', { app: 'Register', fullName: '', email: '' });
});

/* POST register process */
router.post('/register-user', async (req, res, next) => {
   const { fullName, email, password, newPassword } = req.body;
   let errors = false;

   if (!fullName.length) {
      errors = true; 
      req.flash('failname', `Nama Field Cannot Be Empty`) 
      res.render('auth/register', { app: 'Register', fullName, email })
   }
   if (!email.length) {
      errors = true;
      req.flash('failemail', `Email Field Cannot Be Empty`) 
      res.render('auth/register', { app: 'Register', fullName, email })
   }
   if (!password.length) {
      errors = true;
      req.flash('failpass', `Password Field Cannot Be Empty`) 
      res.render('auth/register', { app: 'Register', fullName, email })
   }
   if (!newPassword.length) {
      errors = true;
      req.flash('failnewpass', `Confirm Password Field Cannot Be Empty`) 
      res.render('auth/register', { app: 'Register', fullName, email })
   }
   if (password != newPassword) {
      errors = true;
      req.flash('notmatchpass', `Your Password Doesn't Match`) 
      res.render('auth/register', { app: 'Register', fullName, email })
   }
   if (!errors) {
      const registerData = {
         fullName: fullName,
         email,
         password: await bcrypt.hash(password, 10),
         createdAt: new Date(now()),
         updatedAt: new Date(now()),
      }

      connect.query('INSERT INTO users SET ?', registerData, (err, data) => {
         if (err) throw err;
   
         req.flash('successregis', `Register Success ! <br />Welcome <b>${registerData.fullName}</b> Let's Start New Journey`)
         req.session.userID = data.insertId;
         req.session.userName = registerData.fullName;
         res.redirect('/todo');
      })
   }
});



/* GET logout */
router.get('/logout', (req, res, next) => {
   req.session.destroy(() => {
      res.redirect('/')
   })
});



/* GET profile page */
router.get('/profile', authUser, (req, res) => {
   const id = req.session.userID;
   let allTodo = 0;
   let pendTodo = 0;
   let doingTodo = 0;
   let doneTodo = 0;

   connect.query(`SELECT COUNT(*) as todo_pending FROM todo_list WHERE user_id=${id} AND status='pending'`, (err, result1) => {
      if (err) throw err;
      pendTodo = result1[0].todo_pending;

      connect.query(`SELECT COUNT(*) as todo_doing FROM todo_list WHERE user_id=${id} AND status='doing'`, (err, result2) => {
         if (err) throw err;
         doingTodo = result2[0].todo_doing;

         connect.query(`SELECT COUNT(*) as todo_done FROM todo_list WHERE user_id=${id} AND status='done'`, (err, result3) => {
            if (err) throw err;
            doneTodo = result3[0].todo_done;

            connect.query(`SELECT COUNT(*) as all_todo FROM todo_list WHERE user_id=${id}`, (err, result4) => {
               if (err) throw err;
               allTodo = result4[0].all_todo;

               connect.query(`SELECT * FROM users WHERE id=${id}`, (err, ress) => {
                  res.render('auth/profile', { 
                     app: 'Profile',
                     sessionID: id,
                     sessionName: req.session.userName,
                     email: ress[0].email,
                     allTodo: allTodo,
                     pendTodo: pendTodo,
                     doingTodo: doingTodo,
                     doneTodo: doneTodo,
                  });
               })
            })
         })
      })
   })
});

module.exports = router;
