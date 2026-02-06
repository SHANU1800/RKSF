import { useState, useEffect, useCallback } from 'react';
import { useSafetyAPI } from '../../hooks/useSafety';

// ============================================
// SAFETY CENTER - Main Component
// ============================================

// Icon Component Helper
const IconSVG = ({ type, className = "w-6 h-6" }) => {
  const icons = {
    shield: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    check: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    settings: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    users: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    book: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
  };
  return icons[type] || null;
};

export default function SafetyCenter({ currentUser, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [preferences, setPreferences] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { getSafetyPreferences, getVerificationStatus } = useSafetyAPI();

  const loadSafetyData = useCallback(async () => {
    setLoading(true);
    try {
      const [prefsRes, verifRes] = await Promise.all([
        getSafetyPreferences(),
        getVerificationStatus(),
      ]);
      if (prefsRes.success) setPreferences(prefsRes.data);
      if (verifRes.success) setVerificationStatus(verifRes.data);
    } catch (error) {
      console.error('Failed to load safety data:', error);
    } finally {
      setLoading(false);
    }
  }, [getSafetyPreferences, getVerificationStatus]);

  useEffect(() => {
    loadSafetyData();
  }, [loadSafetyData]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'shield' },
    { id: 'verification', label: 'Verification', icon: 'check' },
    { id: 'preferences', label: 'Preferences', icon: 'settings' },
    { id: 'contacts', label: 'Trusted Contacts', icon: 'users' },
    { id: 'training', label: 'Training', icon: 'book' },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="glass-panel rounded-2xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading Safety Center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
      <div className="glass-panel w-full md:max-w-2xl md:mx-4 max-h-[90vh] overflow-hidden rounded-t-3xl md:rounded-2xl border border-white/10 animate-[slideUp_0.3s_ease-out] flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-white/10 shrink-0">
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center shadow-lg shadow-black/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Safety Center</h2>
                <p className="text-gray-400 text-sm">Your safety is our priority</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation - Mobile Nav Style */}
          <div className="glass-panel rounded-2xl border border-white/10 p-2 mt-4">
            <div className="flex justify-around items-stretch gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#0a0a0a]/20 text-[#0a0a0a] border border-[#0a0a0a]/40 shadow-lg'
                      : 'text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <IconSVG type={tab.icon} className="w-5 h-5" />
                  <span className="text-[10px] md:text-xs uppercase tracking-wide font-bold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'overview' && (
            <SafetyOverview 
              preferences={preferences} 
              verificationStatus={verificationStatus}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'verification' && (
            <VerificationSection 
              verificationStatus={verificationStatus}
              onRefresh={loadSafetyData}
            />
          )}
          {activeTab === 'preferences' && (
            <SafetyPreferencesSection 
              preferences={preferences}
              currentUser={currentUser}
              onUpdate={loadSafetyData}
            />
          )}
          {activeTab === 'contacts' && (
            <TrustedContactsSection 
              contacts={preferences?.trustedContacts || []}
              onUpdate={loadSafetyData}
            />
          )}
          {activeTab === 'training' && (
            <TrainingSection 
              conductAgreement={preferences?.conductAgreement}
              onUpdate={loadSafetyData}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SAFETY OVERVIEW
// ============================================
function SafetyOverview({ preferences, verificationStatus, currentUser }) {
  const isProvider = currentUser?.role === 'provider';
  
  const safetyScore = calculateSafetyScore(preferences, verificationStatus);

  return (
    <div className="space-y-6">
      {/* Safety Score */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-white/10"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${safetyScore * 3.51} 351`}
              strokeLinecap="round"
              className="text-[#0a0a0a]"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">{safetyScore}%</span>
          </div>
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Safety Score</h3>
        <p className="text-gray-400 text-sm">
          {safetyScore >= 80 ? 'Excellent! Your safety profile is complete.' :
           safetyScore >= 50 ? 'Good progress. Complete more steps to improve.' :
           'Let\'s improve your safety profile together.'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickActionCard
          icon="🆔"
          title="ID Verified"
          status={verificationStatus?.isFullyVerified}
          statusText={verificationStatus?.isFullyVerified ? 'Complete' : 'Pending'}
        />
        <QuickActionCard
          icon="👥"
          title="Trusted Contacts"
          status={(preferences?.trustedContacts?.length || 0) > 0}
          statusText={`${preferences?.trustedContacts?.length || 0} added`}
        />
        <QuickActionCard
          icon="📱"
          title="SOS Enabled"
          status={preferences?.emergencySettings?.enableSOSButton}
          statusText={preferences?.emergencySettings?.enableSOSButton ? 'Active' : 'Disabled'}
        />
        <QuickActionCard
          icon="📍"
          title="Location Sharing"
          status={preferences?.emergencySettings?.autoShareLocationDuringVisit}
          statusText={preferences?.emergencySettings?.autoShareLocationDuringVisit ? 'Active' : 'Disabled'}
        />
        {isProvider && (
          <>
            <QuickActionCard
              icon="👥"
              title="Buddy System"
              status={preferences?.providerSettings?.optOutSoloVisits}
              statusText={preferences?.providerSettings?.optOutSoloVisits ? 'Enabled' : 'Disabled'}
            />
            <QuickActionCard
              icon="☀️"
              title="Daytime Only"
              status={preferences?.providerSettings?.daytimeOnlyAvailability}
              statusText={preferences?.providerSettings?.daytimeOnlyAvailability ? 'Active' : 'Disabled'}
            />
          </>
        )}
      </div>

      {/* Safety Tips */}
      <div className="glass-panel rounded-2xl p-4 border border-white/10">
        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
          <span>💡</span> Safety Tips
        </h4>
        <ul className="space-y-2 text-sm text-gray-300">
          {isProvider ? (
            <>
              <li className="flex items-start gap-2">
                <span className="text-[#0a0a0a]">✓</span>
                Always verify the check-in code before entering
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0a0a0a]">✓</span>
                Keep location sharing enabled during visits
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0a0a0a]">✓</span>
                Use daytime-only settings if you prefer
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0a0a0a]">✓</span>
                Request a buddy for any visit you're unsure about
              </li>
            </>
          ) : (
            <>
              <li className="flex items-start gap-2">
                <span className="text-[#0a0a0a]">✓</span>
                Only share check-in code after verifying provider's photo & badge
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0a0a0a]">✓</span>
                Add a trusted contact who can see visit ETA
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0a0a0a]">✓</span>
                Book verified providers only for added safety
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0a0a0a]">✓</span>
                Never pay in cash - use in-app payments only
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, status, statusText }) {
  return (
    <div className="glass-panel rounded-xl p-4 border border-white/10">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-white font-medium text-sm">{title}</span>
      </div>
      <div className={`text-sm font-bold ${status ? 'text-[#0a0a0a]' : 'text-[#F7D047]'}`}>
        {status ? '✓' : '○'} {statusText}
      </div>
    </div>
  );
}

