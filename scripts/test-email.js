const https = require('https');
const http = require('http');

async function testEmailSending() {
  console.log('📧 Testing email reminder system...\n');

  const currentMonth = new Date().toISOString().slice(0, 7);

  const data = JSON.stringify({
    reminderType: 'first',
    month: currentMonth
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/reminders/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log(`Sending test reminder for month: ${currentMonth}`);
  console.log('Reminder type: first\n');

  const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('Response Status:', res.statusCode);
      console.log('Response:', JSON.stringify(JSON.parse(responseData), null, 2));

      if (res.statusCode === 200) {
        console.log('\n✅ Email test completed!');
        console.log('Check your email inbox: bh4hb@virginia.edu\n');
      } else {
        console.log('\n❌ Email test failed. Check the error above.\n');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.write(data);
  req.end();
}

testEmailSending();
