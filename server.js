const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// URL to the ticket image
const ticketImageURL = 'https://photos.app.goo.gl/oFTaQjbx3knFcHtd7';
let bookedEmails = new Set();
let availableSeats = 6; // Default value

// Load available seats from file
const seatsFilePath = path.join(__dirname, 'availableSeats.json');
if (fs.existsSync(seatsFilePath)) {
    try {
        const data = fs.readFileSync(seatsFilePath, 'utf8');
        availableSeats = JSON.parse(data).availableSeats;
        console.log(`Loaded available seats from file: ${availableSeats}`);
    } catch (error) {
        console.error('Error reading available seats from file:', error);
    }
}

// Save available seats to file
const saveSeatsToFile = () => {
    try {
        fs.writeFileSync(seatsFilePath, JSON.stringify({ availableSeats }), 'utf8');
        console.log(`Saved available seats to file: ${availableSeats}`);
    } catch (error) {
        console.error('Error writing available seats to file:', error);
    }
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

// Endpoint to reset available seats
app.post('/reset-seats', (req, res) => {
    availableSeats = 6; // Reset to 6 seats
    saveSeatsToFile(); // Save the updated number of seats to file
    res.json({ message: 'Seats have been reset.', availableSeats });
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

    bookedEmails.add(email);
    availableSeats--; // Decrease available seats
    saveSeatsToFile(); // Save the updated number of seats to file

    const mailOptions = {
        from: 'ibkamnoukam@gmail.com', // Your Gmail address
        to: email, // Recipient's email address
        subject: 'Booking Confirmation',
        html: `<p>Hi ${name},</p><p>Your booking is confirmed. Here is your ticket:</p><a href="${ticketImageURL}">View Ticket</a><p>Enjoy the movie!</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ error: 'Error sending email' });
        }
        console.log('Email sent: ' + info.response);
        res.json({ message: 'Booking confirmed! Check your email for the ticket.', availableSeats });
    });
});
