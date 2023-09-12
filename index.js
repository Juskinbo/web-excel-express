const express = require("express");
const cors = require('cors');
const app = express();
const port = 3000;
const apiRoutes = require("./api");

app.use(cors());
app.use("/api", apiRoutes);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
