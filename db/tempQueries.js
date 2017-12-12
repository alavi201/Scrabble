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

  this.insert_new_game = (req,res) =>{
    const date=new Date();
    return db.one(`INSERT INTO games ("creator_id","num_players","status","created_at") 
    VALUES ($1,$2,0,$3) returning id`,[req.session.player_id,req.body.playervalue,date])
    .then((result) => {
      return result
    })
  }

  this.get_games = (req,res) =>{
    return db.any("select users.username as creator, games.* from users , games where games.creator_id = users.id");
  }

  this.insert_game_user = (gameId,req,res) =>{
    const date=new Date();
    return db.any(`INSERT INTO game_user ("user_id","game_id","score","is_spectator","updated_at") 
    VALUES ($1,$2,0,0,$3)`,[req.session.player_id,gameId,date])
  }

  return this;
}
module.exports = database;
