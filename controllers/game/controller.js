const db = require('../../db');
const queries = require('../../db/queries')(db);
const { FLOW_TOP_TO_BOTTOM, FLOW_LEFT_TO_RIGHT, NO_FLOW } = require('../../constants/play_validation');
const {LETTER_VALUES} = require('../../constants/letters');

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

    this.process_message = (message_data, user_id) => {
        return new Promise(( resolve, reject ) => {
            message_data = user_id + " : " + message_data;
            resolve( message_data );
        })
    };

    this.validate_game_play = ( user_id, game_id, play_data ) => {
        return this.create_tiles( play_data )
        .then( this.get_orientation )
        .then( result => this.get_game_board( result, game_id)  )
        .then( this.place_new_tiles )
        .then( this.find_starting_letter_accordingly )
        .then( this.extract_word )
        .then( this.validate_move )
        .then( result => this.update_game_tiles( result, play_data))
        .then( this.calculate_move_score)
        

    };

    function validate_word_api( word ) {
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
        if( sequence.length > 0){
            let result = sequence.reduce( (a, b) => { return (a === b - 1) ? b : false });
            return (result === false) ? false : true;
        }
         return false;   
    }

    this.check_all_same = ( sequence ) => {
        if( sequence.length > 0){
            let result = sequence.reduce( (a, b) => { return (a === b) ? b : false });
            return (result === false) ? false : true;
        }
        return false;
        
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

    this.find_starting_letter_accordingly = ( [orientation, board, starting_letter ] ) => {
        let starting_coordinates = [ starting_letter.row, starting_letter.column];
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
                    return [orientation, board, start_tile.letter] ;
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
                    return [orientation, board, start_tile.letter] ;
                }
            }
        }
    }

    function BoardTile( row, column ){
        this.letter = 0;
        this.premium = 0;
        this.row = row;
        this.column = column;
    }

    function Tile(xCoordinate, yCoordinate, letter, score, game_tile_id){
        this.row = xCoordinate;
        this.column = yCoordinate;
        this.value = letter;
        this.is_new = false;
        this.game_tile_id = game_tile_id;
        this.score = score
    }

    this.initialize_game_board = () =>{
        let board_tile = new Object();
        
        let board = Array(16).fill().map(() => Array(16));

        for(var i = 1 ; i < 16; i++) {
            for(var j = 1 ; j < 16; j++) {
                board[i][j] = new BoardTile(i, j);
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
                    if(tile.xCoordinate != 0 && tile.yCoordinate !=0) {
                        let boardTile = board[tile.xCoordinate][tile.yCoordinate];
                        let game_tile = new Tile( tile.xCoordinate, tile.yCoordinate, LETTER_VALUES[tile.tileId].value,  LETTER_VALUES[tile.tileId].score, tile.id)
                        boardTile.letter = game_tile;
                    }
                }, this);
                return ( [letters, orientation, board ] );
            }
            else{
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
        let sorted_letters = this.sort_accordingly( letters, orientation );
        return [orientation, board, sorted_letters[0]];
    }
   
    this.mark_as_old_player = ( user_id, game_id ) => {

        return new Promise(( resolve, reject ) => {
            resolve( true );
        });
        //return queries.mark_as_old_player( user_id, game_id )
    };

    this.extract_word = ( [orientation, board, start_tile] ) => {
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
            while(board[row][column].letter != 0 && row < 16) {
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
                    
                let new_tile = new Tile( tile.row, tile.column, tile.value, tile.score, tile.game_tile_id);
                    new_tile.is_new = true;
                    converted_tiles.push(new_tile);
                }, this);
            resolve( converted_tiles );
        })
    }

    function get_word_from_tiles( [ orientation, board, word ] ) {
       let word_string = "";
        
       word.forEach( (tile) => {
            word_string += tile.value;
        }, this);  
       
       return word_string;
    };

    this.get_touching_tiles = ([ orientation, board, word ]) => {

        let touching_tiles = [];

        word.forEach( (tile) => {
            if(tile.is_new == true ) {
                if(orientation == FLOW_LEFT_TO_RIGHT){
                    if((tile.row > 1 && board[tile.row -1][tile.column].letter !=0) || (tile.row < 15 && board[tile.row + 1][tile.column].letter !=0)){
                        touching_tiles.push(tile);
                    }
                }

                if(orientation == FLOW_TOP_TO_BOTTOM){
                    if((tile.column > 1 && board[tile.row][tile.column - 1].letter !=0) || (tile.column < 15 && board[tile.row][tile.column + 1].letter !=0)){
                        touching_tiles.push(tile);
                    }
                }
            }  
        }, this);
        
        return touching_tiles;
    }

    this.get_touching_words = ( [orientation, board, touching_tiles] ) =>{
        touching_words = [];
        let opposite_orientation = (orientation === FLOW_LEFT_TO_RIGHT) ? FLOW_TOP_TO_BOTTOM : FLOW_LEFT_TO_RIGHT;
        for( let index = 0; index < touching_tiles.length; index++ ){
            let start_tile = this.find_starting_letter_accordingly([opposite_orientation, board, touching_tiles[index] ]);
            let word_result = this.extract_word( [opposite_orientation, board, start_tile[2]] );
            touching_words.push( word_result[2]);
        }
        return touching_words;
    }

   async function validate_all_words( all_words ){
        for( let index = 0; index < all_words.length; index++ ){
            let string_word = get_word_from_tiles([ 0, 0, all_words[index] ]);
            let is_valid = await validate_word_api( string_word );
            if ( is_valid !== 1){
                return false;
            }
        }
        return all_words;
    }

    this.calculate_move_score = (all_words) => {
        if(all_words) {
            let move_score = 0;

            all_words.forEach ( (word) => {
                move_score += this.calculate_word_score(word);
            }, this);

            console.log(move_score);
            return move_score;
        } else {
            return false;
        }
    }

    this.calculate_word_score = (word) => {
        let score = 0;
        
        word.forEach( (tile) => {
            score += tile.score; 
        }, this);  
        
        return score;
    }

    this.validate_move = ( [orientation, board, word] ) => {
        let touching_tiles = this.get_touching_tiles([ orientation, board, word ]);

        let touching_words = this.get_touching_words( [orientation, board, touching_tiles] );
        touching_words.push( word );

        return validate_all_words( touching_words );

    }

    this.get_player_rack = ([user_id, game_id] ) => {
        return queries.select_player_rack(user_id, game_id)
        .then( (result)  => {
            if( result.length >= 1 ){
                let rack = []; 
                result.forEach( (letter) => {
                    let rack_tile = new Tile( letter.xCoordinate, letter.yCoordinate, LETTER_VALUES[letter.tileId].value, LETTER_VALUES[letter.tileId].score, letter.id)
                    rack.push(rack_tile);                   
                }, this);  
                console.log(rack);
                return rack;
            }
            else{
                return false;
            }
        })
    }

    this.get_unused_tiles = (game_id, tile_count) => {
        return queries.get_unused_tiles(game_id, tile_count)
        .then( (result)  => {
            if( result.length >= 1 ){
                
                let unused_tiles = []; 
                
                result.forEach( (letter) => {
                    let tile = new Tile( letter.xCoordinate, letter.yCoordinate, LETTER_VALUES[letter.tileId].value, LETTER_VALUES[letter.tileId].score, letter.id)
                    unused_tiles.push(tile);                   
                }, this);  

                return unused_tiles;
            }
            else{
                return false;
            }
        })
    }

    this.can_swap = (available_tiles, tiles_to_swap) => {
        if(available_tiles[0].total >= tiles_to_swap.length)
            return true;
        else
            return false;
    }

    this.get_tile_id = (tiles) => {
        let id = '';
        tiles.forEach( (tile) => {
            id += tile.game_tile_id +','; 
        }, this);  
        id = id.slice(0, -1);
        return id;
    }

    this.clear_tile_association = (can_swap, tiles_to_swap ) => {
        
        if(can_swap){
            let tile_id = this.get_tile_id(tiles_to_swap);
            return queries.clear_tile_association(tile_id);
        }
        else
            return false;
    }

    this.assign_tile_user = (user_id, tiles ) => {
        let tile_id = this.get_tile_id(tiles);
        return queries.assign_tile_user(user_id, tile_id)
        .then(result => {
            return tiles;
        });
    }

    this.swap_user_tiles = (user_id, game_id, tiles_to_swap) => {
        return queries.get_remaining_tile_count(game_id)
            .then(data => this.can_swap(data, tiles_to_swap))
            .then(result => this.clear_tile_association(result, tiles_to_swap))
            .then(_ => this.get_unused_tiles(game_id, tiles_to_swap.length))
            .then(swapped_tiles => this.assign_tile_user(user_id, swapped_tiles ));
            
    }

    //FUNCTION TO GET TILES TABLE
    this.load_tiles = () => {
        return queries.load_tiles()
        .then(result => {
            return result;
        })
    }
      
    //FUNCTION TO POPULATE TILES ON INIT
    this.populate_game_tiles = (game_id) => {
        return queries.load_tiles()
        .then(result => {
            result.forEach( (tile) => {
                return queries.populate_game_tiles(game_id, tile); 
            }, this);
        })
    }

    this.create_player_rack = (game_id, user_id) => {
        return this.get_unused_tiles(game_id, 7)
            .then(unused_tiles => this.assign_tile_user(user_id, unused_tiles ));
    }


    this.get_game = (game_id) => {
        return queries.get_game(game_id)
        .then(result => {
            return result[0];
        })
    }

    this.change_game_status = (game_id) => {
        return queries.change_game_status( game_id );
    }
    this.get_game_users = (game_id) => {
        return queries.get_game_users(game_id)
        .then(result => {
            return result;
        })
    }

    this.update_game_tiles = (all_words, new_tiles) => {
        if(all_words){
            new_tiles.forEach( (tile) => {
                queries.place_game_tiles(tile); 
            }, this);
        }
        else{
            return false;
        }
    }

    return this;
}
module.exports = game_controller;