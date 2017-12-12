'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.createTable('game_tiles', {
      id:{
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      gameId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'games',
          key: 'id'
        }
      },
      tileId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'tiles',
          key: 'id'
        }
      },
      player_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
      },
      xCoordinate: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      yCoordinate: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable( 'game_tiles' );
  }
};
