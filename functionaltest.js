const { request } = require('playwright'); // Playwright's request API
const fs = require('fs');

(async () => {
  // Create a request context
  const apiContext = await request.newContext();

  // Results array to store test outcomes
  const functionalTestResults = [];

  try {
    // 1. Test: Create a new booking
    const newBookingResponse = await apiContext.post('https://restful-booker.herokuapp.com/booking', {
      data: {
        firstname: 'John',
        lastname: 'Doe',
        totalprice: 150,
        depositpaid: true,
        bookingdates: {
          checkin: '2024-01-01',
          checkout: '2024-01-07'
        },
        additionalneeds: 'Breakfast'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const createdBooking = await newBookingResponse.json();
    functionalTestResults.push({
      test: 'Create a New Booking',
      status: newBookingResponse.status(),
      expected: 200,
      result: newBookingResponse.status() === 200 ? 'Passed' : 'Failed',
      bookingId: createdBooking.bookingid
    });

    // 2. Test: Retrieve the booking using booking ID
    const bookingId = createdBooking.bookingid;
    const getBookingResponse = await apiContext.get(`https://restful-booker.herokuapp.com/booking/${bookingId}`);
    
    functionalTestResults.push({
      test: 'Retrieve Booking by ID',
      status: getBookingResponse.status(),
      expected: 200,
      result: getBookingResponse.status() === 200 ? 'Passed' : 'Failed'
    });

    // 3. Test: Update the booking with new details
    const updateBookingResponse = await apiContext.put(`https://restful-booker.herokuapp.com/booking/${bookingId}`, {
      data: {
        firstname: 'John',
        lastname: 'Updated',
        totalprice: 200,
        depositpaid: false,
        bookingdates: {
          checkin: '2024-02-01',
          checkout: '2024-02-07'
        },
        additionalneeds: 'Dinner'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    functionalTestResults.push({
      test: 'Update Booking',
      status: updateBookingResponse.status(),
      expected: 200,
      result: updateBookingResponse.status() === 200 ? 'Passed' : 'Failed'
    });

    // 4. Test: Delete the booking
    const deleteBookingResponse = await apiContext.delete(`https://restful-booker.herokuapp.com/booking/${bookingId}`);
    
    functionalTestResults.push({
      test: 'Delete Booking',
      status: deleteBookingResponse.status(),
      expected: 201,
      result: deleteBookingResponse.status() === 201 ? 'Passed' : 'Failed'
    });

    // Save results to a text file
    const resultsText = functionalTestResults.map(result => JSON.stringify(result, null, 2)).join('\n\n');
    fs.writeFileSync('functionalTestResults.txt', resultsText, 'utf-8');
    console.log('Functional test results saved to functionalTestResults.txt');
  } catch (error) {
    console.error('Error during functional tests:', error);
  } finally {
    // Clean up the API context
    await apiContext.dispose();
  }
})();
