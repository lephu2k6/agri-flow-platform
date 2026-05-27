import crypto from 'crypto';
import qs from 'qs';

// Using VNPAY Sandbox credentials for demo purposes
// In production, these should be in environment variables
const vnp_TmnCode = 'VNPAY_DEMO'; // Placeholder, user will need to change
const vnp_HashSecret = 'VNPAY_SECRET_KEY_DEMO_REPLACE_ME'; 
const vnp_Url = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const vnp_ReturnUrl = 'http://localhost:5173/payment-result'; // Adjust for production later

function sortObject(obj) {
    let sorted = {};
    let str = [];
    let key;
    for (key in obj){
        if (obj.hasOwnProperty(key)) {
            str.push(encodeURIComponent(key));
        }
    }
    str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { orderId, amount, orderInfo, bankCode } = req.body;

        if (!orderId || !amount) {
            return res.status(400).json({ message: 'Missing orderId or amount' });
        }

        const date = new Date();
        const createDate = date.getFullYear().toString() + 
            (date.getMonth() + 1).toString().padStart(2, '0') + 
            date.getDate().toString().padStart(2, '0') + 
            date.getHours().toString().padStart(2, '0') + 
            date.getMinutes().toString().padStart(2, '0') + 
            date.getSeconds().toString().padStart(2, '0');

        const expireDate = new Date(date.getTime() + 15 * 60000); // expire in 15 mins
        const vnp_ExpireDate = expireDate.getFullYear().toString() + 
            (expireDate.getMonth() + 1).toString().padStart(2, '0') + 
            expireDate.getDate().toString().padStart(2, '0') + 
            expireDate.getHours().toString().padStart(2, '0') + 
            expireDate.getMinutes().toString().padStart(2, '0') + 
            expireDate.getSeconds().toString().padStart(2, '0');

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = process.env.VNP_TMNCODE || vnp_TmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = orderId;
        vnp_Params['vnp_OrderInfo'] = orderInfo || `Thanh toan don hang ${orderId}`;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = amount * 100;
        vnp_Params['vnp_ReturnUrl'] = process.env.VNP_RETURN_URL || vnp_ReturnUrl;
        vnp_Params['vnp_IpAddr'] = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
        vnp_Params['vnp_CreateDate'] = createDate;
        vnp_Params['vnp_ExpireDate'] = vnp_ExpireDate;

        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        vnp_Params = sortObject(vnp_Params);
        const signData = qs.stringify(vnp_Params, { encode: false });
        const secretKey = process.env.VNP_HASHSECRET || vnp_HashSecret;
        
        const hmac = crypto.createHmac("sha512", secretKey);
        const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
        vnp_Params['vnp_SecureHash'] = signed;
        
        let paymentUrl = vnp_Url + '?' + qs.stringify(vnp_Params, { encode: false });

        res.status(200).json({ url: paymentUrl });
    } catch (error) {
        console.error('Error generating VNPAY URL:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
