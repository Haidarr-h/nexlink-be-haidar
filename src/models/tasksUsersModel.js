const { DataTypes } = require('sequelize')
const { sequelize } = require('../utils/db')

const TasksUsers = sequelize.define('TaskUser', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE }
})

module.exports = TasksUsers
