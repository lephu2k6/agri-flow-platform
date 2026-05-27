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
        const orderId = vnp_Params['vnp_TxnRef'];
        const rspCode = vnp_Params['vnp_ResponseCode'];
        
        // Here you would normally update your database with the payment status
        // If rspCode === '00', payment was successful
        // Example: await updateOrderStatusInDatabase(orderId, rspCode === '00' ? 'paid' : 'failed');

        // We will just return success to VNPay
        res.status(200).json({ RspCode: '00', Message: 'success' });
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Fail checksum' });
    }
}
