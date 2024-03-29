/********************************************************************************* 
 * WEB322 – Assignment 02
 * *
 * * I declare that this assignment is my own work in accordance with Seneca's
 * * Academic Integrity Policy:
 * *
 * * https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 * *
 * * Name: __________Karl Andrei Diola____________ Student ID: ____146937222__________ Date: ______________
 * *
 * * Published URL: ___________________________________________________________
 * *********************************************************************************/

const legoData = require("./modules/legoSets");
const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));



legoData.initialize().then(() => {
    

  app.get('/', (req, res) => {
      res.render("home");
  });

  app.get('/about', (req, res) => {
      res.render("about");
  });

 
  app.get('/lego/sets', (req, res) => {
      if (req.query.theme) {
          legoData.getSetsByTheme(req.query.theme)
              .then((sets) => res.render("sets", { sets }))
              .catch((error) => res.status(404).render('404', { message: "No sets found for the specified theme." }));
      } else {
          legoData.getAllSets()
              .then((sets) => res.render("sets", { sets }))
              .catch((error) => res.status(404).render('404', { message: "Unable to load sets." }));
      }
  });


  app.get('/lego/sets/:set_num', (req, res) => {
      legoData.getSetByNum(req.params.set_num)
      .then((set) => res.render("set", { set }))
      .catch((error) => res.status(404).render('404', { message: "No sets found for the specified set number." }));
  });


  app.get('/lego/addSet', (req, res) => {
    legoData.getAllThemes()
      .then((themes) => res.render('addSet', { themes }))
      .catch((err) => res.status(500).render('500', { message: err.message }));
  });

  app.post('/lego/addSet', (req, res) => {
    legoData.addSet(req.body)
      .then(() => res.redirect('/lego/sets'))
      .catch((err) => res.status(500).render('500', { message: err.message }));
  });


  app.get('/lego/editSet/:num', async (req, res) => {
    try {
      const setData = await legoData.getSetByNum(req.params.num);
      const themes = await legoData.getAllThemes();
      res.render('editSet', { themes, set: setData });
    } catch (err) {
      res.status(404).render('404', { message: err.message });
    }
  });

 
  app.post('/lego/editSet', async (req, res) => {
    try {
      await legoData.editSet(req.body.set_num, req.body);
      res.redirect('/lego/sets');
    } catch (err) {
      res.render('500', {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
      });
    }
  });

  app.get('/lego/deleteSet/:num', (req, res) => {
    legoData.deleteSet(req.params.num)
      .then(() => res.redirect('/lego/sets'))
      .catch(err => res.render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` }));
  });


  app.use((req, res) => {
      res.status(404).render('404', { message: "I'm sorry, we're unable to find what you're looking for" });
  });

  app.listen(HTTP_PORT, () => {
      console.log(`Server is running at http://localhost:${HTTP_PORT}`);
  });

}).catch(error => {

  console.error('Initialization failed:', error);
});

