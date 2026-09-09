import { useState, useEffect, useRef } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Copy,
  Trash2,
  Send,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Power,
} from 'lucide-react';
import { ProjectDetail, FirmwareConfig } from '../../config/projectsData';
import { serialService, ConnectedDeviceInfo } from '../../services/flasher/serialService';
import { downloadService } from '../../services/flasher/downloadService';
import { flasherService } from '../../services/flasher/flasherService';
import { logger, LogEntry } from '../../services/flasher/loggerService';
import { incrementProjectFlashCount } from '../../services/flasher/flashCountService';

interface WebFlasherPanelProps {
  project: ProjectDetail;
  onFlashSuccess?: () => void;
}

type FlashPhase =
  | 'idle'
  | 'connecting'
  | 'downloading'
  | 'flashing'
  | 'verifying'
  | 'rebooting'
  | 'completed'
  | 'error';

export default function WebFlasherPanel({ project, onFlashSuccess }: WebFlasherPanelProps) {
  // Active selected firmware
  const [selectedFwIndex, setSelectedFwIndex] = useState(0);
  const activeFw: FirmwareConfig = project.firmwares[selectedFwIndex] || project.firmwares[0];

  // Serial Connection State
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<ConnectedDeviceInfo | null>(null);
  const baudRate = 921600;

  // Flashing State
  const [phase, setPhase] = useState<FlashPhase>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressStatusText, setProgressStatusText] = useState('');
  const [progressSubText, setProgressSubText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Serial Monitor / Console State
  const [showConsole, setShowConsole] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [serialTxText, setSerialTxText] = useState('');
  const [lineEnding, setLineEnding] = useState<'NL' | 'CR' | 'NLCR'>('NL');
  const [copiedLogs, setCopiedLogs] = useState(false);
  const terminalContainerRef = useRef<HTMLDivElement>(null);

  // Serial Monitor Polling reader
  const monitorIntervalRef = useRef<any>(null);

  // Check Web Serial support on mount
  useEffect(() => {
    setIsBrowserSupported(serialService.checkBrowserSupport());
  }, []);

  // Subscribe to logger entries
  useEffect(() => {
    const unsubscribe = logger.subscribe((_entry, allLogs) => {
      setLogs([...allLogs]);
    });
    return () => unsubscribe();
  }, []);

  // Auto-scroll terminal internally without scrolling the entire project page
  useEffect(() => {
    if (showConsole && terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [logs, showConsole]);

  // Clean up serial connection on unmount
  useEffect(() => {
    return () => {
      stopSerialMonitor();
      serialService.disconnectDevice().catch(() => {});
    };
  }, []);

  // Serial Monitor Stream Loop
  const startSerialMonitor = () => {
    const transport = serialService.getTransport();
    if (!transport) return;

    const decoder = new TextDecoder();
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
    }

    monitorIntervalRef.current = setInterval(() => {
      if (transport.buffer && transport.buffer.length > 0) {
        const chunk = transport.buffer;
        transport.flushInput();
        try {
          const text = decoder.decode(chunk);
          if (text && text.trim()) {
            logger.rx(text);
          }
        } catch {
          // safe catch for partial utf-8 chunks
        }
      }
    }, 60);
  };

  const stopSerialMonitor = () => {
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
  };

  // Connect to board
  const handleConnect = async (): Promise<boolean> => {
    setErrorMessage('');
    setIsConnecting(true);
    try {
      await serialService.requestPort();
      const info = await serialService.connectDevice(baudRate, () => {
        setIsConnected(false);
        setDeviceInfo(null);
        stopSerialMonitor();
        logger.warn('Device was unplugged.');
      });

      setDeviceInfo(info);
      setIsConnected(true);
      setIsConnecting(false);
      startSerialMonitor();
      return true;
    } catch (err: any) {
      setIsConnecting(false);
      setIsConnected(false);
      setDeviceInfo(null);
      stopSerialMonitor();

      let msg = err.message || 'Connection failed';
      if (msg.includes('Permission Denied')) {
        msg = 'Port selection cancelled or access denied.';
      }
      setErrorMessage(msg);
      return false;
    }
  };

  // Disconnect from board
  const handleDisconnect = async () => {
    stopSerialMonitor();
    await serialService.disconnectDevice();
    setIsConnected(false);
    setDeviceInfo(null);
    setPhase('idle');
  };

  // Start complete Download & Flash pipeline
  const handleStartFlash = async () => {
    if (phase === 'flashing' || phase === 'downloading' || phase === 'verifying') return;
    setErrorMessage('');

    // Ensure device is connected first
    let currentLoader = serialService.getLoader();
    if (!serialService.isConnected() || !currentLoader) {
      const connected = await handleConnect();
      if (!connected) return;
      currentLoader = serialService.getLoader();
    }

    if (!currentLoader) {
      setErrorMessage('Failed to initialize connection to microcontroller.');
      return;
    }

    // Stop serial monitor temporarily so port write lock is released
    stopSerialMonitor();
    await new Promise((r) => setTimeout(r, 80));

    try {
      // Step 1: Downloading binary from remote URL
      setPhase('downloading');
      setProgressPercent(0);
      setProgressStatusText(`Downloading ${activeFw.name}...`);
      setProgressSubText('Streaming binary from remote repository...');

      const binaryData = await downloadService.downloadFile(activeFw.firmwareUrl, (downloaded, total) => {
        if (total > 0) {
          const pct = Math.min(100, Math.round((downloaded / total) * 100));
          setProgressPercent(pct);
          setProgressStatusText(`Downloading firmware (${pct}%)...`);
          setProgressSubText(`${downloadService.formatBytes(downloaded)} of ${downloadService.formatBytes(total)}`);
        } else {
          setProgressStatusText('Downloading firmware binary...');
          setProgressSubText(downloadService.formatBytes(downloaded));
        }
      });

      logger.log(`Binary downloaded: ${downloadService.formatBytes(binaryData.length)}.`);

      // Step 2: Flashing memory blocks
      setPhase('flashing');
      setProgressPercent(0);
      setProgressStatusText(`Writing to flash memory at ${activeFw.flashAddress}...`);
      setProgressSubText(`Target size: ${downloadService.formatBytes(binaryData.length)}`);

      await flasherService.flashFile(
        currentLoader,
        binaryData,
        activeFw.flashAddress,
        (written, total) => {
          if (total > 0) {
            const pct = Math.min(100, Math.round((written / total) * 100));
            if (pct < 99) {
              setProgressPercent(pct);
              setProgressStatusText(`Writing flash (${pct}%)...`);
              setProgressSubText(`${downloadService.formatBytes(written)} of ${downloadService.formatBytes(total)}`);
            }
          }
        },
        () => {
          // Step 3: Hardware MD5 Checksum Verification
          setPhase('verifying');
          setProgressPercent(99);
          setProgressStatusText('Verifying flash integrity (MD5 Checksum)...');
          setProgressSubText('Checking written memory blocks on hardware...');
        }
      );

      // Flash verified successfully!
      setProgressPercent(100);
      setProgressStatusText('Flash verified successfully!');
      setProgressSubText('MD5 checksum matched. Ready to reboot.');
      await new Promise((r) => setTimeout(r, 600));

      // Step 4: Hardware Reset & Reboot
      setPhase('rebooting');
      setProgressStatusText('Executing hardware reset...');
      setProgressSubText('Toggling reset pins to boot new firmware...');

      await flasherService.resetDevice(currentLoader);
      await new Promise((r) => setTimeout(r, 500));

      // Step 5: Completed!
      setPhase('completed');
      logger.log(`Flash sequence completed successfully for ${activeFw.name}!`);

      // Atomically increment flash count in Firestore / local service
      incrementProjectFlashCount(project.id, activeFw.version).catch((err) => {
        console.warn('Flash count increment notice:', err);
      });

      // Resume serial monitor to display newly booted firmware output
      startSerialMonitor();

      // Trigger success modal & parent callback
      setShowSuccessModal(true);
      if (onFlashSuccess) {
        onFlashSuccess();
      }
    } catch (err: any) {
      logger.error(`Flashing aborted: ${err.message}`);
      setPhase('error');
      setErrorMessage(err.message || 'Flashing procedure failed');

      // Restart serial monitor even on error
      if (serialService.isConnected()) {
        startSerialMonitor();
      }
    }
  };

  // Transmit command to device via Serial Tx
  const handleSendSerialTx = async () => {
    if (!serialTxText.trim()) return;
    const esploader = serialService.getLoader();
    if (!esploader || !esploader.transport) {
      logger.error('Tx Failed: Serial port is not connected.');
      return;
    }

    let payload = serialTxText;
    if (lineEnding === 'NL') payload += '\n';
    else if (lineEnding === 'CR') payload += '\r';
    else if (lineEnding === 'NLCR') payload += '\r\n';

    const encoder = new TextEncoder();
    const data = encoder.encode(payload);

    try {
      const transport = esploader.transport;
      if (transport && transport.device && transport.device.writable) {
        const writer = transport.device.writable.getWriter();
        await writer.write(data);
        writer.releaseLock();

        logger.tx(payload);
        setSerialTxText('');
      } else {
        logger.error('Failed to send data: Serial port is not writable.');
      }
    } catch (error: any) {
      logger.error(`Serial write error: ${error.message}`);
    }
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopiedLogs(true);
      setTimeout(() => setCopiedLogs(false), 1500);
    });
  };

  const isFlashingActive =
    phase === 'downloading' || phase === 'flashing' || phase === 'verifying' || phase === 'rebooting';

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        boxShadow: 'var(--shadow-md)',
        position: 'sticky',
        top: 'calc(var(--nav-height) + var(--space-4))',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(230, 81, 0, 0.1)',
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Zap size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, margin: 0, color: 'var(--color-ink-primary)' }}>
              1-Click Web Flasher
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--color-ink-tertiary)', letterSpacing: '0.04em' }}>
              ESP-IDF Web Serial Flasher
            </span>
          </div>
        </div>

        {/* Board connection status pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: isConnected ? 'rgba(34, 197, 94, 0.12)' : 'var(--color-paper)',
            border: isConnected ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--color-border)',
            color: isConnected ? 'rgb(22, 163, 74)' : 'var(--color-ink-tertiary)',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: isConnected ? 'rgb(34, 197, 94)' : 'var(--color-ink-tertiary)',
            }}
          />
          {isConnected ? (deviceInfo?.chipName || 'Connected') : 'Ready'}
        </div>
      </div>

      {/* Browser Web Serial Warning */}
      {!isBrowserSupported && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-4)',
            color: 'rgb(220, 38, 38)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Web Serial is not supported in this browser. Please use <strong>Google Chrome</strong> or{' '}
            <strong>Microsoft Edge</strong> on Desktop to flash hardware.
          </span>
        </div>
      )}

      {/* Firmware Version Selection Dropdown */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--color-ink-secondary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          <span>Firmware Version</span>
          <span style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)' }}>
            {activeFw.releaseDate}
          </span>
        </div>

        <select
          value={selectedFwIndex}
          onChange={(e) => !isFlashingActive && setSelectedFwIndex(Number(e.target.value))}
          disabled={isFlashingActive}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-paper)',
            color: 'var(--color-ink-primary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            outline: 'none',
            cursor: isFlashingActive ? 'not-allowed' : 'pointer',
          }}
        >
          {project.firmwares.map((fw, idx) => (
            <option key={idx} value={idx}>
              {fw.name} ({fw.version})
            </option>
          ))}
        </select>

        {/* Active Firmware Note */}
        {activeFw.versionNote && (
          <div
            style={{
              marginTop: 'var(--space-2)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-paper)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p style={{ fontSize: '11px', color: 'var(--color-ink-secondary)', margin: 0, lineHeight: 1.45 }}>
              {activeFw.versionNote}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 4, fontSize: '10px', color: 'var(--color-ink-tertiary)' }}>
              <span>Flash Address: {activeFw.flashAddress}</span>
              <span>•</span>
              <span>Version: {activeFw.version}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Box during Flash */}
      {isFlashingActive && (
        <div
          style={{
            backgroundColor: 'var(--color-paper)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-ink-primary)' }}>
              {progressStatusText}
            </span>
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-accent)' }}>
              {progressPercent}%
            </span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: 8,
              backgroundColor: 'var(--color-border)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--color-accent)',
                borderRadius: 'var(--radius-full)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>

          <p style={{ fontSize: '11px', color: 'var(--color-ink-secondary)', margin: 0 }}>
            {progressSubText}
          </p>
        </div>
      )}

      {/* Error notification */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-4)',
            color: 'rgb(220, 38, 38)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="btn btn--ghost btn--sm"
            style={{ padding: '0 4px', fontSize: '11px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Flash Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
        <button
          type="button"
          onClick={handleStartFlash}
          disabled={!isBrowserSupported || isFlashingActive}
          className="btn btn--primary"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '12px var(--space-4)',
            fontWeight: 700,
            fontSize: 'var(--text-sm)',
            boxShadow: '0 4px 14px rgba(230, 81, 0, 0.25)',
          }}
        >
          {isFlashingActive ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Flashing Firmware...</span>
            </>
          ) : isConnecting ? (
            <>
              <RefreshCw size={16} className="animate-spin" />
              <span>Connecting to Device...</span>
            </>
          ) : isConnected ? (
            <>
              <Zap size={16} />
              <span>Flash {activeFw.name}</span>
            </>
          ) : (
            <>
              <Zap size={16} />
              <span>Connect & Flash Device</span>
            </>
          )}
        </button>

        {isConnected && !isFlashingActive && (
          <button
            type="button"
            onClick={handleDisconnect}
            className="btn btn--secondary btn--sm"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--color-ink-secondary)' }}
          >
            <Power size={13} /> Disconnect Port
          </button>
        )}
      </div>

      {/* Serial Console / Monitor Collapsible Section */}
      <div
        style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          backgroundColor: 'var(--color-paper)',
        }}
      >
        <div
          onClick={() => setShowConsole(!showConsole)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: 'var(--color-surface)',
            cursor: 'pointer',
            borderBottom: showConsole ? '1px solid var(--color-border)' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Terminal size={14} color="var(--color-accent)" />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-ink-primary)' }}>
              Web Serial Monitor
            </span>
            <span style={{ fontSize: '10px', color: 'var(--color-ink-tertiary)' }}>
              ({logs.length} events)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {showConsole ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>

        {showConsole && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Console Toolbar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '4px 8px',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'rgba(0,0,0,0.02)',
                fontSize: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <select
                  value={lineEnding}
                  onChange={(e: any) => setLineEnding(e.target.value)}
                  style={{
                    fontSize: '10px',
                    padding: '1px 4px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-ink-secondary)',
                  }}
                >
                  <option value="NL">NL (\n)</option>
                  <option value="CR">CR (\r)</option>
                  <option value="NLCR">Both (\r\n)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className="btn btn--ghost btn--sm"
                  style={{ padding: '2px 6px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  <Copy size={11} /> {copiedLogs ? 'Copied!' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={() => logger.clear()}
                  className="btn btn--ghost btn--sm"
                  style={{ padding: '2px 6px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  <Trash2 size={11} /> Clear
                </button>
              </div>
            </div>

            {/* Terminal Window */}
            <div
              ref={terminalContainerRef}
              style={{
                height: 150,
                overflowY: 'auto',
                padding: '8px 10px',
                backgroundColor: '#111827',
                color: '#f3f4f6',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                fontSize: '11px',
                lineHeight: 1.45,
              }}
            >
              {logs.length === 0 ? (
                <div style={{ color: '#6b7280', fontStyle: 'italic', padding: '10px 0' }}>
                  Serial log ready. Logs and chip serial output will display here.
                </div>
              ) : (
                logs.map((log, i) => {
                  let color = '#93c5fd'; // info
                  if (log.type === 'warn') color = '#fbbf24';
                  if (log.type === 'error') color = '#f87171';
                  if (log.type === 'rx') color = '#34d399';
                  if (log.type === 'tx') color = '#a78bfa';
                  if (log.type === 'system') color = '#9ca3af';

                  return (
                    <div key={i} style={{ wordBreak: 'break-all', marginBottom: 2 }}>
                      <span style={{ color: '#6b7280', marginRight: 6 }}>[{log.timestamp}]</span>
                      <span style={{ color }}>{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Terminal Tx Input Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 8px',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                gap: 6,
              }}
            >
              <input
                type="text"
                value={serialTxText}
                onChange={(e) => setSerialTxText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendSerialTx();
                }}
                disabled={!isConnected || isFlashingActive}
                placeholder={isConnected ? 'Send serial command...' : 'Connect to send commands'}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-paper)',
                  color: 'var(--color-ink-primary)',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleSendSerialTx}
                disabled={!isConnected || isFlashingActive || !serialTxText.trim()}
                className="btn btn--primary btn--sm"
                style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px' }}
              >
                <Send size={11} /> Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Flash Success Celebration Modal */}
      {showSuccessModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--space-4)',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: 480,
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-xl)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: 'rgb(34, 197, 94)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto var(--space-4)',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-ink-primary)', margin: '0 0 var(--space-2) 0' }}>
              Firmware Flashed Successfully!
            </h2>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink-secondary)', lineHeight: 1.5, margin: '0 0 var(--space-6) 0' }}>
              <strong>{activeFw.name}</strong> ({activeFw.version}) has been flashed and verified on your{' '}
              {deviceInfo?.chipDescription || 'ESP32'}. The microcontroller has booted into the new firmware.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)' }}>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="btn btn--primary"
                style={{ padding: '8px 24px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
