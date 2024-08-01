const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Predefined booking codes
const bookingCodesArray = ['google', 'hi', 'bye', 'ai', 'why', 'goodbye'];
let bookingCodesIndex = 0; // To track the current index in the booking codes array
let bookedEmails = new Set();
let availableSeats = 6; // Default value

// Load available seats from file
const seatsFilePath = path.join(__dirname, 'availableSeats.json');
if (fs.existsSync(seatsFilePath)) {
    const data = fs.readFileSync(seatsFilePath, 'utf8');
    availableSeats = JSON.parse(data).availableSeats;
}

// Save available seats to file
const saveSeatsToFile = () => {
    fs.writeFileSync(seatsFilePath, JSON.stringify({ availableSeats }), 'utf8');
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ibkamnoukam@gmail.com', // Your Gmail address
        pass: 'ifpl kisa abts tkuv'     // Your app-specific password
    }
});

// Serve the HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/booking.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'booking.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Endpoint to get available seats
app.get('/seats', (req, res) => {
    console.log(`Available seats: ${availableSeats}`); // Log the current value
    res.json({ availableSeats });
});

app.post('/book', (req, res) => {
    const { name, email, age } = req.body;

    if (bookedEmails.has(email)) {
        return res.status(400).json({ error: 'This email has already been used to book a seat.' });
    }

    // Check if there are available seats
    if (availableSeats <= 0) {
        return res.status(400).json({ error: 'No seats available.' });
    }

    // Assign a booking code
    const code = bookingCodesArray[bookingCodesIndex];
    bookingCodesIndex++;
    bookedEmails.add(email);
    availableSeats--; // Decrease available seats
    saveSeatsToFile(); // Save the updated number of seats to file

    const mailOptions = {
        from: 'ibkamnoukam@gmail.com', // Your Gmail address
        to: email, // Recipient's email address
        subject: 'Booking Confirmation',
        text: `Hi ${name},\n\nYour booking is confirmed. Your code is: ${code}\n\nEnjoy the movie!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Error sending email' });
        }
        console.log('Email sent: ' + info.response);
        res.json({ message: 'Booking confirmed! Check your email for the booking code.', availableSeats });
    });
});
