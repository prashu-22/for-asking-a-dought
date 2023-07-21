const express = require("express");
const app = express();

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

const bcrypt = require("bcrypt");

const path = require("path");
const dbPath = path.join(__dirname, "userData.db");

let db = null;

const initialization = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("server Running at localhost");
        });
    } catch (e) {
        console.log(`error at ${e.message}`);
        process.exit(1);
    }
};

initialization();

app.post("/register/", async (request, response) => {
    const { username, name, password, gender, location } = request.body;
    const hashedPassword = await bcrypt.hash(password, 20);
    const userQuery = `SELECT * FROM user WHERE username = '${username}'`;
    const dbResult = await db.get(userQuery);

    if (dbResult === undefined) {
        let length = password.length();
        if (length < 5) {
            response.status(400);
            response.send("Password is too short");
        } else {
            const createUserQuery = `INSERT INTO user(username,name,password,gender,location) VALUES 
            (${username},
            ${name},${hashedPassword},${gender},${location});
            `;
            const created = await db.run(createUserQuery);
            response.status(200);
            response.send("User created successfully");
        }
    } else {
        response.status(400);
        response.send("User already exists");
    }
});

module.exports = app;
