'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.createTable( 'tiles', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        score: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        letter: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        }
      }

    );
  },
  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable( 'tiles' );
  }
};
