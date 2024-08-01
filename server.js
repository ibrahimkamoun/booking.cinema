const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Predefined booking codes
const bookingCodesArray = ['google', 'hi', 'bye', 'ai', 'why', 'goodbye'];
let bookingCodesIndex = 0; // To track the current index in the booking codes array
let bookedEmails = new Set();
let availableSeats = 10; // Total available seats

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ibkamoukam@gmail.com', // Your Gmail address
        pass: 'dikv hpba tkbf lgkh'     // Your app-specific password
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Endpoint to get available seats
app.get('/seats', (req, res) => {
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

    const mailOptions = {
        from: 'ibkamoukam@gmail.com', // Your Gmail address
        to: email, // Recipient's email address
        subject: 'Booking Confirmation',
        text: `Hi ${name},\n\nYour booking is confirmed. Your code is: ${code}\n\nEnjoy the movie!`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email');
        }
        console.log('Email sent: ' + info.response);
        res.json({ code });
    });
});