const express = require('express');
const { now } = require('moment');
const router = express.Router();
const connect = require('../lib/db');

/* GET todo list page */
router.get('/', (req, res, next) => {
   connect.query(`SELECT * FROM todo_list WHERE user_id=${req.session.userID} ORDER BY createdAt DESC`, (err, result) => {
      if (err) throw err;

      if (!result.length) {
         const stat = ['pending', 'doing', 'done'];
         req.flash('noTask', "Your Todo List Is Clean Let's Create New One")
         res.render('todo/index', {
            app: "My Todo List",
            search: '',
            result,
            status: stat,
            sessionID: req.session.userID,
            sessionName: req.session.userName
         }); 
      } else {
         const stat = ['pending', 'doing', 'done'];
         req.flash('clickTitle', "Click Title To View Details")
         res.render('todo/index', {
            app: "My Todo List",
            search: '',
            result,
            status: stat,
            sessionID: req.session.userID,
            sessionName: req.session.userName
         });
      }
   })
})



/* GET todo list from status */
router.get('/status', (req, res, next) => {
   const status = req.query.stat;
   const stat = ['pending', 'doing', 'done'];

   connect.query(`SELECT * FROM todo_list WHERE user_id=${req.session.userID} AND status='${status}'`, (err, result) => {
      if (err) throw err;

      if (!result.length) {
         req.flash('noTask', `There Is No Todo List With <b>${status}</b> Status`)
         res.render('todo/index', {
            app: "My Todo List",
            search: '',
            result,
            status: stat,
            sessionID: req.session.userID,
            sessionName: req.session.userName
         }); 
      } else {
         req.flash('clickTitle', "Click Title To View Details")
         res.render('todo/index', {
            app: "My Todo List",
            search: '',
            result,
            status: stat,
            sessionID: req.session.userID,
            sessionName: req.session.userName
         });
      }
   })
})



/* GET todo list from search form */
router.post('/search', (req, res) => {
   const searchText = req.body.search;
   const stat = ['pending', 'doing', 'done'];

   connect.query(`SELECT * FROM todo_list WHERE title LIKE '%${searchText}%'`, (err, result) => {
      if (err) throw err;

      if (!result.length) {
         req.flash('noTask', `No Todo List With Title <b>${searchText}</b>`)
         res.render('todo/index', { 
            app: "My Todo List",
            search: searchText,
            result,
            status: stat,
            sessionID: req.session.userID,
            sessionName: req.session.userName
         }); 
      } else {
         req.flash('clickTitle', "Click Title To View Details")
         res.render('todo/index', {
            app: "My Todo List",
            search: searchText,
            result,
            status: stat,
            sessionID: req.session.userID,
            sessionName: req.session.userName
         });
      }
   })
})



/* GET todo list create page */
router.get('/create', (req, res) => { 
   res.render('todo/create', { app: "Create Todo List", sessionID: req.session.userID, sessionName: req.session.userName })
})

/* STORE data from todo list create page */
router.post('/store', (req, res) => {
   const storeData = {
      user_id: req.session.userID,
      title: req.body.title,
      desc: req.body.desc,
      status: req.body.status,
      createdAt: new Date(now()),
      updatedAt: new Date(now()),
   }

   let errors = false;

   if (!storeData.title.length) { 
      errors = true;
      req.flash('fail', `Fail ! <br />Title Field Cannot Be Empty`)
      res.redirect('/todo/create')
   }

   if(!storeData.desc.length) {
      errors = true;
      req.flash('fail', `Fail ! <br />Desc Field Cannot Be Empty`)
      res.redirect('/todo/create')
   }

   if (storeData.status == null) {
      errors = true;
      req.flash('fail', `Fail ! <br />Status Field Cannot Be Empty`)
      res.redirect('/todo/create')
   }

   if (!errors) {
      connect.query('INSERT INTO todo_list SET ?', storeData, (err) => {
         if (err) throw err;;
   
         req.flash('successCreate', `Create Success ! <br />Added New Todo List <b>${storeData.title}</b>`)
         res.redirect('/todo');
      })
   }
})



/* GET todo list edit page */
router.get('/edit/:id', (req, res) => {
   connect.query(`SELECT * FROM todo_list WHERE id='${req.params.id}'`, (err, result) => {
      if (err) throw err;
      
      res.render('todo/update', {
         app: "Update Todo List",
         sessionID: req.session.userID,
         sessionName: req.session.userName,
         id: result[0].id,
         user_id: result[0].user_id,
         title: result[0].title,
         desc: result[0].desc,
         status: result[0].status,
         created_at: result[0].createdAt,
         updated_at: result[0].updatedAt,
      })
   })
})

/* UPDATE data from todo list update page */
router.post('/update', (req, res) => {
   const updateData = {
      user_id: req.session.userID,
      title: req.body.title,
      desc: req.body.desc,
      status: req.body.status,
      createdAt: new Date(req.body.created),
      updatedAt: new Date(now()),
   }

   if (!updateData.title.length || !updateData.desc.length || updateData.status == null) {
      req.flash('fail', `Fail ! <br />Title & Desc Fields Cannot Be Empty`)
      
      connect.query(`SELECT * FROM todo_list WHERE id='${req.body.id}'`, (err, result) => {
         if (err) throw err;
         
         res.render('todo/update', {
            app: "Update Todo List",
            sessionID: req.session.userID, 
            sessionName: req.session.userName,
            id: result[0].id,
            user_id: result[0].user_id,
            title: result[0].title,
            desc: result[0].desc,
            status: result[0].status,
            created_at: result[0].createdAt,
            updated_at: result[0].updatedAt,
         })
      })
   } else {
      connect.query(`UPDATE todo_list SET ? WHERE id = ${req.body.id}`, updateData, (err) => {
         if (err) throw err;
   
         req.flash('successUpdate', `Update Success ! <br />Updated Todo List <b>${updateData.title}</b>`)
         res.redirect('/todo'); 
      })
   }
})



/* DELETE data from todo list page on modal */
router.get('/delete/:id', (req, res) => {
   connect.query(`DELETE FROM todo_list WHERE id=${req.params.id}`, (err, result) => {
      if (err) throw err;

      req.flash('delete', `Delete Success ! <br />Todo List Has Deleted`)
      res.redirect('/todo')
   })
})


module.exports = router; 