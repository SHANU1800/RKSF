import { useState, useEffect, useCallback } from 'react';
import { useSafetyAPI, useLocationTracking, useCheckInTimer } from '../../hooks/useSafety';
import { AlertCircleIcon } from '../icons/IconTypes';
import {
  SOSButton,
  CheckInCodeDisplay,
  CheckInCodeInput,
  CheckInTimer,
  ProviderBadge,
  ScopeChangeRequest,
  SafetyRatingForm,
  ReportIncidentButton,
} from './SafetyComponents';

// ============================================
// VISIT SESSION TRACKER - Main Active Visit Component
// ============================================
export default function VisitSessionTracker({
  sessionId,
  orderId,
  isProvider,
  onSessionEnd,
}) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [activeTab, setActiveTab] = useState('status');

  const {
    getVisitSession,
    checkOutSession,
    consentToScopeChange,
  } = useSafetyAPI();

  const { location, stopTracking } = useLocationTracking(sessionId, !!session);
  const { nextCheckIn, checkIn, isOverdue } = useCheckInTimer(sessionId, session?.checkInIntervalMinutes);

  // Fetch session data
  const fetchSession = useCallback(async () => {
    try {
      const data = await getVisitSession(sessionId);
      setSession(data);
      setLoading(false);
    } catch (_error) { // eslint-disable-line no-unused-vars
      setError('Failed to load session');
      setLoading(false);
    }
  }, [sessionId, getVisitSession]);

  useEffect(() => {
    fetchSession();
    // Poll for updates
    const interval = setInterval(fetchSession, 30000);
    return () => clearInterval(interval);
  }, [fetchSession]);

  // Handle check-in
  const handleCheckIn = async () => {
    try {
      await checkIn();
      fetchSession();
    } catch (err) {
      console.error('Check-in failed:', err);
    }
  };

  // Handle session end
  const handleEndSession = async () => {
    try {
      await checkOutSession(sessionId);
      stopTracking();
      setShowRating(true);
    } catch (err) {
      console.error('Checkout failed:', err);
    }
  };

  // Handle scope change consent
  const handleScopeConsent = async (index) => {
    try {
      await consentToScopeChange(sessionId, index);
      fetchSession();
    } catch (err) {
      console.error('Consent failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-red-500/30 text-center">
        <AlertCircleIcon size={40} className="text-red-400 mx-auto mb-4" />
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchSession}
          className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (showRating) {
    return (
      <div className="space-y-4">
        <SafetyRatingForm
          orderId={orderId}
          ratedUserId={isProvider ? session?.customer : session?.provider}
          onSubmit={onSessionEnd}
        />
      </div>
    );
  }

  const isActive = session?.status === 'active';
  const isCompleted = session?.status === 'completed';

  return (
    <div className="relative min-h-screen pb-24">
      {/* SOS Button - Always visible during active session */}
      {isActive && <SOSButton sessionId={sessionId} enabled={true} />}

      {/* Header */}
      <div className="glass-panel rounded-2xl p-4 mb-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isActive ? 'bg-emerald-500/20 text-emerald-400' : 
              isCompleted ? 'bg-gray-500/20 text-gray-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
              {isActive ? '🔒' : isCompleted ? '✓' : '⏳'}
            </div>
            <div>
              <h2 className="text-white font-bold">Active Visit</h2>
              <p className={`text-sm ${
                isActive ? 'text-emerald-400' : 'text-gray-400'
              }`}>
                {session?.status?.charAt(0).toUpperCase() + session?.status?.slice(1)}
              </p>
            </div>
          </div>

          <ReportIncidentButton
            orderId={orderId}
            reportedAgainst={isProvider ? session?.customer : session?.provider}
          />
        </div>

        {/* Location Sharing Indicator */}
        {isActive && session?.locationSharingEnabled && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <span className="text-emerald-400 text-sm">📍</span>
            <span className="text-emerald-300 text-sm">Location sharing active</span>
            {location && (
              <span className="text-gray-400 text-xs ml-auto">
                Updated {new Date().toLocaleTimeString()}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {['status', 'details', 'timeline'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl font-medium capitalize whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-white text-slate-900'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'status' && (
          <>
            {/* Check-in Code */}
            {isActive && session?.checkInCode && (
              isProvider ? (
                <CheckInCodeDisplay code={session.checkInCode} isProvider={true} />
              ) : !session?.codeVerified ? (
                <CheckInCodeInput
                  sessionId={sessionId}
                  onVerified={fetchSession}
                />
              ) : (
                <div className="glass-panel rounded-xl p-4 border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
                  <span className="text-emerald-400 text-2xl">✓</span>
                  <span className="text-emerald-300 font-medium">Check-in code verified</span>
                </div>
              )
            )}

            {/* Check-in Timer */}
            {isActive && (
              <CheckInTimer
                sessionId={sessionId}
                nextCheckIn={nextCheckIn}
                onCheckIn={handleCheckIn}
              />
            )}

            {/* Provider Badge */}
            {!isProvider && session?.providerDetails && (
              <ProviderBadge provider={session.providerDetails} />
            )}

            {/* Scope Changes */}
            {session?.scopeChanges?.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-white font-bold">Scope Changes</h4>
                {session.scopeChanges.map((change, index) => (
                  <ScopeChangeRequest
                    key={index}
                    change={change}
                    onConsent={() => handleScopeConsent(index)}
                  />
                ))}
              </div>
            )}

            {/* Job Details */}
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <span>📋</span> Job Details
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Service</span>
                  <span className="text-white">{session?.jobDetails?.serviceName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estimated Cost</span>
                  <span className="text-white">₹{session?.jobDetails?.estimatedCost || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Work Scope</span>
                  <span className="text-white text-right max-w-[60%]">
                    {session?.jobDetails?.workScope || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Contact Status */}
            {session?.trustedContactNotified && (
              <div className="glass-panel rounded-xl p-3 border border-blue-500/30 bg-blue-500/10 flex items-center gap-3">
                <span className="text-blue-400">📞</span>
                <span className="text-blue-300 text-sm">
                  Trusted contact has been notified of this visit
                </span>
              </div>
            )}
          </>
        )}

        {activeTab === 'details' && (
          <>
            {/* Full Job Transparency */}
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span>📄</span> Full Work Scope
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                {session?.jobDetails?.fullDescription || 'No detailed description available.'}
              </p>
            </div>

            {/* Payment Info */}
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <span>💳</span> Payment
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Base Cost</span>
                  <span className="text-white">₹{session?.jobDetails?.baseCost || 0}</span>
                </div>
                {session?.scopeChanges?.filter(c => c.customerConsent).map((change, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">+ {change.description}</span>
                    <span className="text-amber-400">₹{change.additionalCost}</span>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-emerald-400 font-bold text-xl">
                    ₹{(session?.jobDetails?.baseCost || 0) + 
                       (session?.scopeChanges?.filter(c => c.customerConsent)
                         .reduce((sum, c) => sum + c.additionalCost, 0) || 0)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <span className="text-emerald-400">💡</span>
                <span className="text-emerald-300 text-xs">
                  All payments through app. No cash required.
                </span>
              </div>
            </div>

            {/* Communication Rules */}
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <span>📞</span> Masked Communication
              </h4>
              <p className="text-gray-400 text-sm mb-3">
                All calls are routed through a secure masked number. Your personal number is never shared.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Masked Number:</span>
                <span className="font-mono text-white bg-slate-900/70 px-3 py-1 rounded-lg">
                  {session?.maskedPhoneNumber || 'XXX-XXX-XXXX'}
                </span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'timeline' && (
          <div className="glass-panel rounded-2xl p-4 border border-white/10">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <span>📅</span> Visit Timeline
            </h4>
            <div className="relative space-y-4 pl-8">
              <div className="absolute left-3 top-1 bottom-1 w-0.5 bg-white/10" />
              
              {/* Timeline Events */}
              {session?.timeline?.map((event, index) => (
                <div key={index} className="relative">
                  <div className={`absolute left-[-1.6rem] w-4 h-4 rounded-full border-2 ${
                    event.type === 'check_in' ? 'bg-emerald-500 border-emerald-400' :
                    event.type === 'sos' ? 'bg-red-500 border-red-400' :
                    event.type === 'scope_change' ? 'bg-amber-500 border-amber-400' :
                    'bg-white/30 border-white/50'
                  }`} />
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-white font-medium">{event.title}</p>
                    <p className="text-gray-400 text-sm">{event.description}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {/* Default events if no timeline */}
              {!session?.timeline?.length && (
                <>
                  <div className="relative">
                    <div className="absolute left-[-1.6rem] w-4 h-4 rounded-full border-2 bg-emerald-500 border-emerald-400" />
                    <div className="bg-white/5 rounded-lg p-3">
                      <p className="text-white font-medium">Session Started</p>
                      <p className="text-gray-400 text-sm">Visit session initiated</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {session?.createdAt ? new Date(session.createdAt).toLocaleTimeString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  {session?.codeVerified && (
                    <div className="relative">
                      <div className="absolute left-[-1.6rem] w-4 h-4 rounded-full border-2 bg-blue-500 border-blue-400" />
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-white font-medium">Code Verified</p>
                        <p className="text-gray-400 text-sm">Check-in code confirmed</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      {isActive && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 pt-8 pb-4 px-4">
          <div className="max-w-md mx-auto flex gap-3">
            <button
              onClick={handleCheckIn}
              disabled={!isOverdue}
              className={`flex-1 py-4 rounded-xl font-bold transition-all ${
                isOverdue
                  ? 'bg-amber-500 text-white animate-pulse'
                  : 'bg-white/10 text-gray-400'
              }`}
            >
              ✓ Check In
            </button>
            <button
              onClick={handleEndSession}
              className="flex-1 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all"
            >
              Complete Visit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SAFETY INDICATOR - Shows safety status on order cards
// ============================================
export function SafetyIndicator({ verificationLevel, safetyScore }) {
  const getColor = () => {
    if (safetyScore >= 4.5) return 'emerald';
    if (safetyScore >= 4) return 'blue';
    if (safetyScore >= 3) return 'amber';
    return 'gray';
  };

  const color = getColor();

  return (
    <div className={`flex items-center gap-2 px-2 py-1 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
      {verificationLevel === 'premium' && (
        <span className="text-emerald-400 text-sm">🛡️</span>
      )}
      {verificationLevel === 'verified' && (
        <span className="text-blue-400 text-sm">✓</span>
      )}
      <span className={`text-${color}-400 text-xs font-medium`}>
        {safetyScore?.toFixed(1)} ★
      </span>
    </div>
  );
}

// ============================================
// PRE-BOOKING SAFETY CHECK - Before confirming a booking
// ============================================
export function PreBookingSafetyCheck({ provider, onConfirm, onCancel }) {
  const [agreed, setAgreed] = useState(false);
  const [notifyContact, setNotifyContact] = useState(true);

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 max-w-md mx-auto">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🛡️</span> Safety Check
      </h3>

      {/* Provider Info */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-emerald-500/50">
          <img
            src={provider.avatar || 'https://via.placeholder.com/100'}
            alt={provider.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="text-white font-bold">{provider.name}</h4>
          <div className="flex items-center gap-2 text-sm">
            <span className={`text-${provider.isVerified ? 'emerald' : 'gray'}-400`}>
              {provider.isVerified ? '✓ Verified' : 'Unverified'}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">⭐ {provider.rating?.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Safety Features */}
      <div className="space-y-3 mb-6">
        <div className="flex items-start gap-3 text-sm">
          <span className="text-emerald-400 mt-0.5">✓</span>
          <span className="text-gray-300">Check-in code will be required before entry</span>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <span className="text-emerald-400 mt-0.5">✓</span>
          <span className="text-gray-300">Location sharing will be enabled during visit</span>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <span className="text-emerald-400 mt-0.5">✓</span>
          <span className="text-gray-300">SOS button available at all times</span>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <span className="text-emerald-400 mt-0.5">✓</span>
          <span className="text-gray-300">Communication via masked number only</span>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 mb-6">
        <label className="flex items-center gap-3 bg-white/5 rounded-xl p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={notifyContact}
            onChange={(e) => setNotifyContact(e.target.checked)}
            className="w-5 h-5 rounded border-gray-500"
          />
          <span className="text-gray-300 text-sm">Notify my trusted contact about this visit</span>
        </label>

        <label className="flex items-center gap-3 bg-white/5 rounded-xl p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5 rounded border-gray-500"
          />
          <span className="text-gray-300 text-sm">I understand and agree to the safety protocols</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-medium transition-all"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm({ notifyContact })}
          disabled={!agreed}
          className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white font-bold transition-all"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}












