'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GameOfUr extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  GameOfUr.init({
    name: DataTypes.STRING,
    passCode: DataTypes.STRING,
    players: DataTypes.INTEGER,
    startDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'GameOfUr',
  });
  return GameOfUr;
};