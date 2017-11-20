/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('messages', {
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
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    gameId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'games',
        key: 'id'
      }
    }
  }, {
    tableName: 'messages'
  });
};
