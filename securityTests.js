const { request } = require('playwright');
const fs = require('fs');

(async () => {
  // Create a request context
  const apiContext = await request.newContext();

  try {
    const securityResults = [];

    // Test 1: Access without Authorization
    const unauthorizedResponse = await apiContext.get('https://restful-booker.herokuapp.com/booking');
    securityResults.push({
      test: 'Access without Authorization',
      status: unauthorizedResponse.status(),
      expected: '200 or 401 (depends on endpoint)',
      result: unauthorizedResponse.status() === 200 || unauthorizedResponse.status() === 401 ? 'Passed' : 'Failed'
    });

    // Test 2: Check for CORS headers
    const corsResponse = await apiContext.get('https://restful-booker.herokuapp.com/booking');
    const corsHeaders = corsResponse.headers()['access-control-allow-origin'];
    securityResults.push({
      test: 'CORS Headers Present',
      result: corsHeaders ? 'Passed' : 'Failed',
      value: corsHeaders || 'Not present'
    });

    // Test 3: HTTP Methods Validation (OPTIONS should be allowed)
    const optionsResponse = await apiContext.fetch('https://restful-booker.herokuapp.com/booking', { method: 'OPTIONS' });
    securityResults.push({
      test: 'OPTIONS Method Allowed',
      status: optionsResponse.status(),
      expected: '204',
      result: optionsResponse.status() === 204 ? 'Passed' : 'Failed'
    });

    // Test 4: HTTP Methods Rejection (e.g., PUT not allowed on /booking without ID)
    const invalidPutResponse = await apiContext.fetch('https://restful-booker.herokuapp.com/booking', { method: 'PUT' });
    securityResults.push({
      test: 'PUT Method Rejected on /booking',
      status: invalidPutResponse.status(),
      expected: '405 or 404',
      result: invalidPutResponse.status() === 405 || invalidPutResponse.status() === 404 ? 'Passed' : 'Failed'
    });

    // Test 5: Check Security Headers (e.g., X-Content-Type-Options)
    const headersResponse = await apiContext.get('https://restful-booker.herokuapp.com/booking');
    const xContentTypeOptions = headersResponse.headers()['x-content-type-options'];
    securityResults.push({
      test: 'X-Content-Type-Options Header Present',
      result: xContentTypeOptions === 'nosniff' ? 'Passed' : 'Failed',
      value: xContentTypeOptions || 'Not present'
    });

    // Save results to a file
    const resultsText = securityResults.map(result => JSON.stringify(result, null, 2)).join('\n\n');
    fs.writeFileSync('securityTestResults.txt', resultsText, 'utf-8');
    console.log('Security test results saved to securityTestResults.txt');
  } catch (error) {
    console.error('Error during security tests:', error);
  } finally {
    // Clean up the API context
    await apiContext.dispose();
  }
})();
