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
        creatorId: {
          type: Sequelize.BIGINT,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        numPlayers: {
          type: Sequelize.BIGINT,
          allowNull: false
        },
        status: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false
        }
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable( 'games' ); 
  }
};
