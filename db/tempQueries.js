let database = function (db)  {

    this.insert_new_user = (req,res) =>{
       const date=new Date();
       return db.none(`INSERT INTO users ("name","email","username","password","created_at") 
       VALUES ($1,$2,$3,$4,$5);`, [req.body.name,req.body.email,req.body.username,req.body.password,date])
       .then( (result) => {
        return result
      })
      .catch(function (error) {
        console.log(error)
      });
    }

    this.validateUser = (req, res) =>{
        return db.one("select * from users where username like $1 and password like $2 ", [req.body.username, req.body.password])
        .then((data) => {
          return data
        })
        .catch(function (error) {
          res.render('login', {errormsg: true} );
          res.send('Login Failed');
        });
      }

    return this;
}
module.exports = database;
