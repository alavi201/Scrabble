const queries = database => {

    this.select_game_user = (user_id, game_id) =>{
       return database.any('SELECT * FROM game_user WHERE "userId" = $1 and "gameId" = $2',[user_id, game_id])
        .then( data  => {
            return data;
        })
    };

    this.select_new_game_user = (user_id, game_id) =>{
       return database.any('SELECT * FROM game_user WHERE "userId" = $1 and "gameId" = $2 and is_new = true'
       ,[user_id, game_id])
        .then( data  => {
            if( data.length == 0 ){
                return false;
            }
            else{
                return true;
            }
        })
    };

    this.mark_as_old_player = (user_id, game_id) =>{
       return database.none('Update game_user set is_new = false WHERE "userId" = $1 and "gameId" = $2 and is_new = true'
       ,[user_id, game_id])
        .then( ()  => {
        })
    };

    this.select_placed_tiles = (game_id) =>{
        return database.any('SELECT * FROM game_tiles WHERE "gameId" = $1',[game_id])
         .then( data  => {
             return data;
         })
    };

    this.select_player_rack = (user_id, game_id) =>{
        return database.any('SELECT * FROM game_tiles WHERE "playerId" = $1 and "gameId" = $2 and "xCoordinate" = 0 and "yCoordinate" = 0',[user_id,game_id])
         .then( data  => {
             return data;
         })
    };

    this.insert_message = ( user_id, message, date, game_id ) => {
        return db.none('INSERT INTO messages ("userId","message","createdAt","gameId") VALUES ($1,$2,$3,$4);', [user_id, message, new Date(), game_id])
        .then(data => {
            return data;
        });
    };
    return this;
};
module.exports = queries;