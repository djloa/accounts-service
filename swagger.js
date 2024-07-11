// swagger.js

const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Basic Swagger definition
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Accounts Service',
        version: '1.0.0',
        description: 'A simple CRUD API application made with Express and documented with Swagger',
    },
    servers: [
        {
            url: "http://localhost:8080", 
        },
    ],
};

// Options for the swagger docs
const options = {
    swaggerDefinition,
    apis: ['./app.js', './controller/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
    swaggerUi,
    swaggerSpec,
};
