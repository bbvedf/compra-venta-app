// testRequests.js
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function makeRequest(path) {
  try {
    const res = await axios.get(`${BASE_URL}${path}`);
    console.log(`Response ${res.status}: ${res.data}`);
  } catch (err) {
    if (err.response) {
      console.log(`Response ${err.response.status}: ${err.response.data.error}`);
    } else {
      console.log('Error:', err.message);
    }
  }
}

async function runTest() {
  // Requests normales
  await makeRequest('/');
  await makeRequest('/api/auth');
  
  // Requests que devuelven error para probar logs de error
  await makeRequest('/api/error');
  
  // Request inexistente (404)
  await makeRequest('/no-existe');
}

runTest();
