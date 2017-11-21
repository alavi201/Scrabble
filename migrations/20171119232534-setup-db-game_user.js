'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.createTable( 'game_user', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      gameId: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'games',
          key: 'id'
        }
      },
      score: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      is_spectator: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable( 'game_user' );
  }
};
