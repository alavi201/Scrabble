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
            
            if (result){
                this.validate_word_api('dummy').then( validation => {
                    result = validation;
                    resolve( validation );
                })
            }
        })
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
                    resolve( result );
                });
            });
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

    this.get_game_board = (game_id) => {
        return new Promise(( resolve, reject ) => {
        
            let board = this.initialize_game_board();

            
            queries.select_placed_tiles(game_id )
                .then( (result)  => {
                    if( result.length >= 1 ){
                        result.forEach( (tile) => {
                            boardTile = board[tile.xCoordinate][tile.yCoordinate];
                            let game_tile = new Tile( tile.xCoordinate, tile.yCoordinate, String.fromCharCode(Math.floor(Math.random() * 26) + 65))
                            boardTile.letter = game_tile;
                            
                        }, this);

                        resolve(board);
                    }
                    
                })
        });
    }

   
    this.mark_as_old_player = ( user_id, game_id ) => {

        return new Promise(( resolve, reject ) => {
            this.get_game_board(game_id).then(result =>
                resolve( true )
            );
            
        });
        //return queries.mark_as_old_player( user_id, game_id )
    };

    return this;
}
module.exports = game_controller;