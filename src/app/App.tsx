import { useState } from 'react';
import {
  Home,
  Settings,
  Phone,
  Mic,
  Lock,
  Camera,
  Bell,
  Users,
  Share2,
  Circle,
  Cloud,
  Target,
  Send,
  Image,
  AlertCircle,
  Volume2,
  VolumeX,
  BatteryMedium,
  X,
  Plus,
  ChevronLeft,
  Info,
} from 'lucide-react';
import { ImageWithFallback } from './components/figma/ImageWithFallback';

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className={`relative w-12 h-7 rounded-full transition-colors duration-200 flex-shrink-0 ${value ? 'bg-green-500' : 'bg-gray-300'}`}>
      <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

function SliderRow({ label, value, onChange, min = 0, max = 100, badge }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; badge: string }) {
  return (
    <div className="py-4 border-b border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-800">{label}</span>
        <span className="text-sm border border-gray-200 rounded-full px-3 py-0.5 text-gray-600">{badge}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))} className="w-full accent-[#1890d4] h-1.5 rounded-full" />
    </div>
  );
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

type Screen = 'home' | 'emergencyContacts' | 'aiTrack' | 'settings';
type ParcelTab = 'All' | 'In Transit' | 'Delivered' | 'Issues' | 'Returns';
type ParcelStatus = 'Delivered' | 'Shipped' | 'Return Initiated' | 'Refund Processed' | 'Unknown';

interface Parcel {
  id: string;
  carrier: string;
  carrierColor: string;
  sender: string;
  status: ParcelStatus;
  date: string;
  reference: string;
  trackLink?: boolean;
}

const PARCELS: Parcel[] = [
  { id: '1', carrier: 'A', carrierColor: '#FF9900', sender: 'Amazon', status: 'Delivered', date: 'Thu, 25/09/2025 17:26', reference: 'Order#: 202-4006276-3467516' },
  { id: '2', carrier: 'FedEx', carrierColor: '#4D148C', sender: 'gonoknok.com', status: 'Delivered', date: 'Thu, 25/09/2025 15:10', reference: 'Tracking#: 884603460831', trackLink: true },
  { id: '3', carrier: 'A', carrierColor: '#FF9900', sender: 'Amazon', status: 'Delivered', date: 'Thu, 25/09/2025 14:10', reference: 'Order#: 026-6358645-5833942' },
  { id: '4', carrier: 'EVRi', carrierColor: '#6C3FC5', sender: 'Printvision (UK) Ltd', status: 'Shipped', date: 'Est: Wed 24 Sep', reference: 'Order#: 336990-1' },
  { id: '5', carrier: 'UPS', carrierColor: '#351C15', sender: 'UPS', status: 'Unknown', date: 'Wed 24 Sep 14:11', reference: 'Tracking#: 1Z4W260E0410397158', trackLink: true },
  // Returns
  { id: '6', carrier: 'A', carrierColor: '#FF9900', sender: 'Amazon.co.uk', status: 'Return Initiated', date: 'Tue 26 Aug 16:09', reference: 'Order#: 206-6687989-5811534' },
  { id: '7', carrier: 'A', carrierColor: '#FF9900', sender: 'Amazon.co.uk', status: 'Return Initiated', date: 'Wed 27 Aug 10:26', reference: 'Order#: 206-2038430-2277944' },
  { id: '8', carrier: 'SHEIN', carrierColor: '#000', sender: 'SHEIN', status: 'Refund Processed', date: 'Wed 27 Aug 10:26', reference: 'Order#: GSO10F567000PTH' },
  { id: '9', carrier: 'SHEIN', carrierColor: '#000', sender: 'SHEIN', status: 'Refund Processed', date: 'Wed 27 Aug 10:21', reference: 'Order#: GE250211692571291690_GSO10F567000PTH' },
  { id: '10', carrier: 'RM', carrierColor: '#E30613', sender: 'SHEIN', status: 'Return Initiated', date: 'Wed 27 Aug 10:22', reference: 'Order#: GSO12X56100TRQX' },
];

