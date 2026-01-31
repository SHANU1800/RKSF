/**
 * useRazorpay Hook
 * React hook for Razorpay payment integration
 */

import { useState, useCallback, useEffect } from 'react';
import {
  loadRazorpayScript,
  processPayment,
  isRazorpayAvailable,
  getPaymentStatus,
  requestRefund,
} from '../utils/razorpayService';

/**
 * Hook for Razorpay payment integration
 * @returns {Object} Razorpay methods and state
 */
export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);
  const [sdkReady, setSdkReady] = useState(false);

  // Load Razorpay SDK on mount
  useEffect(() => {
    loadRazorpayScript()
      .then(() => setSdkReady(true))
      .catch((err) => {
        console.error('Failed to load Razorpay SDK:', err);
        setError('Payment gateway unavailable');
      });
  }, []);

  /**
   * Initiate payment for an order
   * @param {string} orderId - The order ID
   * @param {string} token - Auth token
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Payment result
   */
  const pay = useCallback(async (orderId, token, options = {}) => {
    if (!sdkReady) {
      try {
        await loadRazorpayScript();
        setSdkReady(true);
      } catch (_error) { // eslint-disable-line no-unused-vars
        throw new Error('Payment gateway unavailable. Please try again.');
      }
    }

    setLoading(true);
    setError(null);
    setPaymentResult(null);

    try {
      const result = await processPayment(orderId, token, options);
      setPaymentResult(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Payment failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [sdkReady]);

  /**
   * Check payment status for an order
   * @param {string} orderId - The order ID
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Payment status
   */
  const checkStatus = useCallback(async (orderId, token) => {
    setLoading(true);
    setError(null);

    try {
      const status = await getPaymentStatus(orderId, token);
      return status;
    } catch (err) {
      const errorMessage = err.message || 'Failed to check payment status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Request refund for an order
   * @param {string} orderId - The order ID
   * @param {string} reason - Refund reason
   * @param {string} token - Auth token
   * @returns {Promise<Object>} Refund result
   */
  const refund = useCallback(async (orderId, reason, token) => {
    setLoading(true);
    setError(null);

    try {
      const result = await requestRefund(orderId, reason, token);
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Refund request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset payment state
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setPaymentResult(null);
  }, []);

  return {
    // State
    loading,
    error,
    paymentResult,
    sdkReady,
    isAvailable: isRazorpayAvailable(),
    
    // Methods
    pay,
    checkStatus,
    refund,
    reset,
  };
}

export default useRazorpay;
