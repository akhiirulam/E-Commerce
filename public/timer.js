let duration = 1 * 60 * 1000; // 1 minute in milliseconds

// Retrieve the deadline timestamp from localStorage
let storedDeadline = localStorage.getItem('deadline');
let deadline;

// Check if a stored deadline exists and is valid
if (storedDeadline && !isNaN(storedDeadline) && parseInt(storedDeadline) > new Date().getTime()) {
  deadline = parseInt(storedDeadline);
} else {
  // If no valid stored deadline, set a new one
  deadline = new Date().getTime() + duration;
  // Save the new deadline to localStorage
  localStorage.setItem('deadline', deadline);
}

let x = setInterval(function () {
  let now = new Date().getTime();
  let t = deadline - now;

  let minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((t % (1000 * 60)) / 1000);

  // Output the remaining time
  document.getElementById("demo").innerHTML = minutes + "m " + seconds + "s ";

  // Redirect when the countdown reaches zero
  if (t <= 1) {
    clearInterval(x);
    document.getElementById("resend").style.display = "block";
    document.getElementById("send").style.display = "none";
    document.getElementById("demo").style.display = "none";
    document.getElementById("sendfield").style.display = "none";
  }
}, 1000);
