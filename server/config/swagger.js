const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Answer Dash API",
      version: "1.0.0",
      description:
        "API documentation for Answer Dash authentication and leaderboard routes",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
      {
        url: "https://answer-dash.onrender.com",
        description: "Render deployed server",
      },
    ],
  },
  apis: [__dirname + "/../routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
