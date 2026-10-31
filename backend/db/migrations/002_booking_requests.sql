ALTER TABLE operators
  ADD COLUMN whatsapp_number text CHECK (whatsapp_number IS NULL OR whatsapp_number ~ '^[1-9][0-9]{6,14}$');

CREATE TABLE operator_staff (
  operator_id uuid NOT NULL REFERENCES operators(id) ON DELETE CASCADE,
  email text NOT NULL CHECK (email = lower(email) AND length(email) <= 254),
  role text NOT NULL DEFAULT 'manager' CHECK (role IN ('manager')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (operator_id, email)
);

CREATE TABLE booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  operator_id uuid NOT NULL REFERENCES operators(id) ON DELETE RESTRICT,
  vehicle_id uuid NOT NULL,
  customer_email text NOT NULL CHECK (customer_email = lower(customer_email) AND length(customer_email) <= 254),
  customer_name text NOT NULL CHECK (length(trim(customer_name)) BETWEEN 2 AND 120),
  idempotency_key uuid NOT NULL,
  pickup_date date NOT NULL,
  return_date date NOT NULL,
  pickup_location text NOT NULL CHECK (length(pickup_location) BETWEEN 2 AND 80),
  requested_extras text[] NOT NULL DEFAULT '{}',
  base_total_kobo bigint NOT NULL CHECK (base_total_kobo > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
  channel text NOT NULL CHECK (channel IN ('rinjo', 'whatsapp')),
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by text,
  CHECK (return_date > pickup_date AND return_date <= pickup_date + 28),
  FOREIGN KEY (operator_id, vehicle_id) REFERENCES vehicles(operator_id, id)
);

CREATE UNIQUE INDEX booking_requests_idempotency ON booking_requests (operator_id, customer_email, idempotency_key);

CREATE INDEX booking_requests_customer ON booking_requests (customer_email, created_at DESC);
CREATE INDEX booking_requests_operator ON booking_requests (operator_id, status, created_at DESC);
CREATE INDEX booking_requests_vehicle_dates ON booking_requests (vehicle_id, pickup_date, return_date) WHERE status = 'approved';
