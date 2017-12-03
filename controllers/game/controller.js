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

    //TODO implement this function
    //Store the message in database
    this.process_message = message_data => {
        return new Promise(( resolve, reject ) => {
            resolve( message_data );
        })
    };

    //TODO Implement this function
    //Validate the play
    //If successful validation then else return false
    this.validate_game_play = ( user_id, game_id, play_data ) => {
        return new Promise(( resolve, reject ) => {
            resolve(this.validate_word_api('dummy'));
        })
    };

    this.validate_word_api = (word ) => {
        //API CALL
        const https = require("https");
        const url = "https://www.wordgamedictionary.com/api/v1/references/scrabble/equinox?key=7.425271736209773e29";

        let xml_response = "";
        let parsedXml = "";

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
            });
          });

        return new Promise(( resolve, reject ) => {
            resolve( true );
        })
    };

    this.mark_as_old_player = ( user_id, game_id ) => {
        return new Promise(( resolve, reject ) => {
            resolve( true );
        });
        //return queries.mark_as_old_player( user_id, game_id )
    };

    return this;
}
module.exports = game_controller;