function calculateSafetyScore(preferences, verificationStatus) {
  let score = 0;
  
  // Verification (30 points)
  if (verificationStatus?.isFullyVerified) score += 30;
  else if (verificationStatus?.verifications?.governmentId?.status === 'approved') score += 15;
  
  // Trusted contacts (20 points)
  const contacts = preferences?.trustedContacts?.length || 0;
  score += Math.min(contacts * 10, 20);
  
  // Emergency settings (20 points)
  if (preferences?.emergencySettings?.enableSOSButton) score += 10;
  if (preferences?.emergencySettings?.autoShareLocationDuringVisit) score += 10;
  
  // Training (20 points)
  if (preferences?.conductAgreement?.agreedAt) score += 10;
  if (preferences?.conductAgreement?.safetyTrainingCompleted) score += 10;
  
  // Other settings (10 points)
  if (preferences?.customerSettings?.requireVerifiedProvidersOnly) score += 5;
  if (preferences?.customerSettings?.requireConfirmedTimeWindow) score += 5;
  
  return Math.min(score, 100);
}

// ============================================
// VERIFICATION SECTION
// ============================================
function VerificationSection({ verificationStatus, onRefresh }) {
  const [uploading, setUploading] = useState(false);
  const { uploadVerification } = useSafetyAPI();

  const verificationTypes = [
    {
      type: 'government_id',
      title: 'Government ID',
      description: 'Upload Aadhaar, PAN, Passport, or Driver\'s License',
      icon: '🆔',
      data: verificationStatus?.verifications?.governmentId,
    },
    {
      type: 'selfie',
      title: 'Selfie Verification',
      description: 'Take a photo to match with your ID',
      icon: '📸',
      data: verificationStatus?.verifications?.selfie,
    },
    {
      type: 'address',
      title: 'Address Verification',
      description: 'Upload utility bill or bank statement',
      icon: '🏠',
      data: verificationStatus?.verifications?.address,
    },
  ];

  const handleUpload = async (type, documentType) => {
    setUploading(true);
    // In production: Use file upload to S3, then call API
    // For demo: simulate upload
    try {
      await uploadVerification({
        verificationType: type,
        documentType,
        documentUrl: 'https://example.com/document.jpg',
        metadata: { nameOnDocument: 'User Name' },
      });
      onRefresh();
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-3 h-3 rounded-full ${verificationStatus?.isFullyVerified ? 'bg-[#0a0a0a]' : 'bg-[#F7D047]'} animate-pulse`} />
        <span className="text-white font-medium">
          {verificationStatus?.isFullyVerified ? 'Fully Verified' : 'Verification Required'}
        </span>
      </div>

      {verificationTypes.map((v) => (
        <div key={v.type} className="glass-panel rounded-xl p-4 border border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shrink-0">
              {v.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold">{v.title}</h4>
              <p className="text-gray-400 text-sm mt-0.5">{v.description}</p>
              
              {v.data ? (
                <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  v.data.status === 'approved' ? 'bg-[#0a0a0a]/20 text-[#0a0a0a]' :
                  v.data.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                  v.data.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {v.data.status === 'approved' ? '✓ Verified' :
                   v.data.status === 'pending' ? '⏳ Under Review' :
                   v.data.status === 'rejected' ? '✕ Rejected' :
                   '○ Expired'}
                </div>
              ) : (
                <button
                  onClick={() => handleUpload(v.type, 'aadhaar')}
                  disabled={uploading}
                  className="mt-3 px-4 py-2 bg-[#0a0a0a]/20 hover:bg-[#0a0a0a]/30 text-white rounded-lg text-sm font-medium transition-all"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {verificationStatus?.needsReverification && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="text-amber-400 font-medium">Re-verification Required</p>
            <p className="text-gray-400 text-sm mt-1">
              Some of your documents are expiring soon. Please update them to maintain your verified status.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SAFETY PREFERENCES SECTION
// ============================================
function SafetyPreferencesSection({ preferences = {}, currentUser, onUpdate }) {
  const [isSaving, setIsSaving] = useState(false);
  const { updateSafetyPreferences } = useSafetyAPI();
  const isProvider = currentUser?.role === 'provider';

  const handleToggle = async (path, value) => {
    setIsSaving(true);
    const update = {};
    const keys = path.split('.');
    let current = update;
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    await updateSafetyPreferences(update);
    onUpdate();
    setIsSaving(false);
  };

  return (
    <div className={`space-y-4 ${isSaving ? 'opacity-75 pointer-events-none' : ''}`}>
      {/* Gender Preferences */}
      <div className="glass-panel rounded-xl p-4 border border-white/10">
        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
          <span>👤</span> Matching Preferences
        </h4>
        
        {!isProvider && (
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Preferred Provider Gender</span>
              <select
                value={preferences.preferredProviderGender || 'any'}
                onChange={(e) => handleToggle('preferredProviderGender', e.target.value)}
                className="bg-slate-900/70 text-white rounded-lg px-3 py-2 border border-white/10 text-sm"
              >
                <option value="any">Any</option>
                <option value="female_only">Women Only</option>
                <option value="male_only">Men Only</option>
              </select>
            </label>
          </div>
        )}

        {isProvider && (
          <div className="space-y-4">
            <ToggleSetting
              label="Opt out of solo visits"
              description="Require a buddy/chaperone for all visits"
              checked={preferences.providerSettings?.optOutSoloVisits}
              onChange={(v) => handleToggle('providerSettings.optOutSoloVisits', v)}
            />
            <ToggleSetting
              label="Daytime only availability"
              description="Only accept bookings during daylight hours"
              checked={preferences.providerSettings?.daytimeOnlyAvailability}
              onChange={(v) => handleToggle('providerSettings.daytimeOnlyAvailability', v)}
            />
            <ToggleSetting
              label="Require buddy for first visits"
              description="Always have a second person for new customers"
              checked={preferences.providerSettings?.requireBuddyForFirstVisit}
              onChange={(v) => handleToggle('providerSettings.requireBuddyForFirstVisit', v)}
            />
            
            {/* Area Management */}
            <div className="pt-4 border-t border-white/10">
              <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                <span>📍</span> Area Management
              </h5>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Accepted Areas (Pincodes)</label>
                  <input
                    type="text"
                    placeholder="e.g., 110001, 110002, 110003"
                    value={(preferences.providerSettings?.acceptedAreas || []).join(', ')}
                    onChange={(e) => {
                      const areas = e.target.value.split(',').map(a => a.trim()).filter(Boolean);
                      handleToggle('providerSettings.acceptedAreas', areas);
                    }}
                    className="w-full px-4 py-2 bg-slate-900/70 text-white rounded-lg border border-white/10 focus:border-[#0a0a0a] focus:outline-none text-sm"
                  />
                  <p className="text-gray-500 text-xs mt-1">Comma-separated list of pincodes you accept</p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Blocked Areas (Pincodes)</label>
                  <input
                    type="text"
                    placeholder="e.g., 110010, 110011"
                    value={(preferences.providerSettings?.blockedAreas || []).join(', ')}
                    onChange={(e) => {
                      const areas = e.target.value.split(',').map(a => a.trim()).filter(Boolean);
                      handleToggle('providerSettings.blockedAreas', areas);
                    }}
                    className="w-full px-4 py-2 bg-slate-900/70 text-white rounded-lg border border-white/10 focus:border-red-400 focus:outline-none text-sm"
                  />
                  <p className="text-gray-500 text-xs mt-1">Comma-separated list of pincodes to avoid</p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Maximum Distance (km)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={preferences.providerSettings?.maxDistanceKm || 50}
                    onChange={(e) => handleToggle('providerSettings.maxDistanceKm', parseInt(e.target.value) || 50)}
                    className="w-full px-4 py-2 bg-slate-900/70 text-white rounded-lg border border-white/10 focus:border-[#0a0a0a] focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customer Safety Settings */}
      {!isProvider && (
        <div className="glass-panel rounded-xl p-4 border border-white/10">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <span>🔒</span> Booking Safety
          </h4>
          <div className="space-y-4">
            <ToggleSetting
              label="Verified providers only"
              description="Only book providers with ID verification"
              checked={preferences.customerSettings?.requireVerifiedProvidersOnly}
              onChange={(v) => handleToggle('customerSettings.requireVerifiedProvidersOnly', v)}
            />
            <ToggleSetting
              label="Photo verification required"
              description="Provider must match their profile photo"
              checked={preferences.customerSettings?.requirePhotoVerification}
              onChange={(v) => handleToggle('customerSettings.requirePhotoVerification', v)}
            />
            <ToggleSetting
              label="Confirmed time window"
              description="Require exact arrival time confirmation"
              checked={preferences.customerSettings?.requireConfirmedTimeWindow}
              onChange={(v) => handleToggle('customerSettings.requireConfirmedTimeWindow', v)}
            />
          </div>
        </div>
      )}

      {/* Emergency Settings */}
      <div className="glass-panel rounded-xl p-4 border border-white/10">
        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
          <span>🚨</span> Emergency Settings
        </h4>
        <div className="space-y-4">
          <ToggleSetting
            label="Enable SOS Button"
            description="Quick access to emergency help during visits"
            checked={preferences.emergencySettings?.enableSOSButton}
            onChange={(v) => handleToggle('emergencySettings.enableSOSButton', v)}
          />
          <ToggleSetting
            label="Auto-share location"
            description="Automatically share location during visits"
            checked={preferences.emergencySettings?.autoShareLocationDuringVisit}
            onChange={(v) => handleToggle('emergencySettings.autoShareLocationDuringVisit', v)}
          />
          <ToggleSetting
            label="Contact police on SOS"
            description="Include emergency services in SOS alerts"
            checked={preferences.emergencySettings?.sosContactPolice}
            onChange={(v) => handleToggle('emergencySettings.sosContactPolice', v)}
          />

          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-gray-300 text-sm">Check-in interval</span>
              <p className="text-gray-500 text-xs mt-0.5">How often to confirm you're safe</p>
            </div>
            <select
              value={preferences.emergencySettings?.checkInInterval || 30}
              onChange={(e) => handleToggle('emergencySettings.checkInInterval', parseInt(e.target.value))}
              className="bg-slate-900/70 text-white rounded-lg px-3 py-2 border border-white/10 text-sm"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <div className="flex-1">
        <span className="text-white text-sm font-medium">{label}</span>
        {description && <p className="text-gray-500 text-xs mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-all shrink-0 ${
          checked ? 'bg-[#0a0a0a]' : 'bg-gray-600'
        }`}
      >
        <span
          className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </label>
  );
}

