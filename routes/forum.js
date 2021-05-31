const express = require('express');
const router = express.Router();
const moment  = require('moment');
const { now }  = require('moment');
const connect = require('../lib/db');

/* GET forum page */
router.get('/', (req, res, next) => {
   let totalComent = 0;
   connect.query("SELECT * FROM post ORDER BY createdAt DESC", (err, result) => {
      if (err) throw err;

      connect.query("SELECT * FROM comments", (err, resultCom) => {
         if (err) throw err;

         res.render('forum/index', {
            app: 'To-doing Forums',
            sessionID: req.session.userID, 
            sessionName: req.session.userName,
            posts: result,
            comments: resultCom,
            created_at_post: moment(result[0].createdAt).startOf('day').fromNow(),
            created_at_coment: moment(resultCom[0].createdAt).startOf('day').fromNow()
         });
      })
   })
});



/* GET post list from status = solved */
router.get('/status', (req, res, next) => {
   const status = req.query.stat;

   connect.query(`SELECT * FROM post WHERE status='${status}'`, (err, result) => {
      if (err) throw err;

      connect.query("SELECT * FROM comments", (err, resultCom) => {
         if (err) throw err;

         if (!result.length) {
            req.flash('noMatch', `There Is No Post With <b>${status}</b> Status`)
            res.redirect('/forum'); 
         } else {
            res.render('forum/index', {
               app: 'To-doing Forums',
               sessionID: req.session.userID, 
               sessionName: req.session.userName,
               posts: result,
               comments: resultCom,
               created_at_post: moment(result[0].createdAt).startOf('day').fromNow(),
               created_at_coment: moment(resultCom[0].createdAt).startOf('day').fromNow()
            });
         }
      })
   })
})



/* POST comment to forum page */
router.post('/post-user', (req, res) => {
   const storeData = {
      user_id: req.session.userID, 
      title: req.body.title,
      content: req.body.content,
      author: req.session.userName,
      status: "unsolved",
      createdAt: new Date(now()),
      updatedAt: new Date(now()),
   }

   if (!storeData.title || !storeData.content) {
      req.flash('fail', `Fail ! <br />All Field Cannot Be Empty`)
      res.redirect('/forum')
   } else {
      connect.query('INSERT INTO post SET ?', storeData, (err) => {
         if (err) throw err;;
   
         req.flash('successPost', `Content Posted !`)
         res.redirect('/forum');
      })
   }
})


/* UPDATE data from post forum page on modal */
router.post('/post-update', (req, res) => {
   const updateData = {
      user_id: req.session.userID,
      title: req.body.title,
      content: req.body.content,
      status: req.body.status,
      createdAt: new Date(req.body.created),
      updatedAt: new Date(now()), 
   }

   if (!updateData.title.length || !updateData.content.length || updateData.status == null) {
      
      connect.query(`SELECT * FROM post WHERE id='${req.body.postID}'`, (err, result) => {
         if (err) throw err;
         
         req.flash('fail', `Fail ! <br />Title & Desc Fields Cannot Be Empty`)
         res.redirect('/forum')
      })
   } else {
      connect.query(`UPDATE post SET ? WHERE id = ${req.body.postID}`, updateData, (err) => {
         if (err) throw err;
   
         req.flash('successUpdate', `Update Success ! <br />Post Updated <b>${updateData.title}</b>`)
         res.redirect('/forum'); 
      })
   }
})



/* POST comment to forum page */
router.post('/coment-user', (req, res) => {
   const storeData = {
      user_id: req.session.userID, 
      post_id: req.body.post_id,
      comment: req.body.comments,
      user: req.session.userName,
      createdAt: new Date(now()),
      updatedAt: new Date(now()),
   }

   if (!storeData.comment) {
      req.flash('fail', `Fail ! <br />Title Field Cannot Be Empty`)
      res.redirect('/forum')
   } else {
      connect.query('INSERT INTO comments SET ?', storeData, (err) => {
         if (err) throw err;;
   
         req.flash('successComment', `Comment Posted !`)
         res.redirect('/forum');
      })
   }
})

module.exports = router;