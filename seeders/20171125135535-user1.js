'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      { id: 1, name: "ajinkya", username: "ajinkya001", password: "qwerty001", createdAt: Date.now(), updatedAt: Date.now() },
      { id: 2, name: "ali", username: "ali001", password: "qwerty001", createdAt: Date.now(), updatedAt: Date.now() }
    ], {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};
