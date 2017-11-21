/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('game_tiles', {
    gameId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'games',
        key: 'id'
      }
    },
    tileId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'tiles',
        key: 'id'
      }
    },
    playerId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    xCoordinate: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    yCoordinate: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'game_tiles'
  });
};
