'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.addColumn('game_user', 'is_new', {
        type: Sequelize.BOOLEAN,
         defaultValue: true,
        });
  },

  down: (queryInterface, Sequelize) => {
  }
};