export default function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Screen & tab state
  const [screen, setScreen] = useState<Screen>('home');
  const [parcelTab, setParcelTab] = useState<ParcelTab>('All');

  // Settings state
  const [deviceName, setDeviceName] = useState('GO NOKNOK AI Smart Parcel Box');
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [flipFeed, setFlipFeed] = useState(false);
  const [nightVision, setNightVision] = useState(10);
  const [lowPowerThreshold, setLowPowerThreshold] = useState(10);
  const [deviceVolume, setDeviceVolume] = useState(32);
  const [motionAlerts, setMotionAlerts] = useState(true);
  const [motionSensitivity, setMotionSensitivity] = useState(50);
  const [humanoidFilter, setHumanoidFilter] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showAddContactModal, setShowAddContactModal] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);

  const handleButtonClick = (action: string) => {
    setActiveAction(action);
    setTimeout(() => setActiveAction(null), 200);
  };

  const handleEmergency = () => {
    handleButtonClick('Emergency');
    setShowEmergencyModal(true);
  };

  const openAddContactModal = (contact?: EmergencyContact) => {
    if (contact) {
      setEditingContact(contact);
      setContactName(contact.name);
      setContactPhone(contact.phone);
    } else {
      setEditingContact(null);
      setContactName('');
      setContactPhone('');
    }
    setShowAddContactModal(true);
  };

  const saveContact = () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    if (editingContact) {
      setEmergencyContacts(prev =>
        prev.map(c => c.id === editingContact.id ? { ...c, name: contactName.trim(), phone: contactPhone.trim() } : c)
      );
    } else {
      setEmergencyContacts(prev => [
        ...prev,
        { id: Date.now().toString(), name: contactName.trim(), phone: contactPhone.trim() }
      ]);
    }
    setShowAddContactModal(false);
    setContactName('');
    setContactPhone('');
    setEditingContact(null);
  };

  const deleteContact = (id: string) => {
    setEmergencyContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleTalk = () => {
    handleButtonClick('Talk');
    alert('Two-way talk activated. Speak now...');
  };

  const handleUnlock = () => {
    setIsLocked(!isLocked);
    handleButtonClick('Unlock');
  };

  const handleSnapshot = () => {
    handleButtonClick('Snapshot');
    alert('Snapshot captured!');
  };

  const handleAlarm = () => {
    setIsAlarmActive(!isAlarmActive);
    handleButtonClick('Alarm');
  };

  const handleHumanAlert = () => {
    handleButtonClick('Human Alert');
    alert('Human detection alert configured');
  };

  const handleShareDevice = () => {
    handleButtonClick('Share Device');
    alert('Share device with family members');
  };

  const handleRecord = () => {
    setIsRecording(!isRecording);
    handleButtonClick('Record');
  };

  const handleCloud = () => {
    handleButtonClick('Cloud');
    alert('Opening cloud storage...');
  };

  const handleAITrack = () => {
    handleButtonClick('AI Track');
    setParcelTab('All');
    setScreen('aiTrack');
  };

  const handleSend = () => {
    handleButtonClick('Send');
    alert('Send video clip');
  };

  const handleMedia = () => {
    handleButtonClick('Media');
    alert('Opening media gallery...');
  };

  const handleAlerts = () => {
    handleButtonClick('Alerts');
    alert('Viewing all alerts');
  };

  // Settings Screen
  if (screen === 'settings') {
    const handleCopy = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    return (
      <div className="size-full flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-md h-full bg-white flex flex-col">
          {/* Fixed Header */}
          <div className="bg-[#1890d4] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <button onClick={() => setScreen('home')} className="bg-white text-[#1890d4] w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-semibold text-lg">Device Settings</span>
            <button className="bg-white text-[#1890d4] w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50" style={{ scrollBehavior: 'smooth' }}>
            <div className="bg-white rounded-t-2xl">

              {/* ── Section 1: Device Name ── */}
              <div className="px-4 pt-5 pb-2">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Device Name</label>
                <input
                  type="text"
                  value={deviceName}
                  onChange={e => setDeviceName(e.target.value)}
                  className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 outline-none focus:border-[#1890d4]"
                />
              </div>

              {/* Schedule Unlock */}
              <div className="border-t border-gray-100 mx-4" />
              <button className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#1890d4]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/><path d="M17 3l2 2-2 2M7 3L5 5l2 2"/></svg>
                  </div>
                  <span className="font-semibold text-gray-800">Schedule Unlock</span>
                </div>
                <div className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </button>

              <div className="border-t border-gray-100 mx-4" />

              {/* Share Device */}
              <button className="w-full flex items-center justify-between px-4 py-4 active:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-[#1890d4]" />
                  </div>
                  <span className="font-semibold text-gray-800">Share Device</span>
                </div>
                <div className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center">
                  <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                </div>
              </button>

              <div className="border-t border-gray-100 mx-4" />

              {/* Map placeholder */}
              <div className="relative mx-4 my-4 h-36 rounded-xl overflow-hidden bg-gray-200">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                    <span className="text-xs">Map View</span>
                  </div>
                </div>
                <button className="absolute top-2 right-2 w-9 h-9 bg-[#1890d4] text-white rounded-lg flex items-center justify-center shadow active:scale-95">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>

              {/* Plus Code */}
              <div className="mx-4 mb-4">
                <div className="bg-[#1890d4] rounded-t-xl px-4 py-3 text-center text-white font-semibold">GO NOKNOK Plus Code</div>
                <div className="bg-blue-50 px-4 py-3 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-[#1890d4]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  <span className="font-bold text-[#1890d4] text-lg tracking-widest">9C6WXFH6+RJV</span>
                </div>
                <button onClick={handleCopy} className="w-full border border-gray-200 rounded-b-xl px-4 py-3 flex items-center justify-center gap-2 text-gray-700 font-medium active:bg-gray-50 bg-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  {copied ? 'Copied!' : 'Copy Plus Code'}
                </button>
              </div>

              {/* Device ID */}
              <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
                <span className="text-gray-700">Device ID</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#1890d4] text-sm">bfca5a3d37ebc96a93wizc</span>
                  <button onClick={handleCopy} className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center active:scale-95">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  </button>
                </div>
              </div>

              {/* ── Section 2: Video & Detection Settings ── */}
              <div className="border-t-8 border-gray-100 px-4">
                {/* Show Timestamp */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <span className="text-gray-800">Show Timestamp on Video Feed</span>
                  <Toggle value={showTimestamp} onChange={() => setShowTimestamp(v => !v)} />
                </div>
                {/* Flip Video */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <span className="text-gray-800">Flip Video Feed</span>
                  <Toggle value={flipFeed} onChange={() => setFlipFeed(v => !v)} />
                </div>
                <SliderRow label="Night Vision Level" value={nightVision} onChange={setNightVision} badge="auto" />
                <SliderRow label="Low Power Alert Threshold" value={lowPowerThreshold} onChange={setLowPowerThreshold} badge={String(lowPowerThreshold)} />
                <SliderRow label="Device Volume" value={deviceVolume} onChange={setDeviceVolume} badge={String(deviceVolume)} />
                {/* Motion Detection Alerts */}
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <span className="text-gray-800">Motion Detection Alerts</span>
                  <Toggle value={motionAlerts} onChange={() => setMotionAlerts(v => !v)} />
                </div>
                <SliderRow label="Motion Detection Sensitivity" value={motionSensitivity} onChange={setMotionSensitivity} badge="medium" />
              </div>

              {/* ── Section 3: Humanoid Filter ── */}
              <div className="border-t-8 border-gray-100 px-4">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <span className="text-gray-800">Motion Detection Humanoid filter</span>
                  <Toggle value={humanoidFilter} onChange={() => setHumanoidFilter(v => !v)} />
                </div>

                {/* Firmware Card */}
                <div className="border border-gray-200 rounded-xl p-4 my-4 flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Device Up To Date</p>
                    <p className="text-sm text-gray-500 mt-1">Your GO NOKNOK device is all up to date with the latest firmware version.</p>
                  </div>
                  <svg className="w-6 h-6 text-[#1890d4] flex-shrink-0 ml-3 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
                </div>

                {/* Pro Plan Card */}
                <div className="bg-blue-50 rounded-2xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">No Device Subscription</p>
                  <p className="font-bold text-gray-900 text-lg leading-snug">Enjoy the benefits of<br />GO NOKNOK Pro 📦</p>
                  <div className="mt-3 space-y-1">
                    {['Share device with family & friends','Unlimited cloud storage','GO NOKNOK Scheduled Unlock','AI parcel tracking','Priority care & support','and many more features!'].map(f => (
                      <p key={f} className="text-[#1890d4] text-sm">{f}</p>
                    ))}
                  </div>
                  <button className="w-full mt-4 bg-green-500 text-white py-4 rounded-xl font-semibold active:scale-95 transition-transform">
                    Select Your Plan
                  </button>
                </div>
              </div>

              {/* ── Section 4: Help & Remove Device ── */}
              <div className="border-t-8 border-gray-100 px-4">
                <button className="w-full flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#1890d4]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <span className="font-semibold text-gray-800">Help</span>
                  </div>
                  <div className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center">
                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </div>
                </button>

                <div className="py-4 pb-8">
                  <button
                    onClick={() => { if (window.confirm('Are you sure you want to remove this device?')) setScreen('home'); }}
                    className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold active:scale-95 transition-transform"
                  >
                    Remove Device
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // AI Parcel Tracking Screen
  if (screen === 'aiTrack') {
    const statusBorderColor = (status: ParcelStatus) => {
      if (status === 'Delivered') return 'border-l-green-500';
      if (status === 'Shipped') return 'border-l-blue-500';
      if (status === 'Return Initiated') return 'border-l-orange-400';
      if (status === 'Refund Processed') return 'border-l-teal-500';
      return 'border-l-gray-300';
    };
    const statusColor = (status: ParcelStatus) => {
      if (status === 'Delivered') return 'text-green-600';
      if (status === 'Shipped') return 'text-blue-600';
      if (status === 'Return Initiated') return 'text-orange-500';
      if (status === 'Refund Processed') return 'text-teal-600';
      return 'text-gray-500';
    };
    const filteredParcels = PARCELS.filter(p => {
      if (parcelTab === 'All') return true;
      if (parcelTab === 'Delivered') return p.status === 'Delivered';
      if (parcelTab === 'In Transit') return p.status === 'Shipped';
      if (parcelTab === 'Returns') return p.status === 'Return Initiated' || p.status === 'Refund Processed';
      if (parcelTab === 'Issues') return p.status === 'Unknown';
      return false;
    });
    const tabs: ParcelTab[] = ['All', 'In Transit', 'Delivered', 'Issues', 'Returns'];

    return (
      <div className="size-full flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-md h-full bg-white flex flex-col">
          {/* Header */}
          <div className="bg-[#1890d4] px-4 py-3 flex items-center justify-between">
            <button onClick={() => setScreen('home')} className="bg-white/20 text-white w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-transform">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-semibold text-lg">AI Parcel Tracking</span>
            <button className="bg-white/20 text-white w-9 h-9 rounded-lg flex items-center justify-center active:scale-95 transition-transform">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b bg-white overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setParcelTab(tab)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
                  parcelTab === tab
                    ? 'text-[#1890d4] border-b-2 border-[#1890d4]'
                    : 'text-gray-500'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Parcel List */}
          <div className="flex-1 overflow-y-auto bg-gray-50 p-3 flex flex-col gap-3">
            {filteredParcels.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-gray-400">No items in this category.</div>
            ) : (
              filteredParcels.map(parcel => (
                <div key={parcel.id} className={`bg-white rounded-xl shadow-sm border-l-4 ${statusBorderColor(parcel.status)} p-4`}>
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                      style={{ backgroundColor: parcel.carrierColor }}
                    >
                      {parcel.carrier}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{parcel.sender}</p>
                      <p className={`text-sm font-semibold mt-0.5 ${statusColor(parcel.status)}`}>{parcel.status}</p>
                      <p className="text-xs text-gray-500 mt-1">On: {parcel.date}</p>
                      <p className="text-xs text-gray-400 mt-0.5 break-all">{parcel.reference}</p>
                      {parcel.trackLink && (
                        <button className="text-xs text-[#1890d4] mt-1 underline">Track ↗</button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Emergency Contacts Screen
  if (screen === 'emergencyContacts') {
    return (
      <div className="size-full flex items-center justify-center bg-gray-900">
        <div className="w-full max-w-md h-full bg-white flex flex-col">
          {/* Header */}
          <div className="bg-[#1890d4] px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setScreen('home')}
              className="bg-white text-[#1890d4] w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-white font-semibold text-lg">Emergency Contacts</span>
            <button className="bg-white text-[#1890d4] w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-transform">
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Contact List */}
          <div className="flex-1 bg-gray-100 overflow-y-auto">
            <div className="bg-white rounded-t-2xl min-h-full">
              {emergencyContacts.length === 0 ? (
                <div className="flex items-center justify-center h-48">
                  <p className="text-gray-400">No contacts added yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {emergencyContacts.map(contact => (
                    <div key={contact.id} className="flex items-center justify-between px-4 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{contact.name}</p>
                        <p className="text-gray-500 text-sm">{contact.phone}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => alert(`Testing call to ${contact.name}...`)}
                          className="bg-orange-400 text-white px-3 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => openAddContactModal(contact)}
                          className="bg-[#1890d4] text-white px-3 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteContact(contact.id)}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Contact Button */}
          <div className="p-4 bg-white border-t">
            <button
              onClick={() => openAddContactModal()}
              className="w-full bg-green-500 text-white py-4 rounded-xl font-semibold active:scale-95 transition-transform"
            >
              Add Emergency Contact
            </button>
          </div>

          {/* Add / Edit Contact Modal */}
          {showAddContactModal && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50 px-6">
              <div className="bg-white rounded-2xl p-6 w-full shadow-xl">
                <h2 className="font-bold text-xl mb-4">
                  {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
                </h2>
                <input
                  type="text"
                  placeholder="Name"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-3 outline-none focus:border-[#1890d4] text-gray-700"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-5 outline-none focus:border-[#1890d4] text-gray-700"
                />
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setShowAddContactModal(false)}
                    className="text-gray-500 font-medium px-4 py-2 active:scale-95 transition-transform"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveContact}
                    disabled={!contactName.trim() || !contactPhone.trim()}
                    className="bg-[#1890d4] text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50 active:scale-95 transition-transform"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="size-full flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md h-full bg-white flex flex-col relative">
        {/* Top Bar */}
        <div className="bg-[#1890d4] px-4 py-3 flex items-center justify-between">
          <button 
            onClick={() => handleButtonClick('Home')}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors active:scale-95"
          >
            <Home className="w-6 h-6" />
          </button>
          <div className="text-white font-semibold text-lg">v + b</div>
          <button
            onClick={() => setScreen('settings')}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors active:scale-95"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Warning Banner */}
        {showBanner && (
          <div className="bg-[#ffc4d4] px-4 py-3 flex items-center justify-between">
            <p className="text-[#8b0000] text-sm flex-1 text-center">
              Your Home Plan monthly payment is overdue. Please clear it to avoid losing access.
            </p>
            <button 
              onClick={() => setShowBanner(false)}
              className="text-[#8b0000] hover:bg-white/30 p-1 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Battery Indicator */}
        <div className="bg-black px-4 py-2 flex items-center justify-end">
          <BatteryMedium className="w-4 h-4 text-white mr-2" />
          <span className="text-white text-sm">Battery 60%</span>
        </div>

        {/* Camera View */}
        <div className="bg-black flex-1 relative">
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1670544745056-90ade4589493?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdXRkb29yJTIwYmFja3lhcmQlMjBzZWN1cml0eSUyMGNhbWVyYSUyMHZpZXd8ZW58MXx8fHwxNzgxMDgzMzg5fDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Security camera view"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-4 left-4 text-white text-xs bg-black/50 px-2 py-1 rounded">
            2026-03-24 12:54:12
          </div>
        </div>

        {/* Camera ID and Mute */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b">
          <div className="bg-gray-100 px-4 py-2 rounded-full flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#1890d4]" />
            <span className="text-sm font-medium">9F32F2MQ+MHX</span>
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-2 rounded-lg transition-all active:scale-95 ${
              isMuted ? 'bg-red-500 text-white' : 'bg-gray-100 text-red-500'
            }`}
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>

        {/* Main Action Buttons */}
        <div className="bg-white px-6 py-4 grid grid-cols-4 gap-6">
          <button 
            onClick={handleEmergency}
            className={`flex flex-col items-center gap-2 transition-transform active:scale-95 ${
              activeAction === 'Emergency' ? 'scale-95' : ''
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
              <Phone className="w-7 h-7 text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">Emergency</span>
          </button>

          <button 
            onClick={handleTalk}
            className={`flex flex-col items-center gap-2 transition-transform active:scale-95 ${
              activeAction === 'Talk' ? 'scale-95' : ''
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Mic className="w-7 h-7 text-[#1890d4]" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Talk</span>
          </button>

          <button 
            onClick={handleUnlock}
            className={`flex flex-col items-center gap-2 transition-transform active:scale-95 ${
              activeAction === 'Unlock' ? 'scale-95' : ''
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Lock className={`w-7 h-7 text-[#1890d4] transition-transform ${!isLocked ? 'rotate-12' : ''}`} />
            </div>
            <span className="text-xs text-gray-700 font-medium">{isLocked ? 'Unlock' : 'Lock'}</span>
          </button>

          <button 
            onClick={handleSnapshot}
            className={`flex flex-col items-center gap-2 transition-transform active:scale-95 ${
              activeAction === 'Snapshot' ? 'scale-95' : ''
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Camera className="w-7 h-7 text-[#1890d4]" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Snapshot</span>
          </button>
        </div>

        {/* Secondary Action Buttons */}
        <div className="bg-white px-6 py-4 grid grid-cols-4 gap-6 border-t">
          <button 
            onClick={handleAlarm}
            className={`flex flex-col items-center gap-2 transition-transform active:scale-95 ${
              activeAction === 'Alarm' ? 'scale-95' : ''
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isAlarmActive ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <Bell className={`w-7 h-7 ${isAlarmActive ? 'text-red-600 animate-pulse' : 'text-[#1890d4]'}`} />
            </div>
            <span className="text-xs text-gray-700 font-medium">Alarm</span>
          </button>

          <button 
            onClick={handleHumanAlert}
            className={`flex flex-col items-center gap-2 transition-transform active:scale-95 ${
              activeAction === 'Human Alert' ? 'scale-95' : ''
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-7 h-7 text-[#1890d4]" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Human Alert</span>
          </button>

          <button 
            onClick={handleShareDevice}
            className={`flex flex-col items-center gap-2 transition-transform active:scale-95 ${
              activeAction === 'Share Device' ? 'scale-95' : ''
            }`}
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Share2 className="w-7 h-7 text-[#1890d4]" />
            </div>
            <span className="text-xs text-gray-700 font-medium">Share Device</span>
          </button>

          <button 
            onClick={handleRecord}
            className={`flex flex-col items-center gap-2 transition-transform active:scale-95 ${
              activeAction === 'Record' ? 'scale-95' : ''
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${
              isRecording ? 'bg-red-100' : 'bg-blue-100'
            }`}>
              <Circle className={`w-7 h-7 ${isRecording ? 'text-red-600 fill-red-600 animate-pulse' : 'text-[#1890d4]'}`} />
            </div>
            <span className="text-xs text-gray-700 font-medium">Record</span>
          </button>
        </div>

        {/* Emergency Numbers Modal */}
        {showEmergencyModal && (
          <div className="absolute inset-0 bg-black/40 flex items-end justify-center z-50 pb-48">
            <div className="bg-white rounded-2xl p-6 w-[85%] shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-xl">Emergency Numbers</h2>
                <button
                  onClick={() => {
                    setShowEmergencyModal(false);
                    setScreen('emergencyContacts');
                  }}
                  className="bg-[#1890d4] text-white w-10 h-10 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => alert('Calling Emergency (999)...')}
                className="w-full bg-red-500 text-white py-4 rounded-xl font-semibold mb-3 active:scale-95 transition-transform"
              >
                Emergency (999)
              </button>
              <button
                onClick={() => setShowEmergencyModal(false)}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold active:scale-95 transition-transform"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="bg-white px-6 py-4 grid grid-cols-5 gap-4 border-t-2">
          <button 
            onClick={handleCloud}
            className={`flex flex-col items-center gap-1 transition-transform active:scale-95 ${
              activeAction === 'Cloud' ? 'scale-95' : ''
            }`}
          >
            <Cloud className="w-7 h-7 text-[#1890d4]" />
            <span className="text-xs text-gray-700">Cloud</span>
          </button>

          <button 
            onClick={handleAITrack}
            className={`flex flex-col items-center gap-1 transition-transform active:scale-95 ${
              activeAction === 'AI Track' ? 'scale-95' : ''
            }`}
          >
            <Target className="w-7 h-7 text-[#1890d4]" />
            <span className="text-xs text-gray-700">AI Track</span>
          </button>

          <button 
            onClick={handleSend}
            className={`flex flex-col items-center gap-1 transition-transform active:scale-95 ${
              activeAction === 'Send' ? 'scale-95' : ''
            }`}
          >
            <Send className="w-7 h-7 text-[#1890d4]" />
            <span className="text-xs text-gray-700">Send</span>
          </button>

          <button 
            onClick={handleMedia}
            className={`flex flex-col items-center gap-1 transition-transform active:scale-95 ${
              activeAction === 'Media' ? 'scale-95' : ''
            }`}
          >
            <Image className="w-7 h-7 text-[#1890d4]" />
            <span className="text-xs text-gray-700">Media</span>
          </button>

          <button 
            onClick={handleAlerts}
            className={`flex flex-col items-center gap-1 transition-transform active:scale-95 ${
              activeAction === 'Alerts' ? 'scale-95' : ''
            }`}
          >
            <AlertCircle className="w-7 h-7 text-[#1890d4]" />
            <span className="text-xs text-gray-700">Alerts</span>
          </button>
        </div>
      </div>
    </div>
  );
}
