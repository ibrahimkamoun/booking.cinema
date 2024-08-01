document.addEventListener('DOMContentLoaded', function() {
    fetch('/seats')
        .then(response => response.json())
        .then(data => {
            seatsLeft = data.availableSeats;
            document.getElementById('seatsLeft').textContent = `${seatsLeft} seats left`;
        })
        .catch(error => {
            console.error('Error fetching seats:', error);
        });
});

document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = event.target.name.value;
    const email = event.target.email.value;
    const age = event.target.age.value;

    fetch('/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, age })
    }).then(response => response.json())
      .then(data => {
          if (data.error) {
              alert(data.error);
          } else {
              seatsLeft = data.availableSeats; // Update seatsLeft from server response
              document.getElementById('seatsLeft').textContent = `${seatsLeft} seats left`;
              alert('Booking confirmed! Check your email for the booking code.');
          }
      }).catch(error => {
          console.error('Error:', error);
          alert('An error occurred while booking. Please try again.');
      });
});
