"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("users", [
      { id: 1, name: "ajinkya", email: "aj@gmail.com",username: "ajinkya001", password: "qwerty001", created_at: new Date(), updated_at: new Date() },
      { id: 2, name: "ali", email: "al@mail.sfsu.edu" ,username: "ali001", password: "qwerty001", created_at: new Date(), updated_at: new Date() }
    ], {})
    .then(()=> {
        return queryInterface.bulkInsert("tiles", [
          { id: 1, score: 1, letter: "A",count:9},
          { id: 2, score: 3, letter: "B" ,count:2},
          { id: 3, score: 3, letter: "C" ,count:2},
          { id: 4, score: 2, letter: "D" ,count:4},
          { id: 5, score: 1, letter: "E" ,count:12},
          { id: 6, score: 4, letter: "F" ,count:2},
          { id: 7, score: 2, letter: "G" ,count:3},
          { id: 8, score: 4, letter: "H" ,count:2},
          { id: 9, score: 1, letter: "I" ,count:9},
          { id: 10, score: 8, letter: "J" ,count:1},
          { id: 11, score: 5, letter: "K" ,count:1},
          { id: 12, score: 1, letter: "L" ,count:4},
          { id: 13, score: 3, letter: "M" ,count:2},
          { id: 14, score: 1, letter: "N" ,count:6},
          { id: 15, score: 1, letter: "O" ,count:8},
          { id: 16, score: 3, letter: "P" ,count:2},
          { id: 17, score: 10, letter: "Q" ,count:1},
          { id: 18, score: 1, letter: "R" ,count:6},
          { id: 19, score: 1, letter: "S" ,count:4},
          { id: 20, score: 1, letter: "T" ,count:6},
          { id: 21, score: 1, letter: "U" ,count:4},
          { id: 22, score: 4, letter: "V" ,count:2},
          { id: 23, score: 4, letter: "W" ,count:2},
          { id: 24, score: 8, letter: "X" ,count:1},
          { id: 25, score: 4, letter: "Y" ,count:2},
          { id: 26, score: 10, letter: "Z" ,count:1},
          { id: 27, score: 0, letter: " " ,count:1},
        ], {}).then(() => {
          return queryInterface.bulkInsert("games", [{
            id: 1,
            creator_id: 1,
            num_players: 2,
            status: 1,
            created_at: new Date(),
            updated_at: new Date()
          }], {})
          .then(()=>{
            return queryInterface.bulkInsert("game_user", [
              { id: 1, user_id: 1, game_id: 1, score: 0, is_spectator: 0,  updated_at: new Date() },
              { id: 2, user_id: 2, game_id: 1, score: 0, is_spectator: 0,  updated_at: new Date() }
            ], {})
        })
      })
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("game_user", {id: {$in: [1,2]}})
    .then(()=>{
      return queryInterface.bulkDelete("games",{id: 1})
      .then(()=>{ 
      return queryInterface.bulkDelete("tiles",{id: {$in : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]}})})
      .then(()=>{
        return queryInterface.bulkDelete("users",{ id: {$in: [1,2] }})       
      })
    });
  }
};
