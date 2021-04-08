const path = require('path')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const methodOverride = require('method-override')
const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const connectDB = require('./config/db')
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

//Load config
dotenv.config({ path: './config/config.env' })
require('./config/passport')(passport)

connectDB()

const app = express()

//Body parser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//Method Override
app.use(methodOverride(function(req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
    }
}))

//Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}


// Handlebars Helpers
const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')
const swaggerJSDoc = require('swagger-jsdoc')

//Handlebars
app.engine('.hbs', exphbs({ helpers: { formatDate, stripTags, truncate, editIcon, select }, defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

// Sessions

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })

}))

// Passport middleware
app.use(passport.initialize())
app.use(passport.session())
    // Static folder
app.use(express.static(path.join(__dirname, 'public')))

//Set gloal var
app.use(function(req, res, next) {
    res.locals.user = req.user || null
    next()
})
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'SYLARD DOCUMENTATION EXAMPLE',
            description: "THIS IS A EXAMPLE OF DOCUMENTATION SYLARD",
            contact: {
                name: "Alberto Mondragón Escamilla"
            },
            servers: ["http://localhost:3500"]
        }
    },
    //['Aqui va la ruta en donde quieres comentar el codigo']
    apis: ["app.js"]
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
/**
 * @swagger
 * /sylard:
 *  get:
 *  Description: Use to request all customers
 *  responses:
 *      '200':
 *        description: Its Correct!
 */

//Routes
app.get("/sylard", (req, res) => {
    res.status(200).send("SYLARD DOCUMENTATION");
});
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))
const PORT = process.env.PORT || 3500


app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))