const express = require('express');
const bodyParser = require('body-parser');
const clientsRouter = require('./backend/routes/clients');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use('/clients', clientsRouter);

app.get('/', (req, res) => {
  res.send('I am alive!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is alive on port ${PORT}`));
