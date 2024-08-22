document.getElementById('contactForm').addEventListener('submit', async function(event) {
	event.preventDefault();
  
	const formData = new FormData(this);
	const statusElement = document.getElementById('status');
	const email = document.getElementById('email').value;
	const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        statusElement.textContent = 'Please enter a valid email address.';
        statusElement.style.color = 'red';
        return;
    }
  
	try {
	  const response = await fetch('https://formspree.io/f/xzzpjokk', {
		method: 'POST',
		headers: {
		  'Accept': 'application/json'
		},
		body: formData
	  });
  
	  if (response.ok) {
		statusElement.textContent = 'Email sent successfully!';
		statusElement.style.color = 'green';
	  } else {
		statusElement.textContent = 'Failed to send Email. Please try again later.';
		statusElement.style.color = 'red';
	  }
	} catch (error) {
	  statusElement.textContent = 'An error occurred. Please try again later.';
	  statusElement.style.color = 'red';
	}
	this.reset();
  });
  