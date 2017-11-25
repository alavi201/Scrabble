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

    return this;
};
module.exports = queries;