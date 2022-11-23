const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "covid19India.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

convertStateDbIntoResponseDb = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

convertDistrictDbIntoResponseDb = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    cured: dbObject.cured,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

//API1//
app.get("/states/", async (request, response) => {
  const stateQuery = `SELECT * FROM state;`;
  const statesList = await database.all(stateQuery);
  response.send(convertStateDbIntoResponseDb(statesList));
});

//API2//
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const stateIdQuery = `SELECT * FROM state WHERE state_id=${stateId}`;
  const state = await database.get(stateIdQuery);
  response.send(convertStateDbIntoResponseDb(state));
});

//API3//
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postDistrictQuery = `
  INSERT INTO
    district ( director_name, state_id, cases, cured, active, deaths)
  VALUES
    (${districtName}, '${stateId}', '${cases}', '${cured}', '${active}', '${deaths}');`;
  await database.run(postDistrictQuery);
  response.send("District Successfully Added");
});

module.exports = app;
