require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db.js');

connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
