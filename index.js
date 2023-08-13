const express = require("express");
const app = express();
const port = 3000;
const apiRoutes = require("./api");

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });
app.use("/api", apiRoutes);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
