-- NOTE: TypeORM synchronize:true creates tables automatically.
-- This seed runs AFTER the app starts and creates tables.
-- We use a function with a delay-check pattern.
-- Passwords are bcrypt of: Admin123!, Coord123!, Driver123!, Customer123!

-- Wait for tables and insert seed data
DO $$
BEGIN
  -- Insert users only if they don't exist
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@transporte.com') THEN
    INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
    VALUES (
      uuid_generate_v4(),
      'admin@transporte.com',
      '$2a$10$3Btq514.GPI9Hl918AKhJOvMC3eKzryXUnkUTCi5hLXTZLLwruQxu', -- Admin123!
      'Administrador',
      'admin',
      true,
      NOW(),
      NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'coord@transporte.com') THEN
    INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
    VALUES (
      uuid_generate_v4(),
      'coord@transporte.com',
      '$2a$10$sCN8N4AByBlFDClJYk1VceZc37scOYDNGSFpIhCpTYgaQ/wZ7mIQW', -- Coord123!
      'Coordinador Principal',
      'coordinator',
      true,
      NOW(),
      NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'driver1@transporte.com') THEN
    INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
    VALUES (
      uuid_generate_v4(),
      'driver1@transporte.com',
      '$2a$10$Va6dDJVKFfP4HYnBvqsA.eUmlH6XIA8oAljRX2IkzQPzIM83Pnf5e', -- Driver123!
      'Carlos Rodríguez',
      'driver',
      true,
      NOW(),
      NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'driver2@transporte.com') THEN
    INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
    VALUES (
      uuid_generate_v4(),
      'driver2@transporte.com',
      '$2a$10$Va6dDJVKFfP4HYnBvqsA.eUmlH6XIA8oAljRX2IkzQPzIM83Pnf5e', -- Driver123!
      'María Torres',
      'driver',
      true,
      NOW(),
      NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'driver3@transporte.com') THEN
    INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
    VALUES (
      uuid_generate_v4(),
      'driver3@transporte.com',
      '$2a$10$Va6dDJVKFfP4HYnBvqsA.eUmlH6XIA8oAljRX2IkzQPzIM83Pnf5e', -- Driver123!
      'José Mendoza',
      'driver',
      true,
      NOW(),
      NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'customer@transporte.com') THEN
    INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
    VALUES (
      uuid_generate_v4(),
      'customer@transporte.com',
      '$2a$10$yByHyZUy7ll.bQv.gCWSc.Bn47GnLS9PsV/9fL0jISBse8Wdlzh2.', -- Customer123!
      'Cliente Demo',
      'customer',
      true,
      NOW(),
      NOW()
    );
  END IF;

  -- Drivers
  IF NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Carlos Rodríguez') THEN
    INSERT INTO drivers (id, name, phone, "licenseNumber", "vehicleType", "vehiclePlate", status, "userId", "createdAt", "updatedAt")
    VALUES (
      uuid_generate_v4(),
      'Carlos Rodríguez',
      '+51 987 654 321',
      'LIC-001-PE',
      'Camión 5T',
      'ABC-123',
      'available',
      (SELECT id FROM users WHERE email = 'driver1@transporte.com'),
      NOW(),
      NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'María Torres') THEN
    INSERT INTO drivers (id, name, phone, "licenseNumber", "vehicleType", "vehiclePlate", status, "userId", "createdAt", "updatedAt")
    VALUES (
      uuid_generate_v4(),
      'María Torres',
      '+51 976 543 210',
      'LIC-002-PE',
      'Furgón',
      'XYZ-456',
      'available',
      (SELECT id FROM users WHERE email = 'driver2@transporte.com'),
      NOW(),
      NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'José Mendoza') THEN
    INSERT INTO drivers (id, name, phone, "licenseNumber", "vehicleType", "vehiclePlate", status, "userId", "createdAt", "updatedAt")
    VALUES (
      uuid_generate_v4(),
      'José Mendoza',
      '+51 965 432 109',
      'LIC-003-PE',
      'Camioneta',
      'DEF-789',
      'available',
      (SELECT id FROM users WHERE email = 'driver3@transporte.com'),
      NOW(),
      NOW()
    );
  END IF;

  -- Customers
  IF NOT EXISTS (SELECT 1 FROM customers WHERE email = 'empresa1@cliente.com') THEN
    INSERT INTO customers (id, name, email, phone, address, "createdAt", "updatedAt")
    VALUES (
      uuid_generate_v4(),
      'Empresa ABC S.A.C.',
      'empresa1@cliente.com',
      '+51 044 123456',
      'Av. Industrial 123, Trujillo',
      NOW(),
      NOW()
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM customers WHERE email = 'empresa2@cliente.com') THEN
    INSERT INTO customers (id, name, email, phone, address, "createdAt", "updatedAt")
    VALUES (
      uuid_generate_v4(),
      'Distribuidora XYZ E.I.R.L.',
      'empresa2@cliente.com',
      '+51 044 654321',
      'Jr. Comercio 456, Trujillo',
      NOW(),
      NOW()
    );
  END IF;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Seed error (tables may not exist yet): %', SQLERRM;
END $$;
