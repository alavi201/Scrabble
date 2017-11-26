const db = require('../../db');
const queries = require('../../db/queries')(db);

const game_controller = () => {

    this.validate_user_with_game = ( user_id, game_id ) => {
       return queries.select_game_user( user_id, game_id )
        .then( (result)  => {
            if( result.length == 1 ){
                return true;
            }
            else{
                return false;
            }
        })
    };

    this.is_new_player = ( user_id, game_id )  => {
        return queries.select_new_game_user( user_id, game_id )
    };

    this.process_message = message_data => {
        //Store the message in database
        return new Promise(( resolve, reject ) => {
            resolve( message_data );
        })
    };

    this.validate_game_play = ( user_id, game_id, play_data ) => {
        //Validate the play
        //If successful validation then else return false
        return new Promise(( resolve, reject ) => {
            resolve( true );
        })
    };

    this.mark_as_old_player = ( user_id, game_id ) => {
        return queries.mark_as_old_player( user_id, game_id )
    };

    return this;
}
module.exports = game_controller;