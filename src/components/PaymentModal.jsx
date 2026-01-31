/**
 * PaymentModal Component
 * Handles Razorpay payment checkout flow
 */

import { useState, useEffect, useCallback } from 'react';
import {
  loadRazorpayScript,
  processPayment,
  formatAmount,
} from '../utils/razorpayService';
import {
  CloseIcon,
  CreditCardIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LockIcon,
  LoaderIcon,
  ShoppingBagIcon,
} from './icons/IconTypes';

export function PaymentModal({
  order,
  token,
  onSuccess,
  onClose,
  onError,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  // Load Razorpay script on mount
  useEffect(() => {
    loadRazorpayScript().catch((err) => {
      console.error('Failed to load Razorpay:', err);
      setError('Failed to load payment gateway. Please refresh and try again.');
    });
  }, []);

  // Calculate totals
  const subtotal = order?.totalPrice || 0;
  const gstRate = 0.18;
  const gstAmount = subtotal * gstRate;
  const grandTotal = subtotal + gstAmount;

  const handlePayment = useCallback(async () => {
    if (!order?._id || !token) {
      setError('Invalid order or authentication');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await processPayment(order._id, token, {
        merchantName: 'RKserve',
        themeColor: '#3b82f6',
      });

      setPaymentComplete(true);
      setPaymentResult(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const errorMessage = err.message || 'Payment failed. Please try again.';
      setError(errorMessage);
      
      if (onError) {
        onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [order, token, onSuccess, onError]);

  const handleClose = useCallback(() => {
    if (paymentComplete && onSuccess) {
      onSuccess(paymentResult);
    }
    onClose();
  }, [paymentComplete, paymentResult, onSuccess, onClose]);

  if (!order) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="glass-panel rounded-t-3xl sm:rounded-2xl border border-white/10 p-6 sm:max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease-out]">
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-500)] flex items-center justify-center shadow-lg">
              <CreditCardIcon size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {paymentComplete ? 'Payment Successful' : 'Complete Payment'}
              </h2>
              <p className="text-gray-400 text-xs">
                {paymentComplete ? 'Thank you for your order' : 'Secure checkout with Razorpay'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all active:scale-95"
            aria-label="Close"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-xl text-sm mb-6 flex items-center gap-3">
            <AlertCircleIcon size={20} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {paymentComplete ? (
          /* Payment success view */
          <div className="space-y-6 mb-6">
            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircleIcon size={40} className="text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
              <p className="text-gray-400 text-sm">
                Your payment of {formatAmount(grandTotal)} has been processed successfully.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Transaction ID</span>
                <span className="text-white font-mono text-xs">
                  {paymentResult?.paymentId || '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Order Status</span>
                <span className="text-emerald-400 font-semibold">Confirmed</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-4 rounded-xl bg-[var(--color-accent-500)] hover:bg-[var(--color-accent-600)] text-white font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <CheckCircleIcon size={20} />
              Done
            </button>
          </div>
        ) : (
          /* Payment form view */
          <div className="space-y-6 mb-6">
            {/* Order summary */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-start gap-3 mb-4">
                <ShoppingBagIcon size={20} className="text-primary-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {order.service?.title || order.service?.name || 'Service Order'}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {order.type === 'rent' 
                      ? `${order.durationDays} day${order.durationDays > 1 ? 's' : ''} rental`
                      : `Qty: ${order.quantity}`
                    }
                  </p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-white">{formatAmount(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">GST (18%)</span>
                  <span className="text-white">{formatAmount(gstAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="text-emerald-400">{formatAmount(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Payment methods info */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-gray-400 text-xs uppercase font-semibold tracking-wide mb-3">
                Accepted Payment Methods
              </p>
              <div className="flex flex-wrap gap-2">
                {['UPI', 'Cards', 'NetBanking', 'Wallets'].map((method) => (
                  <span
                    key={method}
                    className="px-3 py-1.5 bg-white/10 rounded-lg text-white text-xs font-medium"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* Pay button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] disabled:opacity-60 text-white font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <LoaderIcon size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <LockIcon size={20} />
                  <span>Pay {formatAmount(grandTotal)}</span>
                </>
              )}
            </button>

            {/* Security note */}
            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <LockIcon size={18} className="text-gray-400 shrink-0" />
              <p className="text-xs text-gray-400">
                Payments are processed securely by Razorpay. Your card details are never stored on our servers.
              </p>
            </div>
          </div>
        )}

        {/* Cancel button (only when not complete) */}
        {!paymentComplete && (
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/5 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default PaymentModal;
