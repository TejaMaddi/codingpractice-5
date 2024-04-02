const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
let db = null
const app = express()
app.use(express.json())
const dbpath = path.join(__dirname, 'moviesData.db')
const intializeDBAndSever = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DBERROR:${e.message}`)
    process.exit(1)
  }
}
intializeDBAndSever()

const convert = obj => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  }
}
const table2 = obj1 => {
  return {
    directorId: obj1.director_id,
    directorName: obj1.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMovieName = `
    SELECT movie_name FROM movie; 
    `
  const names = await db.all(getMovieName)
  response.send(names.map(i => ({movieName: i.movie_name})))
})

app.post('/movies/', async (request, response) => {
  const details = request.body
  const {directorId, movieName, leadActor} = details
  const addMovie = `
  INSERT INTO movie(director_id,movie_name,lead_actor)
  VALUES (
    '${directorId}',
    '${movieName}',
    '${leadActor}'
  );
  `
  const dbResponse = await db.run(addMovie)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getALl = `
  SELECT * FROM movie WHERE movie_id =${movieId};
  `
  const api3 = await db.get(getALl)
  response.send(convert(api3))
})

app.put('/movies/:movieId', async (request, response) => {
  const details = request.body
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = details
  const updateQuery = `
  UPDATE movie
  SET director_id='${directorId}',
  movie_name='${movieName}',
  lead_actor='${leadActor}'
  WHERE movie_id='${movieId}';
  `
  await db.run(updateQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `
  DELETE FROM movie 
  WHERE movie_id='${movieId}'
  `
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const getALl1 = `
  SELECT * FROM director;
  `
  const api6 = await db.all(getALl1)
  response.send(api6.map(i => table2(i)))
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const result = `
    SELECT movie_name
    FROM movie
    WHERE director_id='${directorId}'
  `
  const dbRes = await db.all(result)
  response.send(dbRes.map(i => ({movieName: i.movie_name})))
})
module.exports = app
