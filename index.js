const express = require("express");
var cors = require("cors");
const app = express();
var mysql = require("mysql");
const moment = require("moment");
var sqlinjection = require("sql-injection");

app.use(sqlinjection);

const pool = mysql.createPool({
  host: "us-cdbr-east-03.cleardb.com",
  user: "bb6f06c700a594",
  password: "a6ff4308",
  database: "heroku_ef816c71c051ae4",
});
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("ok");
});

app.post("/reg_user", (req, res) => {
  var message = "";
  var error = false;
  if (!req.body.username.username) {
    error = true;
    message = message.concat("username require\n");
  }
  if (!req.body.password.password) {
    error = true;
    message = message.concat("password require\n");
  }
  if (!req.body.firstName.firstName) {
    error = true;
    message = message.concat("firstName require\n");
  }
  if (!req.body.lastName.lastName) {
    error = true;
    message = message.concat("lastName require\n");
  }
  if (!req.body.gender.gender) {
    error = true;
    message = message.concat("gender require\n");
  }
  if (error == true) {
    res.send({ error, message });
  } else {
    const username = req.body.username.username;
    const password = req.body.password.password;
    const firstName = req.body.firstName.firstName;
    const lastName = req.body.lastName.lastName;
    const gender = req.body.gender.gender;
    var sql = "SELECT * FROM user WHERE username ='" + username + "'";
    pool.query(sql, function (err, result, fields) {
      if (err) throw err;
      if (result.length == 0) {
        sql =
          "INSERT INTO user (username, password, firstName, lastName, gender) VALUES ('" +
          username +
          "','" +
          password +
          "','" +
          firstName +
          "','" +
          lastName +
          "','" +
          gender +
          "')";
        pool.query(sql, function (err, result) {
          if (err) throw err;
          res.send({ error, message: "1 record inserted" });
        });
      } else {
        error = true;
        message = message.concat("username has already\n");
        res.send({ error, message });
      }
    });
  }
  console.log(req.body);
});

app.post("/login_user", (req, res) => {
  var message = "";
  var error = false;
  if (!req.body.username.username) {
    error = true;
    message = message.concat("username require\n");
  }
  if (!req.body.password.password) {
    error = true;
    message = message.concat("password require\n");
  }
  if (error == true) {
    res.send({ error, message });
  } else {
    const username = req.body.username.username;
    const password = req.body.password.password;
    pool.query(
      "SELECT * FROM user WHERE username ='" +
        username +
        "' AND password = '" +
        password +
        "'",
      function (err, result, fields) {
        if (err) throw err;
        recordLogin(username, password);
        if (result.length == 0) {
          error = true;
          message = message.concat("wrong user or password");
          res.send({ error, message });
        } else {
          const token = {
            username: result[0].username,
            firstName: result[0].firstName,
            lastName: result[0].lastName,
            gender: result[0].gender,
          };
          res.status(200).json(token);
          return;
        }
      }
    );
  }
});

app.get("/user/:username", (req, res) => {
  const username = req.params.username;
  pool.query(
    "SELECT * FROM user_login WHERE username = '" + username + "'",
    function (err, result, fields) {
      if (err) throw err;
      res.send(result);
    }
  );
});

function recordLogin(username, password) {
  const timeNow = moment().format("YYYY-MM-DD,HH:mm:ss");
  var sql =
    "SELECT * FROM user WHERE username ='" +
    username +
    "' AND password = '" +
    password +
    "'";
  pool.query(sql, function (err, result, fields) {
    if (err) throw err;
    if (result.length == 1) {
      var sql =
        "INSERT INTO user_login (username, time_in, status) VALUES ('" +
        username +
        "', '" +
        timeNow +
        "', 'Login Complete')";
      pool.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
    } else {
      var sql =
        "INSERT INTO user_login (username, time_in, status) VALUES ('" +
        username +
        "', '" +
        timeNow +
        "', 'Login Fail')";
      pool.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
    }
  });
}

app.put("/user/:username", (req, res) => {
  const username = req.params.username;
  if (req.body.editFirstName == "") {
    res.send({ error: true, message: " first name require" });
  } else if (req.body.editLastName == "") {
    res.send({ error: true, message: " last name require" });
  } else {
    const firstName = req.body.editFirstName;
    const lastName = req.body.editLastName;
    var sql =
      "UPDATE user SET firstName = '" +
      firstName +
      "', lastName = '" +
      lastName +
      "' WHERE username = '" +
      username +
      "'";
    pool.query(sql, function (err, result) {
      if (err) throw err;
      res.send({ error: false, message: "update Complete" });
      console.log(result.affectedRows + " record(s) updated");
    });
  }
});

app.get("/check", (req, res) => {
  res.send("ok");
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Listening on port${port}`));
