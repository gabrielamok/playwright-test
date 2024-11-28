const { request } = require('playwright'); // Playwright's request API
const fs = require('fs');

(async () => {
  const apiContext = await request.newContext(); // Create a request context

  const loadTestConfig = {
    totalRequests: 100, // Total number of requests to send
    concurrency: 10,    // Number of concurrent requests
    endpoint: 'https://restful-booker.herokuapp.com/booking',
    method: 'GET',      // HTTP method
  };

  const results = []; // Array to hold results for each request

  const sendRequest = async (index) => {
    const startTime = Date.now();
    try {
      const response = await apiContext.get(loadTestConfig.endpoint);
      const duration = Date.now() - startTime;

      results.push({
        requestNumber: index,
        status: response.status(),
        responseTime: duration,
        success: response.ok(),
      });

      console.log(`Request #${index} completed: ${response.status()} in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      results.push({
        requestNumber: index,
        status: 'Error',
        responseTime: duration,
        success: false,
        error: error.message,
      });

      console.error(`Request #${index} failed: ${error.message}`);
    }
  };

  // Function to handle concurrent requests
  const sendConcurrentRequests = async (concurrency) => {
    const promises = [];
    for (let i = 0; i < concurrency; i++) {
      promises.push(sendRequest(i + 1));
    }
    await Promise.all(promises);
  };

  console.log('Starting load test...');

  // Run the load test
  for (let i = 0; i < loadTestConfig.totalRequests / loadTestConfig.concurrency; i++) {
    console.log(`Batch ${i + 1}/${loadTestConfig.totalRequests / loadTestConfig.concurrency}`);
    await sendConcurrentRequests(loadTestConfig.concurrency);
  }

  console.log('Load test completed.');

  // Save the results to a text file
  const resultsText = results.map(result => JSON.stringify(result, null, 2)).join('\n\n');
  try {
    fs.writeFileSync('loadTestResults.txt', resultsText, 'utf-8');
    console.log('Load test results saved to loadTestResults.txt');
  } catch (error) {
    console.error('Error writing results to file:', error.message);
  }

  // Clean up
  await apiContext.dispose();
})();
