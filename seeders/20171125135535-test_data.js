'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('users', [
      { id: 1, name: "ajinkya", email: 'aj@gmail.com',username: "ajinkya001", password: "qwerty001", createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: "ali", email: 'al@mail.sfsu.edu' ,username: "ali001", password: "qwerty001", createdAt: new Date(), updatedAt: new Date() }
    ], {})
    .then(()=> {
        return queryInterface.bulkInsert('tiles', [
          { id: 1, score: 1, letter: 'A' },
          { id: 2, score: 1, letter: 'B' },
          { id: 3, score: 1, letter: 'C' },
          { id: 4, score: 1, letter: 'D' },
          { id: 5, score: 1, letter: 'E' },
          { id: 6, score: 1, letter: 'F' },
          { id: 7, score: 1, letter: 'G' },
          { id: 8, score: 1, letter: 'H' },
          { id: 9, score: 1, letter: 'I' },
          { id: 10, score: 1, letter: 'J' },
          { id: 11, score: 1, letter: 'K' },
          { id: 12, score: 1, letter: 'L' },
          { id: 13, score: 1, letter: 'M' },
          { id: 14, score: 1, letter: 'N' },
          { id: 15, score: 1, letter: 'O' },
          { id: 16, score: 1, letter: 'P' },
          { id: 17, score: 1, letter: 'Q' },
          { id: 18, score: 1, letter: 'R' },
          { id: 19, score: 1, letter: 'S' },
          { id: 20, score: 1, letter: 'T' },
          { id: 21, score: 1, letter: 'U' },
          { id: 22, score: 1, letter: 'V' },
          { id: 23, score: 1, letter: 'W' },
          { id: 24, score: 1, letter: 'X' },
          { id: 25, score: 1, letter: 'Y' },
          { id: 26, score: 1, letter: 'Z' }
        ], {}).then(() => {
          return queryInterface.bulkInsert('games', [{
            id: 1,
            creatorId: 1,
            numPlayers: 2,
            status: 1,
            createdAt: new Date(),
            updatedAt: new Date()
          }], {})
      })
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('game_user', {id: {$in: [1,2]}})
    .then(()=>{
      return queryInterface.bulkDelete('games',{id: 1})
      .then(()=>{ 
      return queryInterface.bulkDelete('tiles',{id: {$in : [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26]}})})
      .then(()=>{
        return queryInterface.bulkDelete('users',{ id: {$in: [1,2] }})       
      })
    });
  }
};
