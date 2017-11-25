'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.changeColumn( 'games',
      'creatorId',
      {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'cascade',
        onDelete: 'cascade'
      }
    )
  },

  down: (queryInterface, Sequelize) => {

  }
};
