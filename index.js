const express = require('express');
const axios = require('axios');
const app = express();
require("dotenv").config();

app.set("view engine", "pug");
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.HUBSPOT_API_KEY;
const CUSTOM_OBJECT_TYPE_ID = "2-170340105";
const HUBSPOT_DOMAIN = "https://api.hubapi.com";
const CUSTOM_OBJECT_URI = `${HUBSPOT_DOMAIN}/crm/v3/objects/${CUSTOM_OBJECT_TYPE_ID}`;

app.get("/", async (req, res) => {
  const url = `${CUSTOM_OBJECT_URI}?properties=batting_style,debut_year,is_captain,role,player_name`;
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    "Content-Type": "application/json",
  };

  try {
    const response = await axios.get(url, { headers });
    const data = response.data.results;
    res.render("homepage", {
      title: "List Cricket Players | HubSpot APIs",
      data,
    });
  } catch (err) {
    console.error(error);
  }
});

app.get("/update-cobj", async (req, res) => {
  const id = req.query.id;
  let record = null;

  if (id) {
    try {
      const url = `${CUSTOM_OBJECT_URI}/${id}?properties=player_name,role,debut_year,batting_style,is_captain`;
      const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        "Content-Type": "application/json",
      };
      const response = await axios.get(url, { headers });
      record = response.data;
    } catch (error) {
      console.error("Error fetching record:", error);
    }
  }

  res.render("updates", {
    title: id ? "Update Player" : "Add Player",
    record,
    isUpdate: Boolean(id),
  });
});

app.post("/update-cobj", async (req, res) => {
  const headers = {
    Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
    "Content-Type": "application/json",
  };

  const recordData = {
    properties: {
      player_name: req.body.player_name,
      role: req.body.role,
      debut_year: req.body.debut_year,
      batting_style: req.body.batting_style,
      is_captain: req.body.is_captain,
    },
  };

  const recordId = req.body.id;

  try {
    if (recordId) {
      const updateUrl = `${CUSTOM_OBJECT_URI}/${recordId}`;
      await axios.patch(updateUrl, recordData, { headers });
    } else {
      await axios.post(CUSTOM_OBJECT_URI, recordData, { headers });
    }

    res.redirect("/");
  } catch (error) {
    console.error(
      "Error saving custom object:",
      error?.response?.data || error.message
    );
    res.status(500).send("Failed to save record");
  }
});



// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));