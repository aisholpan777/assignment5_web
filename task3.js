
const MAX_TICKETS = 5;
const MIN_NAME_LENGTH = 3;

const seatLimits = [
  { type: 'Standard', seatsLeft: 10 },
  { type: 'VIP', seatsLeft: 3 },
  { type: 'Student', seatsLeft: 5 }
];

const ticketPrices = {
  Standard: 50,
  VIP: 120,
  Student: 25
};

const soldOutDates = ['2026-12-31', '2026-11-15'];

const validPromoCodes = {
  PROMO10: 0.10,
  VIP20: 0.20
};

const form = document.getElementById('ticket-form');
const errorSummary = document.getElementById('form-error-summary');
const resultBox = document.getElementById('ticket-result');

const eventSelect = document.getElementById('event-select');
const dateInput = document.getElementById('date-input');
const typeSelect = document.getElementById('type-select');
const qtyInput = document.getElementById('qty-input');
const nameInput = document.getElementById('name-input');
const emailInput = document.getElementById('email-input');
const promoInput = document.getElementById('promo-input');

const prevEvent = document.getElementById('prev-event');
const prevDate = document.getElementById('prev-date');
const prevType = document.getElementById('prev-type');
const prevQty = document.getElementById('prev-qty');
const prevSeats = document.getElementById('prev-seats');
const prevName = document.getElementById('prev-name');
const prevEmail = document.getElementById('prev-email');
const prevPrice = document.getElementById('prev-price');

form.noValidate = true;

function getSeatInfo() {
  return seatLimits.find(ticket => ticket.type === typeSelect.value);
}

function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function validateEvent() {
  if (!eventSelect.value) return 'Please select an event.';
  return '';
}

function validateDate() {
  if (!dateInput.value) return 'Please select a date.';

  if (dateInput.value < getTodayString()) {
    return 'You cannot book a date in the past.';
  }

  if (soldOutDates.includes(dateInput.value)) {
    return 'This date is sold out!';
  }

  return '';
}

function validateType() {
  if (!typeSelect.value) return 'Please select a ticket type.';

  if (!getSeatInfo()) {
    return 'Invalid ticket type.';
  }

  return '';
}

function validateQuantity() {
  if (qtyInput.value.trim() === '') {
    return 'Quantity is required.';
  }

  const quantity = Number(qtyInput.value);

  if (!Number.isInteger(quantity)) {
    return 'Quantity must be a whole number.';
  }

  if (quantity < 1) {
    return 'Minimum quantity is 1.';
  }

  if (quantity > MAX_TICKETS) {
    return `Maximum quantity is ${MAX_TICKETS}.`;
  }

  const seatInfo = getSeatInfo();

  if (seatInfo && quantity > seatInfo.seatsLeft) {
    return `Only ${seatInfo.seatsLeft} seats available for ${seatInfo.type}.`;
  }

  return '';
}

function validateName() {
  const name = nameInput.value.trim();

  if (!name) return 'Full name is required.';

  if (name.length < MIN_NAME_LENGTH) {
    return `Name must have at least ${MIN_NAME_LENGTH} characters.`;
  }

  return '';
}

function validateEmail() {
  const email = emailInput.value.trim();

  if (!email) return 'Email is required.';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email) || !emailInput.checkValidity()) {
    return 'Please enter a valid email address.';
  }

  return '';
}

function validatePromo() {
  const promo = promoInput.value.trim().toUpperCase();

  if (promo && !Object.hasOwn(validPromoCodes, promo)) {
    return 'Invalid or expired promo code.';
  }

  return '';
}

const fields = [
  { element: eventSelect, errorEl: document.getElementById('err-event'), validate: validateEvent, touched: false },
  { element: dateInput, errorEl: document.getElementById('err-date'), validate: validateDate, touched: false },
  { element: typeSelect, errorEl: document.getElementById('err-type'), validate: validateType, touched: false },
  { element: qtyInput, errorEl: document.getElementById('err-quantity'), validate: validateQuantity, touched: false },
  { element: nameInput, errorEl: document.getElementById('err-name'), validate: validateName, touched: false },
  { element: emailInput, errorEl: document.getElementById('err-email'), validate: validateEmail, touched: false },
  { element: promoInput, errorEl: document.getElementById('err-promo'), validate: validatePromo, touched: false }
];

