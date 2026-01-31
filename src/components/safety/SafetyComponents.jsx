import { useState, useEffect, useRef } from 'react';
import { useSafetyAPI, useLocationTracking } from '../../hooks/useSafety';

// ============================================
// SOS BUTTON - Panic Button Component
// ============================================
export function SOSButton({ sessionId, enabled = true, size = 'normal' }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [triggered, setTriggered] = useState(false);
  const countdownRef = useRef(null);
  
  const { triggerSOS } = useSafetyAPI();
  const { location } = useLocationTracking(sessionId, enabled);

  const handlePress = () => {
    setShowConfirm(true);
    setCountdown(3);
    
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          executeSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancel = () => {
    clearInterval(countdownRef.current);
    setShowConfirm(false);
    setCountdown(3);
  };

  const executeSOS = async () => {
    setTriggering(true);
    try {
      await triggerSOS(sessionId, {
        reason: 'SOS button pressed',
        lat: location?.lat,
        lng: location?.lng,
      });
      setTriggered(true);
    } catch (error) {
      console.error('SOS trigger failed:', error);
    }
    setTriggering(false);
    setShowConfirm(false);
  };

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  if (!enabled) return null;

  const sizeClasses = {
    small: 'w-12 h-12 text-lg',
    normal: 'w-16 h-16 text-2xl',
    large: 'w-20 h-20 text-3xl',
  };

  if (triggered) {
    return (
      <div className="fixed bottom-24 right-4 z-50 animate-pulse">
        <div className="glass-panel rounded-2xl p-4 border border-red-500/50 bg-red-900/50 max-w-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center animate-ping">
              <span className="text-2xl">🚨</span>
            </div>
            <div>
              <p className="text-red-400 font-bold">SOS Activated</p>
              <p className="text-gray-300 text-sm">Help is on the way</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SOS Button */}
      <button
        onClick={handlePress}
        disabled={triggering}
        className={`fixed bottom-24 right-4 z-50 ${sizeClasses[size]} rounded-full bg-linear-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/50 flex items-center justify-center text-white font-bold hover:scale-105 active:scale-95 transition-transform border-4 border-red-400/50`}
        aria-label="SOS Emergency Button"
      >
        {triggering ? (
          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          'SOS'
        )}
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-100">
          <div className="glass-panel rounded-2xl p-6 max-w-sm mx-4 border border-red-500/50 text-center animate-[slideUp_0.2s_ease-out]">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
              <span className="text-4xl">{countdown}</span>
            </div>
            <h3 className="text-2xl font-bold text-red-400 mb-2">Triggering SOS</h3>
            <p className="text-gray-300 mb-6">
              Emergency contacts and safety team will be notified. Location will be shared.
            </p>
            <button
              onClick={handleCancel}
              className="w-full py-4 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================
// CHECK-IN CODE DISPLAY
// ============================================
export function CheckInCodeDisplay({ code, isProvider }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/10">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">🔐</span>
        <div>
          <h4 className="text-white font-bold">Check-in Code</h4>
          <p className="text-gray-400 text-xs">
            {isProvider 
              ? 'Show this code to the customer before entering'
              : 'Ask for this code before allowing entry'}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-900/70 rounded-xl px-4 py-3 text-center">
          <span className="text-3xl font-mono font-bold text-emerald-400 tracking-[0.3em]">
            {code}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all"
        >
          {copied ? '✓' : '📋'}
        </button>
      </div>

      {!isProvider && (
        <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2">
          <span className="text-amber-400">⚠️</span>
          <p className="text-amber-200 text-xs">
            Only share this code after verifying the provider's photo ID matches their profile
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// CHECK-IN VERIFICATION INPUT
// ============================================
export function CheckInCodeInput({ sessionId, onVerified }) {
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  
  const { verifyCheckInCode } = useSafetyAPI();

  const handleVerify = async () => {
    if (code.length !== 6) return;
    
    setVerifying(true);
    setError(null);
    
    try {
      const result = await verifyCheckInCode(sessionId, code);
      if (result.success) {
        onVerified?.();
      } else {
        setError(result.message || 'Invalid code');
      }
    } catch (_error) { // eslint-disable-line no-unused-vars
      setError('Verification failed');
    }
    setVerifying(false);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/10">
      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
        <span>🔐</span> Enter Check-in Code
      </h4>
      
      <p className="text-gray-400 text-sm mb-4">
        Ask the provider for the 6-character code shown in their app
      </p>

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-sm mb-4">
          {error}
        </div>
      )}

      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
        placeholder="XXXXXX"
        className="w-full px-4 py-4 bg-slate-900/70 text-white text-center text-2xl font-mono tracking-[0.3em] rounded-xl border border-white/10 focus:border-emerald-400 focus:outline-none mb-4"
        maxLength={6}
      />

      <button
        onClick={handleVerify}
        disabled={code.length !== 6 || verifying}
        className="w-full py-4 rounded-xl bg-linear-to-r from-emerald-500 to-green-600 hover:shadow-xl hover:shadow-emerald-500/25 disabled:opacity-50 text-white font-bold transition-all"
      >
        {verifying ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Verifying...
          </span>
        ) : (
          '✓ Verify Code'
        )}
      </button>
    </div>
  );
}

// ============================================
// SAFETY CHECK-IN TIMER
// ============================================
export function CheckInTimer({ nextCheckIn, onCheckIn }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      if (!nextCheckIn) return;
      
      const now = new Date();
      const target = new Date(nextCheckIn);
      const diff = target - now;

      if (diff <= 0) {
        setIsOverdue(true);
        setTimeLeft('Overdue');
      } else {
        setIsOverdue(false);
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextCheckIn]);

  if (!nextCheckIn) return null;

  return (
    <div className={`glass-panel rounded-xl p-4 border ${isOverdue ? 'border-red-500/50 bg-red-900/20' : 'border-white/10'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isOverdue ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'}`}>
            {isOverdue ? '⚠️' : '⏱️'}
          </div>
          <div>
            <p className={`font-bold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
              {isOverdue ? 'Check-in Overdue!' : 'Next Check-in'}
            </p>
            <p className={`text-lg font-mono ${isOverdue ? 'text-red-300' : 'text-gray-300'}`}>
              {timeLeft}
            </p>
          </div>
        </div>
        <button
          onClick={onCheckIn}
          className={`px-4 py-2 rounded-xl font-bold transition-all ${
            isOverdue
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'
          }`}
        >
          ✓ Check In
        </button>
      </div>
      
      {isOverdue && (
        <p className="text-red-300 text-xs mt-3">
          Trusted contacts will be notified if you don't check in soon
        </p>
      )}
    </div>
  );
}

// ============================================
// PROVIDER BADGE DISPLAY
// ============================================
export function ProviderBadge({ provider, size = 'normal' }) {
  const sizeClasses = {
    small: 'w-16 h-16',
    normal: 'w-24 h-24',
    large: 'w-32 h-32',
  };

  return (
    <div className="glass-panel rounded-2xl p-4 border border-white/10 text-center">
      <div className="flex flex-col items-center">
        <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden border-4 border-emerald-500/50 mb-3`}>
          <img
            src={provider.avatar || 'https://via.placeholder.com/150'}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
        </div>
        
        <h4 className="text-white font-bold text-lg">{provider.name}</h4>
        
        <div className="flex items-center gap-2 mt-2">
          {provider.isVerified && (
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-1">
              ✓ Verified
            </span>
          )}
          {provider.safetyScore >= 4 && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium flex items-center gap-1">
              ⭐ Top Rated
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
          <span>⭐ {provider.rating?.toFixed(1) || 'N/A'}</span>
          <span>🛡️ {provider.safetyScore?.toFixed(1) || 'N/A'}</span>
        </div>

        {provider.safetyBadges?.length > 0 && (
          <div className="flex gap-1 mt-3 flex-wrap justify-center">
            {provider.safetyBadges.map((badge, i) => (
              <span key={i} className="w-6 h-6 flex items-center justify-center" title={badge.badge}>
                {badge.badge === 'verified_id' && '🆔'}
                {badge.badge === 'safety_trained' && '📚'}
                {badge.badge === 'background_checked' && '🔍'}
                {badge.badge === 'top_rated_safety' && '🏆'}
                {badge.badge === 'trusted_provider' && '💎'}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SCOPE CHANGE REQUEST
// ============================================
export function ScopeChangeRequest({ change, onConsent }) {
  return (
    <div className="glass-panel rounded-xl p-4 border border-amber-500/30 bg-amber-500/5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">📝</span>
        <div className="flex-1">
          <h4 className="text-amber-400 font-bold">Scope Change Request</h4>
          <p className="text-gray-300 mt-2">{change.description}</p>
          
          <div className="mt-3 flex items-center justify-between">
            <div>
              <span className="text-gray-400 text-sm">Additional Cost:</span>
              <span className="text-white font-bold ml-2">₹{change.additionalCost}</span>
            </div>
            
            {!change.customerConsent ? (
              <button
                onClick={onConsent}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm transition-all"
              >
                Approve Change
              </button>
            ) : (
              <span className="text-emerald-400 text-sm font-medium">✓ Approved</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SAFETY RATING FORM
// ============================================
export function SafetyRatingForm({ orderId, ratedUserId, onSubmit }) {
  const [ratings, setRatings] = useState({
    overallSafety: 5,
    professionalBehavior: 5,
    respectfulCommunication: 5,
    timelinessAndReliability: 5,
    properIdentification: 5,
    boundaryRespect: 5,
  });
  const [comment, setComment] = useState('');
  const [feltSafe, setFeltSafe] = useState(true);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const { submitSafetyRating } = useSafetyAPI();

  const ratingCategories = [
    { key: 'overallSafety', label: 'Overall Safety', icon: '🛡️' },
    { key: 'professionalBehavior', label: 'Professional Behavior', icon: '👔' },
    { key: 'respectfulCommunication', label: 'Respectful Communication', icon: '💬' },
    { key: 'boundaryRespect', label: 'Boundary Respect', icon: '🚪' },
    { key: 'properIdentification', label: 'Proper Identification', icon: '🆔' },
    { key: 'timelinessAndReliability', label: 'Timeliness', icon: '⏰' },
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitSafetyRating({
        orderId,
        ratedUserId,
        ratings,
        comment,
        feltSafe,
        wouldRecommend,
      });
      onSubmit?.();
    } catch (error) {
      console.error('Rating submission failed:', error);
    }
    setSubmitting(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <span>🛡️</span> Safety Rating
      </h3>

      {/* Quick Questions */}
      <div className="glass-panel rounded-xl p-4 border border-white/10 space-y-4">
        <label className="flex items-center justify-between">
          <span className="text-gray-300">Did you feel safe?</span>
          <div className="flex gap-2">
            <button
              onClick={() => setFeltSafe(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                feltSafe ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
              }`}
            >
              Yes 👍
            </button>
            <button
              onClick={() => setFeltSafe(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !feltSafe ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400'
              }`}
            >
              No 👎
            </button>
          </div>
        </label>

        <label className="flex items-center justify-between">
          <span className="text-gray-300">Would you recommend?</span>
          <div className="flex gap-2">
            <button
              onClick={() => setWouldRecommend(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                wouldRecommend ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
              }`}
            >
              Yes 👍
            </button>
            <button
              onClick={() => setWouldRecommend(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !wouldRecommend ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-400'
              }`}
            >
              No 👎
            </button>
          </div>
        </label>
      </div>

      {/* Star Ratings */}
      <div className="space-y-3">
        {ratingCategories.map(({ key, label, icon }) => (
          <div key={key} className="glass-panel rounded-xl p-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm flex items-center gap-2">
                <span>{icon}</span> {label}
              </span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRatings({ ...ratings, [key]: star })}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${
                      ratings[key] >= star ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comment */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience (optional)..."
        className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-emerald-400 focus:outline-none resize-none h-24"
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-4 rounded-xl bg-linear-to-r from-emerald-500 to-green-600 hover:shadow-xl hover:shadow-emerald-500/25 disabled:opacity-50 text-white font-bold transition-all"
      >
        {submitting ? 'Submitting...' : 'Submit Safety Rating'}
      </button>
    </div>
  );
}

// ============================================
// INCIDENT REPORT BUTTON
// ============================================
export function ReportIncidentButton({ orderId, reportedAgainst, onReported }) {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { reportIncident } = useSafetyAPI();

  const categories = [
    { value: 'harassment', label: 'Harassment' },
    { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
    { value: 'safety_concern', label: 'Safety Concern' },
    { value: 'privacy_violation', label: 'Privacy Violation' },
    { value: 'unauthorized_entry', label: 'Unauthorized Entry' },
    { value: 'intimidation', label: 'Intimidation' },
    { value: 'discrimination', label: 'Discrimination' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async () => {
    if (!category || !description) return;
    
    setSubmitting(true);
    try {
      await reportIncident({
        reportedAgainst,
        orderId,
        category,
        severity,
        description,
      });
      setShowModal(false);
      onReported?.();
    } catch (error) {
      console.error('Report failed:', error);
    }
    setSubmitting(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-all"
      >
        <span>🚨</span> Report Issue
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="glass-panel w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-white/10 p-6 animate-[slideUp_0.3s_ease-out]">
            <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 sm:hidden" />
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🚨</span> Report Safety Issue
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-400"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm mb-2 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-red-400 focus:outline-none"
                >
                  <option value="">Select a category...</option>
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Severity</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high', 'critical'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeverity(s)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        severity === s
                          ? s === 'critical' ? 'bg-red-500 text-white' :
                            s === 'high' ? 'bg-orange-500 text-white' :
                            s === 'medium' ? 'bg-amber-500 text-white' :
                            'bg-blue-500 text-white'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-sm mb-2 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what happened..."
                  className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-red-400 focus:outline-none resize-none h-32"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!category || !description || submitting}
                className="w-full py-4 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold transition-all"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
