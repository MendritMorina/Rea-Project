// Imports: local files.
const app = require('./app');
const { env, db } = require('./utils/functions');

// Check if .env is correctly setup.
const isEnvSetup = env.validateEnv();
if (!isEnvSetup) {
  console.log('===================================================================');
  console.log(`Your .env file is missing or it doesnt have the correct keys!`);
  console.log('===================================================================');
  process.exit(1);
}

console.log('===================================================================');
console.log('Environment variables loaded succesfully!');
console.log('===================================================================');

(async () => {
  try {
    const dbResult = await db.connect();
    if (!dbResult.success) {
      console.log(`Failed to connect to the database: ${dbResult.error}!`);
      console.log('===================================================================');
      process.exit(1);
    }
    console.log(`Successfully connected to the database!`);
    console.log('===================================================================');

    const { nodeEnv, nodePort } = env.getByKeys(['nodeEnv', 'nodePort']);
    app.listen(() => {
      console.log(`Server started on port ${nodePort} on ${nodeEnv} mode!`);
      console.log('===================================================================');
    });
  } catch (error) {
    console.log(`Failed to start server: ${error.message}!`);
    console.log('===================================================================');
    process.exit(1);
  }
})();