// ============================================
// TRUSTED CONTACTS SECTION
// ============================================
function TrustedContactsSection({ contacts, onUpdate }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    phone: '',
    relationship: '',
    shareETA: true,
    notifyOnArrival: true,
    notifyOnCompletion: true,
    emergencyContact: false,
  });
  const [saving, setSaving] = useState(false);
  
  const { addTrustedContact, removeTrustedContact } = useSafetyAPI();

  const handleAdd = async () => {
    if (!newContact.name || !newContact.phone) return;
    setSaving(true);
    await addTrustedContact(newContact);
    setNewContact({
      name: '',
      phone: '',
      relationship: '',
      shareETA: true,
      notifyOnArrival: true,
      notifyOnCompletion: true,
      emergencyContact: false,
    });
    setShowAdd(false);
    onUpdate();
    setSaving(false);
  };

  const handleRemove = async (contactId) => {
    await removeTrustedContact(contactId);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm">
          Trusted contacts can view your visit ETA and receive alerts
        </p>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-[#0a0a0a]/20 hover:bg-[#0a0a0a]/30 text-[#0a0a0a] rounded-lg text-sm font-medium transition-all"
        >
          + Add Contact
        </button>
      </div>

      {/* Add Contact Form */}
      {showAdd && (
        <div className="glass-panel rounded-xl p-4 border border-emerald-500/30 mb-4">
          <h4 className="text-white font-bold mb-4">Add Trusted Contact</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Name"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-emerald-400 focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={newContact.phone}
              onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-emerald-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Relationship (e.g., Sister, Friend)"
              value={newContact.relationship}
              onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900/70 text-white rounded-xl border border-white/10 focus:border-emerald-400 focus:outline-none"
            />
            
            <div className="space-y-2 py-2">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={newContact.shareETA}
                  onChange={(e) => setNewContact({ ...newContact, shareETA: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-900 border-white/20"
                />
                <span className="text-gray-300 text-sm">Share visit ETA</span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={newContact.emergencyContact}
                  onChange={(e) => setNewContact({ ...newContact, emergencyContact: e.target.checked })}
                  className="w-5 h-5 rounded bg-slate-900 border-white/20"
                />
                <span className="text-gray-300 text-sm">Emergency contact (SOS alerts)</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !newContact.name || !newContact.phone}
                className="flex-1 py-3 bg-[#0a0a0a] hover:bg-[#000000] disabled:opacity-50 text-white rounded-xl font-medium"
              >
                {saving ? 'Adding...' : 'Add Contact'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact List */}
      {contacts.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-4xl mb-4 block">👥</span>
          <p className="text-gray-400">No trusted contacts added yet</p>
          <p className="text-gray-500 text-sm mt-1">Add someone who can see your visit status</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div key={contact._id} className="glass-panel rounded-xl p-4 border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#0a0a0a] flex items-center justify-center text-white font-bold">
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{contact.name}</h4>
                <p className="text-gray-400 text-sm">{contact.phone}</p>
                <div className="flex gap-2 mt-1">
                  {contact.shareETA && (
                    <span className="text-xs px-2 py-0.5 bg-[#F7D047]/20 text-black rounded">ETA</span>
                  )}
                  {contact.emergencyContact && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded">SOS</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleRemove(contact._id)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-400"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// TRAINING SECTION
// ============================================
function TrainingSection({ conductAgreement, onUpdate }) {
  const [agreeing, setAgreeing] = useState(false);
  const { acceptConductAgreement, completeTraining } = useSafetyAPI();

  const handleAcceptConduct = async () => {
    setAgreeing(true);
    await acceptConductAgreement();
    onUpdate();
    setAgreeing(false);
  };

  const handleCompleteTraining = async (type) => {
    await completeTraining(type);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      {/* Code of Conduct */}
      <div className="glass-panel rounded-xl p-4 border border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-2xl shrink-0">
            📜
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold">Code of Conduct</h4>
            <p className="text-gray-400 text-sm mt-1">
              Our zero-tolerance policy for harassment, discrimination, and unsafe behavior.
            </p>
            
            {conductAgreement?.agreedAt ? (
              <div className="mt-3 flex items-center gap-2 text-[#0a0a0a] text-sm">
                <span>✓</span>
                <span>Accepted on {new Date(conductAgreement.agreedAt).toLocaleDateString()}</span>
              </div>
            ) : (
              <button
                onClick={handleAcceptConduct}
                disabled={agreeing}
                className="mt-3 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm font-medium"
              >
                {agreeing ? 'Processing...' : 'Read & Accept'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Anti-Harassment Training */}
      <div className="glass-panel rounded-xl p-4 border border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-2xl shrink-0">
            🛑
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold">Anti-Harassment Training</h4>
            <p className="text-gray-400 text-sm mt-1">
              Learn about consent-first behavior, respectful communication, and professional boundaries.
            </p>
            
            {conductAgreement?.antiHarassmentCompleted ? (
              <div className="mt-3 flex items-center gap-2 text-[#0a0a0a] text-sm">
                <span>✓</span>
                <span>Completed</span>
              </div>
            ) : (
              <button
                onClick={() => handleCompleteTraining('antiHarassment')}
                className="mt-3 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg text-sm font-medium"
              >
                Start Training (~10 min)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Safety Training */}
      <div className="glass-panel rounded-xl p-4 border border-white/10">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0a0a0a]/20 flex items-center justify-center text-2xl shrink-0">
            🛡️
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold">Safety Best Practices</h4>
            <p className="text-gray-400 text-sm mt-1">
              Entry/exit protocols, check-in procedures, emergency response, and privacy guidelines.
            </p>
            
            {conductAgreement?.safetyTrainingCompleted ? (
              <div className="mt-3 flex items-center gap-2 text-[#0a0a0a] text-sm">
                <span>✓</span>
                <span>Completed on {new Date(conductAgreement.lastTrainingDate).toLocaleDateString()}</span>
              </div>
            ) : (
              <button
                onClick={() => handleCompleteTraining('safety')}
                className="mt-3 px-4 py-2 bg-[#0a0a0a]/20 hover:bg-[#0a0a0a]/30 text-[#0a0a0a] rounded-lg text-sm font-medium"
              >
                Start Training (~15 min)
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Training Benefits */}
      <div className="bg-[#F7D047]/10 border border-[#F7D047]/30 rounded-xl p-4">
        <h4 className="text-black font-medium mb-2">🎖️ Training Benefits</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Earn "Safety Trained" badge on your profile</li>
          <li>• Higher visibility in search results</li>
          <li>• Build trust with customers</li>
          <li>• Required for premium service listings</li>
        </ul>
      </div>
    </div>
  );
}












