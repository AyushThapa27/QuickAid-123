const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const methodOverride = require("method-override");
const mysql = require('mysql2');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'learningMySQL@123',
    database: 'QuickAid'
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
    connection.release();
});

app.get("/QuickAid", (req, res) => {
    res.render("index");
});

app.get("/QuickAid/Emergency", (req, res) => {
    const { latitude, longitude, pincode } = req.query;
    if (!latitude || !longitude || !pincode) {
        return res.status(400).send("Missing parameters.");
    }

    pool.query('SELECT * FROM emergency_contacts WHERE pincode = ?', [pincode], (err, results) => {
        if (err) {
            console.error('Database fetch error:', err);
            return res.status(500).send('Error fetching data from the database.');
        }

        if (results.length > 0) {
            const contact = results[0];
            res.render("show", {
                latitude,
                longitude,
                pincode,
                hospital: contact.hospital_name && contact.hospital_name.trim() !== "" ? contact.hospital_name : "Not Available",
                hospitalNumber: contact.hospital_number && contact.hospital_number.trim() !== "" ? contact.hospital_number : "0135-2751000",
                policeStation: contact.police_station_name && contact.police_station_name.trim() !== "" ? contact.police_station_name : "Not Available",
                policeStationNumber: contact.police_station_number && contact.police_station_number.trim() !== "" ? contact.police_station_number : "100",
                ambulanceNumber: contact.ambulance_number && contact.ambulance_number.trim() !== "" ? contact.ambulance_number : "108",
                womenHelpline: contact.women_helpline_number && contact.women_helpline_number.trim() !== "" ? contact.women_helpline_number : "1091",
                fireStation: contact.fire_station_number && contact.fire_station_number.trim() !== "" ? contact.fire_station_number : "101"
            });
        } else {
            res.send("No emergency contact data found for this pincode.");
        }
    });
});

app.post("/QuickAid/Emergency", (req, res) => {
    const { latitude, longitude, pincode } = req.body;
    console.log("Received Data from Frontend:");
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);
    console.log("Pincode:", pincode);

    res.redirect(`/QuickAid/Emergency?latitude=${latitude}&longitude=${longitude}&pincode=${pincode}`);
});

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});
