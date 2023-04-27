import ejs from "ejs";
import express from "express";
import path from "path";
import mongoose from "mongoose";
import http from "http";
import cookieParser from "cookie-parser";
import { nextTick } from "process";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


mongoose.connect("mongodb://127.0.0.1:27017/backend")
    .then(() => console.log("Database Connected"))
    .catch((e) => console.log(e));

const userschema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});
const User = mongoose.model("User", userschema);


const app = express();

app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const isAuthenticate = async(req, res, next) => {

    const { token } = req.cookies;
    if (token) {
        const decode = jwt.verify(token, "asdfasdf");
        req.user = await User.findById(decode._id);
        next();
    } else {
        res.redirect("/login");
    }

};
app.get("/", isAuthenticate, (req, res, next) => {
    res.render("logout", { name: req.user.name });
});

app.get("/logout", (req, res) => {
    res.clearCookie("token"); // Clear the token cookie
    res.redirect("/"); // Redirect to the home page
});
app.get("/register", (req, res) => {
    res.render("register");
});
app.get("/login", (req, res) => {
    res.render("login");
});
app.post("/login", async(req, res) => {
    const { email, password, } = req.body;
    let user = await User.findOne({ email });
    if (!user) return res.render("login", { email, msg1: "Account not found with this Email" });

    const ismatch = await bcrypt.compare(password, user.password);
    if (!ismatch) return res.render("login", { email, msg: "Incorrect Password" });


    const token = jwt.sign({ _id: user._id }, "asdfasdf");
    res.cookie("token", token, {
        httpOnly: true,
    });
    console.log(req.body);
    res.redirect("/");

})
app.post("/register", async(req, res) => {

    const { name, email, password, } = req.body;
    const existinguser = await User.findOne({ email });

    const hashpass = await bcrypt.hash(password, 10);
    if (existinguser)

        return res.render("register", { name, email, arr: "Email Already Registered, Please Login" });



    const newuser = await User.create({
        name,
        email,
        password: hashpass,
    });

    const token = jwt.sign({ _id: newuser._id }, "asdfasdf");


    res.cookie("token", token, {
        httpOnly: true,
    });
    console.log(req.body);

    res.redirect("/");

});

app.listen(5000, () => {
    console.log("Server is working");
});