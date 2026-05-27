import crypto from 'crypto';
import qs from 'qs';

const vnp_HashSecret = process.env.VNP_HASHSECRET || 'VNPAY_SECRET_KEY_DEMO_REPLACE_ME';

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
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    const signData = qs.stringify(vnp_Params, { encode: false });
    
    const hmac = crypto.createHmac("sha512", vnp_HashSecret);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");     

    if (secureHash === signed) {
        // Redirect to frontend result page
        const orderId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const amount = vnp_Params['vnp_Amount'];
        
        // This URL should point to your Vite app's route for payment result
        // For development it's localhost:5173, for production it should be your actual domain
        res.redirect(`/payment-result?vnp_ResponseCode=${responseCode}&order_id=${orderId}&vnp_Amount=${amount}`);
    } else {
        res.redirect(`/payment-result?error=checksum_failed`);
    }
}
