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
        return this.create_tiles( play_data )
        .then( this.get_orientation )
        .then( result => this.get_game_board( result, game_id)  )
        .then( this.place_new_tiles )
        .then( this.find_starting_letter_accordingly )
        .then( this.extract_word )
        .then( this.get_word_from_tiles )
        .then( this.validate_word_api )
    };

    this.validate_word_api = ( word ) => {
        return new Promise(( resolve, reject ) => {
            //API CALL
            const https = require("https");
            const url = "https://www.wordgamedictionary.com/api/v1/references/scrabble/" + word + "?key=7.425271736209773e29";

            let xml_response = "";
            let parsedXml = "";
            let result = 0;

            https.get(url, res => {
                res.setEncoding("utf8");
                res.on("data", data => {
                    xml_response += data;
                });

            res.on("end", () => {

                    console.log(xml_response);
                    
                    var parseString = require('xml2js').parseString;

                    parseString(xml_response,{ explicitArray : false }, function (err, result) {
                        console.dir(JSON.stringify(result));
                        parsedXml = JSON.stringify(result);
                    });

                    console.log(parsedXml);

                    parsedXml = JSON.parse(parsedXml);

                    //let isValidWord = parsedXml['scrabble'];
                    //console.log(JSON.parse(parsedXml));
                    console.log(parsedXml.entry.scrabble);
                    result = parsedXml.entry.scrabble;
                    resolve( parseInt(result) );
                });
            });
        })
    };

    this.get_orientation = ( letters ) => {       
        // Check if flow is left to right
        let orientation = NO_FLOW;
        var rows = letters.map( letter_obj => letter_obj.row )
        if( this.check_all_same( rows )){
            orientation = FLOW_LEFT_TO_RIGHT;
        }
        // Check if flow is top to bottom
        var cols = letters.map( letter_obj => letter_obj.column )
        if( this.check_all_same( cols )){
            orientation = FLOW_TOP_TO_BOTTOM;
        }

        return [letters, orientation];
    };

    this.check_sequence = ( sequence ) => {
        let result = sequence.reduce( (a, b) => { return (a === b - 1) ? b : false });
        return (result === false) ? false : true;
    }

    this.check_all_same = ( sequence ) => {
        let result = sequence.reduce( (a, b) => { return (a === b) ? b : false });
        return (result === false) ? false : true;
    }

    this.sort_accordingly = ( data, orientation ) => {

        sorted_letters = data.sort( (a, b) => {
            if (orientation === FLOW_LEFT_TO_RIGHT){
                return a.column - b.column;
            }
            else{
                return a.row - b.row;
            }
          });

        return sorted_letters;
    }

    this.find_starting_letter_accordingly = ( [letters, orientation, board ] ) => {
        let sorted_letters = this.sort_accordingly( letters, orientation );
        let starting_coordinates = [ sorted_letters[0].row, sorted_letters[0].column];
        let starting_letter = sorted_letters[0];
        let row = starting_letter.row;
        let col = starting_letter.column;

        if( orientation === FLOW_LEFT_TO_RIGHT ){
            for( let index = col; index >= 1; index --  ){
                let board_tile = board[ row ][ index ];
                if ( board_tile.letter !== 0){
                    starting_coordinates = [ row, index ];
                }
                else {
                    let start_tile = board[starting_coordinates[0] ][starting_coordinates[1]];
                    return [letters, orientation, board, start_tile.letter] ;
                }
            }
        }

        if( orientation === FLOW_TOP_TO_BOTTOM ){
            for( let index = row; index >= 1; index --  ){
                let board_tile = board[ index ][ col ];
                if ( board_tile.letter !== 0){
                    starting_coordinates = [ index, col ];
                }
                else {
                    let start_tile = board[starting_coordinates[0] ][starting_coordinates[1]];
                    return [letters, orientation, board, start_tile.letter] ;
                }
            }
        }
    }

    function BoardTile(){
        this.letter = 0;
        this.premium = 0;
    }

    function Tile(xCoordinate, yCoordinate, letter){
        this.row = xCoordinate;
        this.column = yCoordinate;
        this.value = letter;
        this.is_new = false;
    }

    this.initialize_game_board = () =>{
        let board_tile = new Object();
        
        let board = Array(16).fill().map(() => Array(16));

        for(var i = 1 ; i < 16; i++) {
            for(var j = 1 ; j < 16; j++) {
                board[i][j] = new BoardTile();
            }
        }
        return board;
    }

    this.get_game_board = ( [letters, orientation], game_id) => {
        return queries.select_placed_tiles( game_id )
        .then( (result)  => {
            let board = this.initialize_game_board();
            if( result.length >= 1 ){
                result.forEach( (tile) => {
                    boardTile = board[tile.xCoordinate][tile.yCoordinate];
                    let game_tile = new Tile( tile.xCoordinate, tile.yCoordinate, String.fromCharCode(Math.floor(Math.random() * 26) + 65))
                    boardTile.letter = game_tile;
                }, this);
                return ( [letters, orientation, board ] );
            }
        })
    }

    this.place_new_tiles = ([letters, orientation, board ]) =>{

        letters.forEach( (tile) => {
            let boardTile = board[tile.row][tile.column];
            
            if(boardTile.letter == 0) {
                let new_tile = tile;
                new_tile.is_new = true;
                boardTile.letter = new_tile;
            }   
        }, this);
        return [letters, orientation, board ];
    }
   
    this.mark_as_old_player = ( user_id, game_id ) => {

        return new Promise(( resolve, reject ) => {
            this.get_game_board(game_id).then(result =>
                resolve( true )
            );
            
        });
        //return queries.mark_as_old_player( user_id, game_id )
    };

    this.extract_word = ( [letters, orientation, board, start_tile] ) => {
        let row = start_tile.row;
        let column = start_tile.column;
        let word = [];
        let new_word_count = 0;

       //row is fixed, increment column till we hit a blank tile on the board or the end
        if( orientation === FLOW_LEFT_TO_RIGHT ){
            while(board[row][column].letter != 0 && column < 16) {
                board_tile = board[row][column];
                tile = board_tile.letter;
                word.push( tile );

               if(tile.is_new == 1)
                    new_word_count++;

               column++;
            }
        }

       //row is fixed, increment row till we hit a blank tile on the board or the end
        if( orientation === FLOW_TOP_TO_BOTTOM ){
            while(board[row][column].letter != 0 && column < 16) {
                board_tile = board[row][column];
                tile = board_tile.letter;
                word.push( tile );

               if(tile.is_new == 1)
                    new_word_count++;

               row++;
            }
        }

        return [ orientation, board, word ];
    }

    this.create_tiles = ( play_data ) => {
        return new Promise( ( resolve, reject ) => {
            let converted_tiles = [];        
            play_data.forEach( (tile) => {
                    
                let new_tile = new Tile( tile.row, tile.column, tile.value);
                    new_tile.is_new = true;
                    converted_tiles.push(new_tile);
                }, this);
            resolve( converted_tiles );
        })
    }

    this.get_word_from_tiles = ( [ orientation, board, word ] ) => {
       let word_string = "";
        
       word.forEach( (tile) => {
            word_string += tile.value;
        }, this);  
       
       return word_string;
    };

    return this;
}
module.exports = game_controller;