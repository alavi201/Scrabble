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
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      game_id: {
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
        allowNull: true
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable( 'game_user' );
  }
};
