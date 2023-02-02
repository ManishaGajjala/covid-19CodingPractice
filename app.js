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
