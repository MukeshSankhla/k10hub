// projectsData.ts
// Comprehensive catalog of projects with firmware configurations and documentation.

export interface FirmwareConfig {
  version: string;
  name: string;
  releaseDate: string;
  firmwareUrl: string;
  flashAddress: string;
  versionNote: string;
}

export interface ProjectDetail {
  id: string;
  title: string;
  publishDate: string;
  type: string;
  level: number;
  author: string;
  authorAvatar?: string;
  authorRole?: string;
  authorId?: string;
  authorEmail?: string;
  status?: 'draft' | 'pending_approval' | 'published' | 'rejected';
  visibility?: 'draft' | 'public';
  flashCount: number;
  description: string;
  coverImage: string;
  docLink?: string;
  githubLink?: string;
  videoLink?: string;
  projectMdFile?: string | null;
  markdownContent?: string;
  compatibleBoard?: string;
  license?: string;
  tags?: string[];
  firmwares: FirmwareConfig[];
}

export const AVAILABLE_TOPICS = [
  'AI & Machine Learning',
  'Computer Vision',
  'IoT',
  'Robotics',
  'Automation',
  'Embedded Systems',
  'Sensors & Electronics',
  'HMI',
  'Data & Cloud',
  'Programming',
  'STEM Education',
  'Smart Devices',
  'Edge Computing',
  'Multimedia',
  'Industrial Applications',
] as const;

export type Topic = (typeof AVAILABLE_TOPICS)[number];

