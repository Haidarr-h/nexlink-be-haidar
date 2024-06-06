const { Sequelize } = require('sequelize')
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = require('../config')

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres'
})

const Users = require('./usersModel')
const Projects = require('./projectsModel')
const Tasks = require('./tasksModel')
const Tokens = require('./tokensModel')
const ProjectsUsers = require('./projectUsersModel')
const TasksUsers = require('./tasksUsersModel')

Projects.belongsToMany(Users, { through: 'ProjectsUsers', foreignKey: 'projectId' });
Users.belongsToMany(Projects, { through: 'ProjectsUsers', foreignKey: 'userId' });
Tasks.belongsToMany(Users, { through: 'TasksUsers', foreignKey: 'taskId' });
Users.belongsToMany(Tasks, { through: 'TasksUsers', foreignKey: 'UserId' });
ProjectsUsers.belongsTo(Users, { foreignKey: 'userId', allowNull: false, onDelete: 'SET NULL', onUpdate: 'CASCADE' });
ProjectsUsers.belongsTo(Projects, { foreignKey: 'projectId', allowNull: false, onDelete: 'SET NULL', onUpdate: 'CASCADE' });
TasksUsers.belongsTo(Users, { foreignKey: 'userId', allowNull: false, onDelete: 'SET NULL', onUpdate: 'CASCADE' });
TasksUsers.belongsTo(Tasks, { foreignKey: 'taskId', allowNull: false, onDelete: 'SET NULL', onUpdate: 'CASCADE' });
Tokens.belongsTo(Users, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });
Users.hasMany(Tokens, { foreignKey: 'userId', as: 'tokens' });

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('Database connected...')
  } catch (error) {
    console.error('Unable to connect to the database:', error)
    return (error)
  }
}
const syncDatabase = async () => {
  try {
    // remove // for production
    await Users.sync()
    await Projects.sync()
    await Tasks.sync()
    await Tokens.sync()
    await ProjectsUsers.sync()
    await TasksUsers.sync()
    console.log('All models were synchronized successfully.')
  } catch (error) {
    console.error('Error syncing database & tables:', error)
  }
}

module.exports = { connectDB, sequelize, Users, Projects, Tasks, Tokens, ProjectsUsers, TasksUsers, syncDatabase }
