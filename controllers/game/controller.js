const db = require('../../db');
const queries = require('../../db/queries')(db);
const { FLOW_TOP_TO_BOTTOM, FLOW_LEFT_TO_RIGHT, NO_FLOW } = require('../../constants/play_validation');

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

    //TODO implement this function
    //Store the message in database
    this.process_message = message_data => {
        return new Promise(( resolve, reject ) => {
            resolve( message_data );
        })
    };

    //TODO Implement this function
    // Add the already existing letters if they exist.
    this.validate_game_play = ( user_id, game_id, play_data ) => {

        return new Promise(( resolve, reject ) => {
            let result = false;
            flow = this.check_flow( play_data);

            if( flow === FLOW_TOP_TO_BOTTOM || flow === FLOW_LEFT_TO_RIGHT ){
                result = true;
            }

            resolve( result );
        })
    };

    this.check_flow = ( letters ) => {
        
        // Check if flow is left to right
        var rows = letters.map( letter_obj => letter_obj.row )
        if( this.check_all_same( rows )){
            sorted_letters = letters.sort( (a, b) => {
                return a.column - b.column;
              });
            
            cols = sorted_letters.map( letter_obj => letter_obj.column );
            if(this.check_sequence( cols )){
                return FLOW_LEFT_TO_RIGHT;
            }
        }

        // Check if flow is top to bottom
        var cols = letters.map( letter_obj => letter_obj.column )
        if( this.check_all_same( cols )){
            sorted_letters = letters.sort( (a, b) => {
                return a.row - b.row;
              });
            
            row = sorted_letters.map( letter_obj => letter_obj.row );
            if(this.check_sequence( row )){
                return FLOW_TOP_TO_BOTTOM;
            }
        }

        return NO_FLOW;
    };

    this.check_sequence = ( sequence ) => {
        let result = sequence.reduce( (a, b) => { return (a === b - 1) ? b : false });
        return (result === false) ? false : true;
    }

    this.check_all_same = ( sequence ) => {
        let result = sequence.reduce( (a, b) => { return (a === b) ? b : false });
        return (result === false) ? false : true;
    }

    this.mark_as_old_player = ( user_id, game_id ) => {
        return queries.mark_as_old_player( user_id, game_id )
    };

    return this;
}
module.exports = game_controller;