function checkField(field) {
  const error = field.validate();

  field.errorEl.textContent = error;
  field.element.setAttribute('aria-invalid', error ? 'true' : 'false');
  field.element.classList.toggle('invalid', Boolean(error));

  return !error;
}

function updatePreview() {
  prevEvent.textContent = eventSelect.value || 'Not selected';
  prevDate.textContent = dateInput.value || 'Not selected';
  prevType.textContent = typeSelect.value || 'Not selected';
  prevQty.textContent = qtyInput.value || '0';
  prevName.textContent = nameInput.value.trim() || 'Not specified';
  prevEmail.textContent = emailInput.value.trim() || 'Not specified';

  const seatInfo = getSeatInfo();
  prevSeats.textContent = seatInfo ? seatInfo.seatsLeft : '--';

  const quantity = Number(qtyInput.value);
  const promo = promoInput.value.trim().toUpperCase();

  let price = 0;

  if (
    Object.hasOwn(ticketPrices, typeSelect.value) &&
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= MAX_TICKETS
  ) {
    price = ticketPrices[typeSelect.value] * quantity;

    if (Object.hasOwn(validPromoCodes, promo)) {
      price *= 1 - validPromoCodes[promo];
    }
  }

  prevPrice.textContent = `$${price.toFixed(2)}`;
}

function updateRelatedValidation() {
  const quantityField = fields.find(field => field.element === qtyInput);

  if (quantityField.touched) {
    checkField(quantityField);
  }
}

fields.forEach(field => {
  field.element.addEventListener('blur', () => {
    field.touched = true;
    checkField(field);
  });

  field.element.addEventListener('input', () => {
    if (field.touched) {
      checkField(field);
    }

    updatePreview();

    if (field.element === typeSelect) {
      updateRelatedValidation();
    }
  });

  field.element.addEventListener('change', () => {
    if (field.touched) {
      checkField(field);
    }

    updatePreview();

    if (field.element === typeSelect) {
      updateRelatedValidation();
    }
  });
});

form.addEventListener('submit', event => {
  event.preventDefault();

  let invalidCount = 0;
  let firstInvalid = null;

  for (const field of fields) {
    field.touched = true;

    if (!checkField(field)) {
      invalidCount++;

      if (!firstInvalid) {
        firstInvalid = field.element;
      }
    }
  }

  if (invalidCount > 0) {
    errorSummary.textContent =
      `Form contains ${invalidCount} error(s). Please correct the highlighted fields.`;

    errorSummary.classList.remove('hidden');
    resultBox.classList.add('hidden');

    firstInvalid.focus();
    return;
  }

  errorSummary.classList.add('hidden');

  const bookingCode =
    'BK-' + Math.floor(100000 + Math.random() * 900000);

  const bookedEvent = eventSelect.value;
  const bookedDate = dateInput.value;
  const bookedType = typeSelect.value;
  const bookedQuantity = Number(qtyInput.value);
  const bookedName = nameInput.value.trim();
  const bookedPrice = prevPrice.textContent;

  const seatInfo = getSeatInfo();
  seatInfo.seatsLeft -= bookedQuantity;

  resultBox.replaceChildren();

  const heading = document.createElement('h3');
  heading.textContent = 'Ticket Successfully Booked!';

  const code = document.createElement('p');
  code.textContent = `Booking Code: ${bookingCode}`;

  const details = document.createElement('p');
  details.textContent =
    `Event: ${bookedEvent} | Date: ${bookedDate}`;

  const ticketDetails = document.createElement('p');
  ticketDetails.textContent =
    `Type: ${bookedType} | Tickets: ${bookedQuantity}`;

  const guest = document.createElement('p');
  guest.textContent = `Guest: ${bookedName}`;

  const total = document.createElement('p');
  total.textContent = `Total Paid: ${bookedPrice}`;

  resultBox.append(
    heading,
    code,
    details,
    ticketDetails,
    guest,
    total
  );

  resultBox.classList.remove('hidden');

  form.reset();

  fields.forEach(field => {
    field.touched = false;
    field.errorEl.textContent = '';
    field.element.removeAttribute('aria-invalid');
    field.element.classList.remove('invalid');
  });

  updatePreview();
});

updatePreview();
