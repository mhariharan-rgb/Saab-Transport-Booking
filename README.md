# Saab Transport Booking

Saab is a browser-based prototype for estimating ride fares and managing demo bookings.

## Problem statement and objectives

Give users one place to enter trip details, compare vehicle types, review an estimated fare, and manage their booking. Demonstrate the ride, driver and support workflows with validated inputs.

## Features

- Quick Booking on the home page and a full ride form with pickup, drop, date, time and vehicle.
- Auto rickshaw, bike and sedan options. The fare estimate adds the vehicle base fare, a simulated distance charge at ₹8 per km and rounded 5% GST.
- Demo sign-in and registration, plus a booking table with pending and cancelled statuses.
- Driver application, contact form and expandable FAQs.

## Technology and project structure

HTML5 provides the page structure in `index.html`. CSS in `assets/css/styles.css` defines the layout and styling. Vanilla JavaScript in `assets/js/app.js` runs navigation, validation, fares and bookings. Git tracks changes. Chromium and Playwright were used for verification.

The supplied Saab HTML is the starting point for this repository. The typography uses [Bebas Neue and DM Sans via Google Fonts](https://fonts.google.com/).

## Prerequisites, installation and running

Use a modern desktop browser. No package installation or build is required. Download and extract the source, or clone the repository, then open `index.html` in the browser. If your browser restricts local files, run `python -m http.server 8000` from the project folder and open `http://localhost:8000`. This option requires Python 3. Internet access is optional for loading the Google Fonts.

## Sample input and output

Sign in with `demo@example.com` and `demo1234`. Open **Book a Ride**, enter **Anna Nagar** and **Chennai Central**, select tomorrow at **10:00**, then select **Car (Sedan)**. For a simulated distance of 10 km, the estimate is ₹80 + ₹80 + ₹8 GST = ₹168. Confirm the ride to see **Pending** under **My Bookings**. Select **Cancel** and confirm to see **Cancelled**.

## Testing performed

| Scenario | Verified result |
| --- | --- |
| Signed-out booking access and demo login | Redirects to login, rejects malformed email, accepts a valid demo sign-in |
| Registration | Rejects mismatched passwords and accepts valid sample inputs |
| Booking validation | Rejects empty locations, identical locations, a past date and a missing vehicle |
| Fare and booking | Displays the fare, adds a Pending row and changes it to Cancelled on confirmation |
| Driver application | Rejects missing data and malformed phone numbers, accepts valid demo details |
| Contact and FAQ | Rejects a malformed email, accepts a demo message and expands the FAQ |
| Browser errors | No uncaught JavaScript errors in the tested flows |

## Known limitations and future enhancements

All activity is simulated in the current browser session. Login accepts demo credentials without account verification, sample bookings are shared in memory, and refreshing resets the demo data. Route distance is simulated. The project has no dispatch, live maps, payment processing or message delivery. Future work could add a backend, verified accounts, persistent per-user bookings and real route estimates.