export const ESP32_P4_DISPLAY_DOCS = `# ESP32-P4 MIPI DSI Animation & Telemetry Display System

An end-to-end, high-performance animation playback and sci-fi telemetry display ecosystem engineered for the **ESP32-P4** RISC-V microcontroller. It leverages native **MIPI DSI 2-lane** display driving, **hardware JPEG decoding**, high-speed **4-bit SD_MMC streaming**, and real-time double-buffered graphics to deliver high-frame-rate video playback overlaid with **15 customizable Sci-Fi HUD telemetry dashboards**.

The system is designed for PC modding, internal cabinet telemetry displays, and desktop cyber-terminals, featuring seamless USB serial telemetry streaming from Windows host hardware monitors.

---

## 🌟 Key Features

- **Hardware-Accelerated JPEG Decoding**: Employs the ESP32-P4 dedicated hardware JPEG decoder engine (\`driver/jpeg_decode.h\`) for decoding full-resolution frames in real time at smooth 24+ FPS.
- **Double-Buffered MIPI DSI Driver**: Native 2-lane MIPI DSI interface with hardware LDO PHY power management and tear-free double framebuffer ping-ponging in PSRAM.
- **High-Throughput SD_MMC (4-Bit)**: 40 MHz 4-bit bus interface delivering continuous high-bitrate video streaming from high-speed MicroSD storage.
- **15 Dynamic Sci-Fi Telemetry HUDs**: Live vector telemetry overlays featuring anti-aliased cards, circular dials, targeting reticles, concentric rings, neon gauges, and status rails.
- **Multi-Threaded FreeRTOS Pipeline**: FreeRTOS tasks separate SD card streaming, JPEG hardware decoding, serial packet parsing, and HUD rendering across both RISC-V cores.
- **Orientation & Mode Control**: Real-time toggling between **Portrait (480×1920)** and **Landscape (1920×480)** orientations, with state preservation via EEPROM/Preferences.
- **1-Click Web Serial Flashing**: Pre-compiled all-in-one merged binaries that can be flashed straight to address \`0x00\` from the browser without installing PlatformIO or esptool.

---

## 🛠️ Hardware & Pinout Specifications

### Recommended Components
* **Microcontroller**: DFRobot FireBeetle 2 ESP32-P4 (Dual-core RISC-V @ 400 MHz with 32MB PSRAM)
* **Display Panel**: 8.8" 1920×480 / 480×1920 IPS bar display with 2-lane MIPI DSI interface
* **Storage**: MicroSD Card (UHS-I / Class 10 formatted in FAT32 or exFAT)
* **Input Control**: Pushbutton connected between **GPIO 32** and **GND** (internal pull-up)
* **Power Connection**: 5V / 2A via USB-C or external power header

### 📌 Pin Mapping Table

| Peripheral | Signal Name | ESP32-P4 GPIO | Description / Hardware Notes |
| :--- | :--- | :--- | :--- |
| **SD_MMC (4-bit)** | \`CLK\` | **GPIO 43** | SD Clock line (40 MHz) |
| **SD_MMC (4-bit)** | \`CMD\` | **GPIO 44** | Command / Response line |
| **SD_MMC (4-bit)** | \`D0\` | **GPIO 39** | Data 0 line |
| **SD_MMC (4-bit)** | \`D1\` | **GPIO 40** | Data 1 line |
| **SD_MMC (4-bit)** | \`D2\` | **GPIO 41** | Data 2 line |
| **SD_MMC (4-bit)** | \`D3\` | **GPIO 42** | Data 3 line |
| **MIPI DSI** | \`DSI_D0\` / \`DSI_D1\` | **Dedicated PHY** | Differential MIPI High-Speed data lanes |
| **MIPI DSI** | \`DSI_CLK\` | **Dedicated PHY** | Differential MIPI Clock lane |
| **Backlight I2C** | \`SDA\` / \`SCL\` | **GPIO 7 / GPIO 8** | I2C Backlight Driver control (0x45) |
| **Navigation Button** | \`BTN\` | **GPIO 32** | Short press: HUD style / Long press: Orientation |

---

## 📦 Firmware Suite Overview

### 01. Telemetry HUD Edition (\`v1.1.0\`)
* **Target Flash Address**: \`0x00\` (Full merged binary including bootloader, partition table, and application)
* **Features**: Combines background MJPEG video loop playback with dynamic PC hardware telemetry streaming over USB-C serial.
* **Telemetry Overlay**: 15 switchable Sci-Fi visual HUD styles with CPU Temp/Load, GPU Temp/Load, VRAM, RAM, and Fan RPM readouts.

### 02. Animation Player Edition (\`v1.0.0\`)
* **Target Flash Address**: \`0x00\`
* **Features**: Dedicated standalone media player focused exclusively on hardware-accelerated 24 FPS MJPEG playback from SD card with automatic loop detection and zero-latency frame pacing.

---

## 🎛️ MicroSD Card Preparation

1. Format your MicroSD card in **FAT32** (for cards up to 32GB) or **exFAT** (for 64GB+).
2. Create the following directory hierarchy on the root of the card:
   \`\`\`text
   /
   ├── Animations/
   │   ├── Horizontal/   <-- Place landscape 1920x480 .mjpeg clips here
   │   └── Vertical/     <-- Place portrait 480x1920 .mjpeg clips here
   └── telemetry.cfg     <-- Optional configuration overrides
   \`\`\`
3. Insert the card into the onboard MicroSD slot of the FireBeetle 2 ESP32-P4 before powering on.

---

## 🖥️ PC Hardware Telemetry Streaming Service

To stream real-time CPU, GPU, RAM, and FPS telemetry from your Windows PC to the display:

1. Clone the GitHub repository:
   \`\`\`bash
   git clone https://github.com/MukeshSankhla/ESP32_P4_DSI.git
   cd ESP32_P4_DSI/tools/pc_telemetry
   \`\`\`
2. Install the required Python dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
3. Run the telemetry streamer with Administrator privileges (required for LibreHardwareMonitor sensor access):
   \`\`\`bash
   python stream_telemetry.py --port COMx --baud 115200
   \`\`\`
4. The HUD on the ESP32-P4 display will automatically detect the telemetry stream and update in real time with 50ms latency!

---

## ⚡ Web Flashing Instructions

1. Connect your **FireBeetle 2 ESP32-P4** board to your computer using a reliable USB-C data cable.
2. Select your desired firmware version from the **Firmware Flashing Panel** on the right (e.g., *v1.1.0 Telemetry HUD Edition*).
3. Click the **Connect & Flash Device** button.
4. When the browser prompts for a serial port, select your ESP32-P4 device from the list and click **Connect**.
5. The flasher will automatically:
   - Synchronize with the ROM bootloader at 921600 baud.
   - Stream the pre-compiled binary from GitHub.
   - Program the ESP32-P4 flash memory at address \`0x00\` with MD5 checksum verification.
   - Execute an automatic hardware reboot to launch your new firmware!`;

export const PROJECTS_DATA: ProjectDetail[] = [];

export function getProjectById(id: string): ProjectDetail | undefined {
  return PROJECTS_DATA.find((p) => p.id.toLowerCase() === id.toLowerCase());
}
