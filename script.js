let seatsLeft = 6;

document.getElementById('bookingForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const name = event.target.name.value;
    const email = event.target.email.value;
    const age = event.target.age.value;
    if (seatsLeft > 0) {
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
                  seatsLeft--;
                  document.getElementById('seatsLeft').textContent = `${seatsLeft} seats left`;
                  alert(`Booking confirmed! Your code is: ${data.code}`);
              }
          }).catch(error => {
              console.error('Error:', error);
              alert('An error occurred while booking. Please try again.');
          });
    } else {
        alert('No seats left!');
    }
});
