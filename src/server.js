const express = require('express');
const connectDb = require('./config/dbConnection');
const errorHandler = require('./middleware/errorHandler');
const cors = require('cors');

var cookieParser = require('cookie-parser');
// const dotenv = require('dotenv').config();
require('dotenv').config();

connectDb();
const app = express();
app.use(cors());
app.use(cookieParser());
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use("/api/contacts", require("./routes/contactRoutes"));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
