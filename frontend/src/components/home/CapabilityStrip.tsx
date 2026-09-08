import { Monitor, Camera, Wifi, Cpu, Mic, Thermometer } from 'lucide-react';

const CAPABILITIES = [
  { icon: Monitor, name: '2.8" Color Display', detail: '240 × 320 · ILI9341' },
  { icon: Camera, name: 'GC2145 Camera', detail: '2MP DVP · AI-ready' },
  { icon: Cpu, name: 'ESP32-S3 N16R8', detail: '240MHz · 16MB/8MB' },
  { icon: Wifi, name: 'Wi-Fi + Bluetooth', detail: '802.11 b/g/n · BLE 5' },
  { icon: Mic, name: 'Dual MEMS Mics', detail: 'ES7243E · 2W Speaker' },
  { icon: Thermometer, name: 'Onboard Sensors', detail: 'AHT20 · LTR-303 · SC7A' },
];

export default function CapabilityStrip() {
  return (
    <section
      className="capability-strip"
      aria-label="UNIHIKER K10 hardware capabilities"
    >
      <div className="container capability-strip__inner">
        {CAPABILITIES.map((cap, index) => (
          <div key={cap.name} style={{ display: 'contents' }}>
            <div className="capability-strip__item">
              <div className="capability-strip__icon" aria-hidden="true">
                <cap.icon size={16} strokeWidth={1.5} />
              </div>
              <div className="capability-strip__text">
                <span className="capability-strip__name">{cap.name}</span>
                <span className="capability-strip__detail">{cap.detail}</span>
              </div>
            </div>
            {index < CAPABILITIES.length - 1 && (
              <div className="capability-strip__divider" aria-hidden="true" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
