CREATE TABLE operators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 120),
  city text NOT NULL CHECK (city IN ('Lagos', 'Abuja')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_id uuid NOT NULL REFERENCES operators(id) ON DELETE RESTRICT,
  slug text NOT NULL CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 120),
  brand text NOT NULL CHECK (length(trim(brand)) BETWEEN 2 AND 80),
  category text NOT NULL CHECK (length(trim(category)) BETWEEN 2 AND 60),
  seats smallint NOT NULL CHECK (seats BETWEEN 1 AND 30),
  transmission text NOT NULL CHECK (transmission IN ('Automatic', 'Manual')),
  daily_rate_kobo bigint NOT NULL CHECK (daily_rate_kobo > 0),
  photo_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (operator_id, slug),
  UNIQUE (operator_id, id)
);

CREATE INDEX vehicles_public_lookup ON vehicles (operator_id, status, name);
