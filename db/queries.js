const queries = database => {

    this.select_game_user = (user_id, game_id) =>{
       return database.any('SELECT * FROM game_user WHERE "user_id" = $1 and "game_id" = $2',[user_id, game_id])
        .then( data  => {
            return data;
        })
    };

    this.select_new_game_user = (user_id, game_id) =>{
       return database.any('SELECT * FROM game_user WHERE "user_id" = $1 and "game_id" = $2 and is_new = true'
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
       return database.none('Update game_user set is_new = false WHERE "user_id" = $1 and "game_id" = $2 and is_new = true'
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
        return database.any('SELECT * FROM game_tiles WHERE "player_id" = $1 and "gameId" = $2 and "xCoordinate" = 0 and "yCoordinate" = 0',[user_id,game_id])
         .then( data  => {
             return data;
         })
    };

    this.insert_message = ( user_id, message, date, game_id ) => {
        return db.none('INSERT INTO messages ("user_id","message","created_at","game_id") VALUES ($1,$2,$3,$4);', [user_id, message, new Date(), game_id])
        .then(data => {
            return data;
        });
    };
    
    this.get_unused_tiles = (game_id, tile_count) => {
        return database.any('SELECT * FROM game_tiles WHERE "gameId" = $1 AND "player_id" is null  ORDER BY random() LIMIT $2', [game_id, tile_count])
        .then( data  => {
            return data;
        })
    }

    this.get_remaining_tile_count = (game_id) => {
        return database.any('SELECT count(*) as total FROM game_tiles WHERE "gameId" = $1 AND "player_id" is null', [game_id])
        .then( data  => {
            return data;
        })
    }

    this.clear_tile_association = (tile_id) => {
        return database.any('UPDATE game_tiles SET "player_id" = NULL WHERE  "id" = any(string_to_array($1,\',\')::integer[])', [tile_id])
        .then( ()  => {
        })
    }    

    this.assign_tile_user = (user_id, tile_id) => {
        return database.any('UPDATE game_tiles SET "player_id" = $1 WHERE "id" = any(string_to_array($2,\',\')::integer[])', [user_id, tile_id])
        .then( ()  => {
        })
    }    

    this.load_tiles = () => {
        return database.any('SELECT * FROM tiles ORDER BY id asc')
        .then((data) =>{
            return data;
        })
    }

    this.populate_game_tiles = (game_id, tile) => {
        return database.any('INSERT INTO game_tiles ("gameId", "tileId", "player_id", "xCoordinate", "yCoordinate") SELECT $1,$2,NULL,0,0 FROM generate_series(1,$3)', [game_id, tile.id, tile.count]);
    } 
    
    this.place_game_tiles = (tile) => {
        return database.any('UPDATE game_tiles SET "xCoordinate" =$1, "yCoordinate"= $2 WHERE id = $3', [tile.row, tile.column, tile.game_tile_id]);
    } 

    this.get_game_users = (game_id) => {
        return database.any('SELECT * FROM game_user WHERE "game_id" = $1 ', [game_id])
        .then( data  => {
            return data;
        })
    }

    this.get_game_user = (game_id, user_id) => {
        return database.any('SELECT * FROM game_user WHERE "game_id" = $1 AND "user_id" = $2 ORDER BY id', [game_id, user_id])
        .then( data  => {
            return data;
        })
    }

    this.get_game = ( game_id) => {
        return database.any('SELECT * FROM games WHERE "id" = $1 ', [game_id])
        .then( data  => {
            return data;
        })
    }

    this.change_game_status = ( game_id ) =>{
        return database.none('Update games set status = 1 WHERE id = $1',[game_id])
         .then( ()  => {
         })
    };


    this.game_tiles_exist = ( game_id ) =>{
        return database.any('SELECT * FROM game_tiles WHERE "id" = $1 ', [game_id]);
    }

    this.update_player_score = ( game_id, user_id, score ) =>{
        return database.none('UPDATE game_user SET "score" = score + $1 WHERE "game_id" = $2 and "user_id" = $3',[score, game_id, user_id])
         .then( ()  => {
         })
    };

    this.get_remaining_tiles = ( game_id ) => {
        return database.any( 'select count(1) from game_tiles where "gameId" = $1 and player_id is null',[ game_id ] );
    }

    this.get_game_scores = ( game_id ) => {
        return database.any('select username as "user_id", score from game_user join users on game_user.user_id = users.id and game_id = $1 ORDER by game_user.user_id',[game_id]);
    }

    this.get_user_id = (user_id) => {
        return database.any( "select * from users where id = $1",[user_id]);
    }

    this.get_game_stats = (user_id) => {
        return database.any( "select * from game_user where user_id = $1",[user_id]);
    }
    
    this.get_avg_score = (user_id) => {
        return database.any( "select cast(avg(score) as decimal(10,2)) from game_user where id = $1",[user_id]);
    }

    this.update_password = (req,res) => {
        return database.none( "Update users set password=$1 where id = $2",[req.body.new_password,req.session.player_id]);
    }
    

    return this;
};
module.exports = queries;