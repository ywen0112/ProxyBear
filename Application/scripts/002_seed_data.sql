-- Insert sample products
INSERT INTO products (name, description, price, features) VALUES
('Residential Proxies', 'High-quality residential IP addresses from real devices worldwide', 49.00, '["99.9% uptime", "50M+ IPs", "Global coverage", "Rotating IPs", "24/7 support"]'),
('Datacenter Proxies', 'Lightning-fast datacenter proxies optimized for high-volume operations', 29.00, '["Ultra-fast speeds", "Dedicated pools", "All protocols", "Unlimited bandwidth", "API support"]'),
('Mobile Proxies', 'Premium mobile carrier IPs that rotate automatically', 99.00, '["Real mobile IPs", "4G/5G support", "Auto rotation", "Mobile speeds", "Carrier reliability"]'),
('ISP Proxies', 'Static residential IPs hosted in datacenters', 79.00, '["Static residential IPs", "Datacenter speeds", "High success rates", "Long sessions", "Enterprise security"]'),
('Proxy Management Suite', 'Comprehensive dashboard and API tools', 19.00, '["Unified dashboard", "Real-time analytics", "Custom rules", "Team management", "Advanced API"]')
ON CONFLICT DO NOTHING;

-- Insert sample user
INSERT INTO users (email, name) VALUES
('demo@proxybear.com', 'Demo User')
ON CONFLICT (email) DO NOTHING;

-- Insert sample subscriptions
INSERT INTO subscriptions (user_id, product_id, plan, status, price, usage_limit, current_usage, renewal_date) VALUES
(1, 1, 'Professional', 'active', 49.00, 100, 75, '2024-02-15'),
(1, 2, 'Enterprise', 'active', 29.00, 200, 45, '2024-02-20'),
(1, 3, 'Premium', 'paused', 99.00, 50, 0, '2024-02-10')
ON CONFLICT DO NOTHING;

-- Insert sample billing history
INSERT INTO billing_history (user_id, subscription_id, amount, status, invoice_number, billing_date) VALUES
(1, 1, 177.00, 'paid', 'INV-001', '2024-01-15'),
(1, 1, 177.00, 'paid', 'INV-002', '2023-12-15'),
(1, 1, 148.00, 'paid', 'INV-003', '2023-11-15')
ON CONFLICT (invoice_number) DO NOTHING;
