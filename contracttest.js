const { request } = require('playwright');
const fs = require('fs');

(async () => {
  // Create a request context
  const apiContext = await request.newContext();

  try {
    const contractResults = [];

    // Test 1: Verify GET /booking returns a list of bookings
    const getBookingResponse = await apiContext.get('https://restful-booker.herokuapp.com/booking');
    const getBookingData = await getBookingResponse.json();

    contractResults.push({
      test: 'GET /booking returns a list of bookings',
      status: getBookingResponse.status(),
      expectedStatus: 200,
      result: getBookingResponse.status() === 200 ? 'Passed' : 'Failed',
      dataFormat: Array.isArray(getBookingData) ? 'Valid Array' : 'Invalid Format',
    });

    // Test 2: Verify GET /booking/:id returns booking details
    const sampleBookingId = getBookingData[0]?.bookingid || 1; // Use the first ID from the list or default to 1
    const getBookingByIdResponse = await apiContext.get(
      `https://restful-booker.herokuapp.com/booking/${sampleBookingId}`
    );
    const getBookingByIdData = await getBookingByIdResponse.json();

    contractResults.push({
      test: 'GET /booking/:id returns booking details',
      status: getBookingByIdResponse.status(),
      expectedStatus: 200,
      result: getBookingByIdResponse.status() === 200 ? 'Passed' : 'Failed',
      dataFormat: getBookingByIdData?.firstname ? 'Valid Format' : 'Invalid Format',
    });

    // Test 3: Verify POST /booking creates a booking
    const createBookingPayload = {
      firstname: 'John',
      lastname: 'Doe',
      totalprice: 123,
      depositpaid: true,
      bookingdates: {
        checkin: '2023-01-01',
        checkout: '2023-01-02',
      },
      additionalneeds: 'Breakfast',
    };

    const createBookingResponse = await apiContext.post('https://restful-booker.herokuapp.com/booking', {
      data: createBookingPayload,
    });
    const createBookingData = await createBookingResponse.json();

    contractResults.push({
      test: 'POST /booking creates a booking',
      status: createBookingResponse.status(),
      expectedStatus: 200,
      result: createBookingResponse.status() === 200 ? 'Passed' : 'Failed',
      dataFormat: createBookingData?.booking?.firstname === 'John' ? 'Valid Format' : 'Invalid Format',
    });

    // Test 4: Verify schema of GET /booking/:id
    const expectedSchema = {
      firstname: 'string',
      lastname: 'string',
      totalprice: 'number',
      depositpaid: 'boolean',
      bookingdates: 'object',
      additionalneeds: 'string',
    };

    const validateSchema = (data, schema) =>
      Object.keys(schema).every((key) => typeof data[key] === schema[key]);

    contractResults.push({
      test: 'Schema Validation for GET /booking/:id',
      result: validateSchema(getBookingByIdData, expectedSchema) ? 'Passed' : 'Failed',
      actualSchema: Object.keys(getBookingByIdData).reduce((acc, key) => {
        acc[key] = typeof getBookingByIdData[key];
        return acc;
      }, {}),
    });

    // Save results to a file
    const resultsText = contractResults.map((result) => JSON.stringify(result, null, 2)).join('\n\n');
    fs.writeFileSync('contractTestResults.txt', resultsText, 'utf-8');
    console.log('Contract test results saved to contractTestResults.txt');
  } catch (error) {
    console.error('Error during contract tests:', error);
  } finally {
    // Clean up the API context
    await apiContext.dispose();
  }
})();
