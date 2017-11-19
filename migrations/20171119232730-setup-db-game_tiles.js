'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.createTable('game_tiles', {
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
      playerId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
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
