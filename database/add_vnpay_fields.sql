-- Add new columns for payment and fees to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS shipping_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS commission_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS vnp_txn_ref text;

-- Add a constraint to payment_status
ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunding', 'refunded'));
