/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tiles', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    letter: {
      type: DataTypes.CHAR,
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'tiles'
  });
};
