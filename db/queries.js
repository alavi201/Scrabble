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
    this.get_unused_tiles = (game_id, tile_count) => {
        return database.any('SELECT * FROM game_tiles WHERE "gameId" = $1 AND "playerId" is null  ORDER BY random() LIMIT $2', [game_id, tile_count])
        .then( data  => {
            return data;
        })
    }

    this.get_remaining_tile_count = (game_id) => {
        return database.any('SELECT count(*) as total FROM game_tiles WHERE "gameId" = $1 AND "playerId" is null', [game_id])
        .then( data  => {
            return data;
        })
    }

    this.clear_tile_association = (tile_id) => {
        return database.any('UPDATE game_tiles SET "playerId" = NULL WHERE  "id" = any(string_to_array($1,\',\')::integer[])', [tile_id])
        .then( ()  => {
        })
    }    

    this.assign_tile_user = (user_id, tile_id) => {
        return database.any('UPDATE game_tiles SET "playerId" = $1 WHERE "id" = any(string_to_array($2,\',\')::integer[])', [user_id, tile_id])
        .then( ()  => {
        })
    }    

    this.load_tiles = () => {
        return database.any('SELECT * FROM tiles')
        .then((data) =>{
            return data;
        })
    }

    this.populate_game_tiles = (game_id, tile) => {
        return database.any('INSERT INTO game_tiles ("gameId", "tileId", "playerId", "xCoordinate", "yCoordinate") SELECT $1,$2,NULL,0,0 FROM generate_series(1,$3)', [game_id, tile.id, tile.count]);
    }    
    return this;
};
module.exports = queries;