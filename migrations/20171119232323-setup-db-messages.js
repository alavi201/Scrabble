'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.createTable( 'messages', {
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
        message: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false
        },
        gameId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'games',
            key: 'id'
          }
        }
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.dropTable( 'messages' )
  }
};
