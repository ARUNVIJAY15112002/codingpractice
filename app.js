const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const databasePath = path.join(__dirname, "covid19India.db");
const app = express();
app.use(express.json());
let database = null;
const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

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
app.get("/states/", async (request, response) => {
  const getdetails = `
    SELECT 
    *
    FROM 
    state;`;
  const listarray = await database.all(getdetails);
  response.send(listarray.map((x) => convertMovieDbObjectToResponseObject(x)));
});
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getquery = `
    select 
    *
    FROM 
    STATE
    WHERE 
    state_id=${stateId};
    `;
  const states = await database.get(getquery);
  response.send(convertMovieDbObjectToResponseObject(states));
});
app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;
  const postQuery = `
  INSERT INTO
    movie ( district_name,state_id,cases,cured,active,deaths)
  VALUES
    ('${districtName}', ${stateId}, ${cases},${cured},${active},${deaths});`;
  await database.run(postQuery);
  response.send("District Successfully Added");
});

module.exports = app;
