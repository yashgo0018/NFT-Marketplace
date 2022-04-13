import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DB_SCHEMA, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_TYPE || 'postgres',
    dialectOptions: {
        ssl: process.env.DB_SSL == "true"
    }
});

export default sequelize;