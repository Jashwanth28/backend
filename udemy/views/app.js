const express = require("express");
const http = require("http");
const app = express();

app.set("view engine", "ejs");
app.get("/", (req, res) => {
    res.send("helelel");
});
app.get("/weather", (req, res) => {
    res.render("index");
});

app.listen(3000, () => {
    console.log("server is working on 3000 port");
});