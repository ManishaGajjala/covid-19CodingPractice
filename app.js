const express = require("express");
const { open } = require("sqlite");
const app = express();
const path = require("path");
app.use(express.json());
let db = null;
const dbPath = path.join(__dirname, "covid19India.db");
const sqlite3 = require("sqlite3");

//Initializing database and server

const initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBandServer();

//API 1

const convertDBObjectToResponseObjectAPI1 = (dbObject) => {
  return {
    stateId: dbObject.state_id,
    stateName: dbObject.state_name,
    population: dbObject.population,
  };
};

app.get("/states/", async (request, response) => {
  const getStatesQuery = `
        SELECT * FROM state
        ORDER BY state_id;
    `;
  const statesArray = await db.all(getStatesQuery);
  response.send(
    statesArray.map((eachstate) =>
      convertDBObjectToResponseObjectAPI1(eachstate)
    )
  );
});

//API2
app.get("/states/:stateId", async (request, response) => {
  const { stateId } = request.params;
  const getStateByIdQuery = `
        SELECT * FROM state
        WHERE state_id=${stateId};
    `;
  const state = await db.get(getStateByIdQuery);
  console.log(state);
  console.log(convertDBObjectToResponseObjectAPI1(state));
  response.send(convertDBObjectToResponseObjectAPI1(state));
});

//API3
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addDetailsQuery = `
        INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
        VALUES
        ('${districtName}',${stateId},${cases},${cured},${active},${deaths});
    `;
  await db.run(addDetailsQuery);
  response.send("District Successfully Added");
});

//API4
const convertDbObjectToResponseObjectAPI4 = (dbObject) => {
  return {
    districtId: dbObject.district_id,
    districtName: dbObject.district_name,
    stateId: dbObject.state_id,
    cases: dbObject.cases,
    active: dbObject.active,
    deaths: dbObject.deaths,
  };
};

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrictQueryByID = `
        SELECT * FROM district
        WHERE district_id=${districtId};
    `;
  const district = await db.get(getDistrictQueryByID);
  response.send(convertDbObjectToResponseObjectAPI4(district));
});

//API5
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const deleteDistrictQuery = `
        DELETE FROM district
        WHERE district_id=${districtId};
    `;
  await db.run(deleteDistrictQuery);
  response.send("District Removed");
});

//API6
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const updateDistrictQuery = `
        UPDATE district
        SET 
            district_name='${districtName}',
            state_id=${stateId},
            cases=${cases},
            cured=${cured},
            active=${active},
            deaths=${deaths}
        WHERE district_id=${districtId};
    `;
  await db.run(updateDistrictQuery);
  response.send("District Details Updated");
});

//API7
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getStatsQuery = `
        SELECT SUM(cases),
                SUM(cured),
                SUM(active),
                SUM(deaths)
        FROM district
        WHERE state_id=${stateId};
    `;
  const stats = await db.get(getStatsQuery);
  //console.log(stats);
  response.send({
    totalCases: stats["SUM(cases)"],
    totalCured: stats["SUM(cured)"],
    totalActive: stats["SUM(active)"],
    totalDeaths: stats["SUM(deaths)"],
  });
});

//API8
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getStateNameQuery = `
        SELECT state_name 
        FROM district INNER JOIN state ON
        state.state_id=district.state_id
        WHERE district_id=${districtId};

    `;
  const state = await db.get(getStateNameQuery);
  console.log(state);
  response.send({
    stateName: state["state_name"],
  });
});

module.exports = app;
