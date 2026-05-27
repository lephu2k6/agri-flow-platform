import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Home, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
  const orderId = searchParams.get('order_id');
  const error = searchParams.get('error');

  useEffect(() => {
    const updateOrderStatus = async () => {
      if (error === 'checksum_failed') {
        setStatus('failed');
        return;
      }

      if (vnp_ResponseCode === '00') {
        // Success
        setStatus('success');
        // Update order status in Supabase if not relying strictly on IPN
        if (orderId) {
          await supabase
            .from('orders')
            .update({ payment_status: 'paid' })
            .eq('id', orderId);
        }
      } else if (vnp_ResponseCode) {
        // Failed
        setStatus('failed');
        if (orderId) {
          await supabase
            .from('orders')
            .update({ payment_status: 'failed' })
            .eq('id', orderId);
        }
      } else {
        // No parameters
        navigate('/');
      }
    };

    updateOrderStatus();
  }, [vnp_ResponseCode, orderId, error, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-[2rem] shadow-xl overflow-hidden p-8 text-center border border-gray-100">
        
        {status === 'success' ? (
          <>
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} className="text-emerald-500" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Thanh toán thành công!</h1>
            <p className="text-gray-500 mb-8 font-medium">Cảm ơn bạn đã mua hàng tại AGRI-FLOW. Đơn hàng của bạn đã được ghi nhận.</p>
          </>
        ) : (
          <>
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={48} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">Thanh toán thất bại</h1>
            <p className="text-gray-500 mb-8 font-medium">Giao dịch không thành công hoặc đã bị hủy. Vui lòng thử lại.</p>
          </>
        )}

        <div className="space-y-3">
          <Link 
            to="/buyer/orders"
            className="w-full flex items-center justify-center gap-2 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-[0_10px_20px_-5px_rgba(16,185,129,0.4)]"
          >
            <ShoppingBag size={20} />
            Xem đơn hàng của tôi
          </Link>
          <Link 
            to="/"
            className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold transition-all"
          >
            <Home size={20} />
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
