'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.createTable('games', {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true
        },
        creator_id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        num_players: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        status: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: true
        }
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable( 'games' ); 
  }
};
