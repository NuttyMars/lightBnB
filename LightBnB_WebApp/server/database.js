const properties = require('./json/properties.json');
const users = require('./json/users.json');

//connect to database using node-postgres
const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {
  const query = {
    text: `SELECT * FROM users
    WHERE email = $1`,
    values: [email]
  };

  return pool
    .query(query)
    .then(result => result.rows[0])
    .catch(err => console.error('query error', err.stack));
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  const query = {
    text: `SELECT * FROM users
    WHERE id = $1`,
    values: [id]
  };

  return pool
    .query(query)
    .then(result => result.rows[0])
    .catch(err => console.error('query error', err.stack));
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {
  const query = {
    text: `INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *`,
    values: [user.name, user.email, user.password]
  };

  return pool
    .query(query)
    .then(result => result.rows[0])
    .catch(err => console.error('query error', err.stack));
  
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  const query = {
    text: `SELECT reservations.*, properties.*, AVG(rating) AS average_rating
    FROM property_reviews
    JOIN reservations ON reservations.id = property_reviews.reservation_id
    JOIN properties ON properties.id = reservations.property_id
    WHERE reservations.guest_id = $1
    AND reservations.end_date <> now()::date
    GROUP BY reservations.id, properties.id
    ORDER BY reservations.start_date
    LIMIT $2;`,
    values: [guest_id, limit]
  };

  return pool
    .query(query)
    .then(result => result.rows)
    .catch(err => console.error('query error', err.stack));
}
// console.log(getAllReservations(100, 10));
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {

  const query = {
    text: `SELECT properties.*, AVG(property_reviews.rating) AS average_rating
    FROM properties JOIN property_reviews 
    ON properties.id = property_id
    WHERE city LIKE '%ancouve%'
    GROUP BY properties.id
    HAVING AVG(property_reviews.rating) >= 4
    ORDER BY cost_per_night
    LIMIT $1;`,
    values: [limit]
  };

  return pool
    .query(query)
    .then(result => result.rows)
    .catch(err => console.error('query error', err.stack));

}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  // const query = {
  //   text: `INSERT INTO properties (
  //     owner_id,
  //     title,
  //     description,
  //     thumbnail_photo_url,
  //     cover_photo_url,
  //     cost_per_night,
  //     parking_spaces,
  //     number_of_bathrooms,
  //     number_of_bedrooms,
  //     country,
  //     street,
  //     city,
  //     province,
  //     post_code)
  //   VALUES ($1, $2, $3)
  //   RETURNING *`,
  //   values: [user.name, user.email, user.password]
  // };

  // return pool
  //   .query(query)
  //   .then(result => result.rows[0])
  //   .catch(err => console.error('query error', err.stack));
}
exports.addProperty = addProperty;
