const { chromium, request } = require('playwright');
const fs = require('fs');

(async () => {
  // Create a request context
  const apiContext = await request.newContext();

  try {
    // Example test 1: Get booking IDs
    const response1 = await apiContext.get('https://restful-booker.herokuapp.com/booking');
    const bookingIds = await response1.json();
    console.log('Booking IDs:', bookingIds);

    // Example test 2: Create a new booking
    const newBookingData = {
      firstname: 'John',
      lastname: 'Doe',
      totalprice: 123,
      depositpaid: true,
      bookingdates: {
        checkin: '2023-01-01',
        checkout: '2023-01-10'
      },
      additionalneeds: 'Breakfast'
    };

    const response2 = await apiContext.post('https://restful-booker.herokuapp.com/booking', {
      data: newBookingData,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const createdBooking = await response2.json();
    console.log('Created Booking:', createdBooking);

    // Save results to a file
    const results = `
    Test 1: Get booking IDs
    Response: ${JSON.stringify(bookingIds, null, 2)}

    Test 2: Create a new booking
    Response: ${JSON.stringify(createdBooking, null, 2)}
    `;

    fs.writeFileSync('testResults.txt', results, 'utf-8');
    console.log('Test results saved to testResults.txt');
  } catch (error) {
    console.error('Error during tests:', error);
  } finally {
    // Clean up the API context
    await apiContext.dispose();
  }
})();
