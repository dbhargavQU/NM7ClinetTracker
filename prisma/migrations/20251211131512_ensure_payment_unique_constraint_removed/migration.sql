-- DropIndex
-- Drop the unique constraint on payments table to allow multiple payments per billing cycle
DROP INDEX IF EXISTS "payments_client_id_month_year_key";