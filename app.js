const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const factorRoutes = require('./routes/factor-routes');
const userRoutes = require('./routes/user-routes');
const HttpError = require('./models/http-error');
const bodyParse = require('body-parser');
const app = express();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Elearning API',
      version: '1.0.0',
      contact: {
        name: 'thu.vohoanganh96@gamil.com',
        url: 'https://anhthuvo.github.io/Anh-Thu-Vo-Porfolio.github.io/',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/',
        description: 'Development server'
      },
      {
        url: 'https://elearning-be.herokuapp.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: [
  './controllers/user/login.js',
  './controllers/user/signup.js',
  './controllers/factorRecord/getRecords.js',
  './controllers/factorRecord/createRecord.js',
  './controllers/factorRecord/updateRecord.js',
], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);

const corsOptions = {
  origin: 'http://localhost:3000/',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors());

app.use(bodyParse.json());

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  res.header('Access-Control-Expose-Headers', 'Authorization');
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/factors', factorRoutes);

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({
    message: error.message || 'An unknown error occurred!',
    code: error.code,
    data: error.data
  });
});

mongoose
  .connect('mongodb+srv://everly:xanhduong@elearning.whpyx.mongodb.net/self-tracking?retryWrites=true&w=majority')
  .then(() => {
    app.listen(process.env.PORT || 5000);
    console.log("Connect database successfully");
  })
  .catch(err => {
    console.log("err", err);
  });