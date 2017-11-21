/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('game_user', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    gameId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    score: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    is_spectator: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'game_user'
  });
};
