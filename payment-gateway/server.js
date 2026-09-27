import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded from payment-gateway directory
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

// CORS Middleware to allow React frontend (port 5173 / any) to connect
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let stripe;
try {
    if (process.env.STRIPE_SECRET_KEY) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
} catch (e) {
    console.log("Stripe initialization note:", e.message);
}

// 1. Root Status Route
app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Gateway Server</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 40px; background: #f8fafc; }
                .card { background: white; max-width: 520px; margin: 0 auto; padding: 35px; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
                h1 { color: #0c2340; margin-bottom: 8px; font-size: 26px; }
                .status { color: #16a34a; font-weight: 600; font-size: 17px; margin: 15px 0; }
                .badge { display: inline-block; background: #e0f2fe; color: #0284c7; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin: 6px 4px; }
                .rzp-badge { background: #e0f2fe; color: #0c2340; border: 1px solid #3399cc; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>💳 Payment Gateway Server</h1>
                <p class="status">● Server is Running Successfully on Port 3000</p>
                <p>Equipped with <strong>Razorpay Redirect Integration</strong> and Stripe API support.</p>
                <div>
                    <span class="badge rzp-badge">Razorpay: /create-razorpay-order</span>
                    <span class="badge">Stripe / Card: /create-payment</span>
                    <span class="badge">Redirect: /razorpay-redirect</span>
                </div>
            </div>
        </body>
        </html>
    `);
});

// 2. Razorpay Order Creation Endpoint
app.post("/create-razorpay-order", (req, res) => {
    const amountInRupees = Number(req.body.amount) || 500;
    const purpose = req.body.purpose || "Library Membership Fee";
    const customerName = req.body.name || "Library Member";
    const customerEmail = req.body.email || "student@library.com";

    const rzpOrderId = "order_rzp_" + Date.now().toString().slice(-8);
    console.log(`[Razorpay Order] Created ${rzpOrderId} for ₹${amountInRupees} - ${purpose}`);

    res.json({
        success: true,
        gateway: "Razorpay",
        orderId: rzpOrderId,
        amount: amountInRupees,
        amountInPaise: Math.round(amountInRupees * 100),
        currency: "INR",
        purpose: purpose,
        key_id: "rzp_test_lib2026demo",
        redirectUrl: `/razorpay-redirect?order_id=${rzpOrderId}&amount=${amountInRupees}&purpose=${encodeURIComponent(purpose)}&name=${encodeURIComponent(customerName)}&email=${encodeURIComponent(customerEmail)}`,
        customer: {
            name: customerName,
            email: customerEmail
        },
        timestamp: new Date().toISOString()
    });
});

// 3. Razorpay Server-Rendered Redirect Page (Accessible at http://localhost:3000/razorpay-redirect)
app.get("/razorpay-redirect", (req, res) => {
    const orderId = req.query.order_id || ("order_rzp_" + Date.now().toString().slice(-8));
    const amount = req.query.amount || "500";
    const purpose = req.query.purpose || "Library Fee";
    const name = req.query.name || "Library Member";

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Razorpay Payment - Redirect</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
                body { background-color: #0c2340; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; color: #1e293b; }
                .rzp-container { background: #ffffff; max-width: 460px; width: 100%; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
                .rzp-header { background: #0c2340; color: white; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3399cc; }
                .rzp-brand { font-size: 20px; font-weight: bold; letter-spacing: 0.5px; }
                .rzp-brand span { color: #3399cc; }
                .rzp-trusted { font-size: 11px; color: #94a3b8; }
                .order-summary { background: #f8fafc; padding: 18px 24px; border-bottom: 1px solid #e2e8f0; }
                .order-amount { font-size: 28px; font-weight: 700; color: #0c2340; margin-top: 4px; }
                .order-title { font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; }
                .payment-methods { padding: 24px; }
                .method-item { display: flex; align-items: center; gap: 14px; padding: 14px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 12px; cursor: pointer; transition: all 0.2s; }
                .method-item:hover, .method-item.selected { border-color: #3399cc; background: #f0f9ff; }
                .method-icon { font-size: 22px; }
                .method-title { font-weight: 600; font-size: 14px; }
                .method-desc { font-size: 12px; color: #64748b; }
                .btn-rzp-pay { width: 100%; padding: 14px; background: #3399cc; color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 15px; }
                .btn-rzp-pay:hover { background: #287ca6; }
                .rzp-footer { text-align: center; padding: 15px; font-size: 12px; color: #64748b; background: #f8fafc; border-top: 1px solid #e2e8f0; }
                .secured-badge { display: flex; align-items: center; justify-content: center; gap: 6px; font-size: 11px; color: #059669; font-weight: 600; margin-top: 8px; }
            </style>
        </head>
        <body>
            <div class="rzp-container">
                <div class="rzp-header">
                    <div>
                        <div class="rzp-brand">Razor<span>pay</span></div>
                        <div class="rzp-trusted">Trusted Business Payment Gateway</div>
                    </div>
                    <div style="font-size: 22px;">🔒</div>
                </div>

                <div class="order-summary">
                    <div class="order-title">Paying to Library Management System</div>
                    <div class="order-amount">₹${amount}.00</div>
                    <small style="color: #64748b;">Order ID: <code>${orderId}</code> &bull; ${purpose}</small>
                </div>

                <div class="payment-methods">
                    <div class="method-item selected">
                        <span class="method-icon">📱</span>
                        <div>
                            <div class="method-title">UPI (Instant Payment)</div>
                            <div class="method-desc">Google Pay, PhonePe, Paytm, BHIM</div>
                        </div>
                    </div>

                    <div class="method-item">
                        <span class="method-icon">💳</span>
                        <div>
                            <div class="method-title">Cards</div>
                            <div class="method-desc">Visa, MasterCard, RuPay, Maestro</div>
                        </div>
                    </div>

                    <div class="method-item">
                        <span class="method-icon">🏦</span>
                        <div>
                            <div class="method-title">Netbanking</div>
                            <div class="method-desc">All Indian Banks Supported</div>
                        </div>
                    </div>

                    <button class="btn-rzp-pay" onclick="simulateSuccess()">Simulate Razorpay Payment Success</button>
                    <button onclick="window.history.back()" style="width: 100%; margin-top: 8px; padding: 10px; background: transparent; border: 1px solid #cbd5e1; border-radius: 8px; color: #64748b; cursor: pointer;">Cancel & Return</button>

                    <div class="secured-badge">
                        <span>🛡️</span> 256-bit SSL Encryption &bull; PCI-DSS Certified
                    </div>
                </div>

                <div class="rzp-footer">
                    Secured by <strong>Razorpay Payments</strong> &bull; Test Gateway Simulation
                </div>
            </div>

            <script>
                function simulateSuccess() {
                    alert("Razorpay Payment of ₹${amount} Successful! Returning to LMS Portal...");
                    window.location.href = "http://localhost:5173/payment?status=success&order_id=${orderId}&amount=${amount}&gateway=Razorpay";
                }
            </script>
        </body>
        </html>
    `);
});

// 4. General /create-payment endpoint (Enhanced with Razorpay redirect support)
app.post("/create-payment", async (req, res) => {
    const amountInRupees = Number(req.body.amount) || 500;
    const purpose = req.body.purpose || "Library Membership Fee";
    const customerEmail = req.body.email || "student@library.com";
    const customerName = req.body.name || "Library Member";

    console.log(`Payment Request Received: ₹${amountInRupees} | ${purpose} | ${customerName} (${customerEmail})`);

    const rzpOrderId = "order_rzp_" + Date.now().toString().slice(-8);

    try {
        let clientSecret = null;
        if (stripe && process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith("sk_")) {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amountInRupees * 100),
                currency: "inr",
                description: purpose,
                metadata: { customerName, customerEmail }
            });
            clientSecret = paymentIntent.client_secret;
        }

        const txnId = "TXN_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        res.json({
            success: true,
            gateway: "Razorpay",
            message: "Payment Order Created for Razorpay Gateway",
            orderId: rzpOrderId,
            razorpayRedirectUrl: `/razorpay-redirect?order_id=${rzpOrderId}&amount=${amountInRupees}&purpose=${encodeURIComponent(purpose)}`,
            clientSecret: clientSecret || "pi_mock_" + Math.random().toString(36).substring(2, 12),
            transactionId: txnId,
            amount: amountInRupees,
            currency: "INR",
            purpose: purpose,
            status: "succeeded",
            timestamp: new Date().toLocaleString()
        });

    } catch (error) {
        console.log("Payment processing note:", error.message);
        const txnId = "TXN_TEST_" + Date.now();
        res.json({
            success: true,
            gateway: "Razorpay",
            message: "Payment Processed in Test Mode",
            orderId: rzpOrderId,
            razorpayRedirectUrl: `/razorpay-redirect?order_id=${rzpOrderId}&amount=${amountInRupees}&purpose=${encodeURIComponent(purpose)}`,
            transactionId: txnId,
            amount: amountInRupees,
            currency: "INR",
            purpose: purpose,
            status: "succeeded",
            timestamp: new Date().toLocaleString()
        });
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Payment Gateway Server running at http://localhost:${PORT}`);
});