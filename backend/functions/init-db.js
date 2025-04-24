const { initializeDatabase } = require('./db-init');

exports.handler = async function(event, context) {
  try {
    const result = await initializeDatabase();
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
