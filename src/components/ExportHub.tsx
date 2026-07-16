import React, { useState, useEffect, useRef } from 'react';
import { 
  Smartphone, 
  Laptop, 
  Terminal, 
  Download, 
  RefreshCw, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  FileCode, 
  Code,
  ShieldCheck,
  Package,
  Layers,
  Check,
  Copy
} from 'lucide-react';

interface ExportHubProps {
  channelName: string;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

interface LogLine {
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'system';
  timestamp: string;
}

export default function ExportHub({ channelName, addToast }: ExportHubProps) {
  const [activePlatform, setActivePlatform] = useState<'android' | 'electron' | 'ios'>('android');
  
  // Compiler State
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileLogs, setCompileLogs] = useState<LogLine[]>([]);
  const [buildComplete, setBuildComplete] = useState(false);
  const [buildArtifact, setBuildArtifact] = useState<{ name: string; size: string; hash: string } | null>(null);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Copy states
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Auto-scroll mock terminal to bottom
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [compileLogs]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    addToast(`${label} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedText(null), 2000);
  };

  const getPlatformLabel = () => {
    switch (activePlatform) {
      case 'android': return 'Android APK (.apk)';
      case 'ios': return 'iOS Bundle (.ipa)';
      case 'electron': return 'Desktop App (.exe / .dmg / .AppImage)';
    }
  };

  const addLog = (text: string, type: 'info' | 'success' | 'warning' | 'error' | 'system' = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setCompileLogs(prev => [...prev, { text, type, timestamp: time }]);
  };

  const handleSimulateBuild = () => {
    if (isCompiling) return;
    
    setIsCompiling(true);
    setBuildComplete(false);
    setCompileProgress(0);
    setCompileLogs([]);
    setBuildArtifact(null);

    addLog(`INITIALIZING MOCK CROSS-PLATFORM COMPILER FOR: ${getPlatformLabel()}`, 'system');
    addLog(`Running target environment scan...`, 'info');

    // Staggered logs for nice high-fidelity terminal simulator
    const steps = [
      {
        delay: 800,
        log: 'Checking package.json structure and configuration hooks...',
        type: 'info' as const,
        progress: 10
      },
      {
        delay: 1600,
        log: 'Packaging production single-page assets using Vite optimized tree-shaking...',
        type: 'info' as const,
        progress: 25
      },
      {
        delay: 2400,
        log: 'Vite build completed. Created 14 javascript chunks, 2 stylesheets, 28 media models.',
        type: 'success' as const,
        progress: 40
      },
      {
        delay: 3200,
        log: activePlatform === 'electron'
          ? 'Bootstrapping Electron wrapper process. Binding local file-loader handlers...'
          : 'Initializing Capacitor native bridge containers. Generating AndroidManifest assets...',
        type: 'info' as const,
        progress: 55
      },
      {
        delay: 4000,
        log: activePlatform === 'electron'
          ? 'Compressing main process and preloads. Setting up Chrome Sandbox flags...'
          : 'Assembling Java classes. Invoking gradle build tool inside Android SDK...',
        type: 'info' as const,
        progress: 70
      },
      {
        delay: 4800,
        log: activePlatform === 'electron'
          ? 'Linking native window controllers. Injecting CastPilot dark window icons.'
          : 'Verifying package signatures. Creating debug key signatures...',
        type: 'info' as const,
        progress: 85
      },
      {
        delay: 5600,
        log: 'Linking native camera permissions, audio overlays, and telemetry sandboxes...',
        type: 'info' as const,
        progress: 95
      },
      {
        delay: 6400,
        log: 'Success! Package compiled, optimized, and signed.',
        type: 'success' as const,
        progress: 100
      }
    ];

    steps.forEach(step => {
      setTimeout(() => {
        addLog(step.log, step.type);
        setCompileProgress(step.progress);
        
        if (step.progress === 100) {
          setIsCompiling(false);
          setBuildComplete(true);
          const randHash = Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('');
          const randSize = activePlatform === 'electron' ? '72.4 MB' : '28.1 MB';
          const fileExtension = activePlatform === 'android' ? 'apk' : activePlatform === 'ios' ? 'ipa' : 'exe';
          const randName = `castpilot-live-v1.0.${fileExtension}`;

          setBuildArtifact({
            name: randName,
            size: randSize,
            hash: `SHA-256: ${randHash.toUpperCase()}`
          });
          addToast(`Native ${getPlatformLabel()} wrapper compiled successfully!`, 'success');
        }
      }, step.delay);
    });
  };

  // Files to display code snippets
  const packageJsonAdditions = `{
  "scripts": {
    "dev:electron": "electron .",
    "build:electron": "electron-builder build --dir",
    "capacitor:init": "cap init \\"CastPilot Live\\" \\"com.castpilot.studio\\"",
    "capacitor:sync": "cap sync android"
  },
  "devDependencies": {
    "electron": "^30.0.0",
    "electron-builder": "^24.13.0"
  },
  "dependencies": {
    "@capacitor/core": "^6.0.0",
    "@capacitor/cli": "^6.0.0",
    "@capacitor/android": "^6.0.0"
  }
}`;

  const localInstallCommand = `npm install -D electron electron-builder @capacitor/core @capacitor/cli @capacitor/android`;

  const androidBuildSteps = `# Build and sync steps to get your APK file:
# 1. Compile the production web assets
npm run build

# 2. Add the Android platform structure
npx cap add android

# 3. Synchronize your built React code to Android directories
npx cap sync android

# 4. Open the project inside Android Studio
npx cap open android

# 5. In Android Studio, click "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"
# That's it! Your physical APK will be generated inside:
# android/app/build/outputs/apk/debug/app-debug.apk`;

  const electronBuildSteps = `# Build your Desktop application locally:
# 1. Run your React code inside the Electron shell in dev mode
npx electron .

# 2. Package your desktop app for Windows/Mac/Linux
npx electron-builder build`;

  return (
    <div className="space-y-6" id="native-packaging-hub">
      
      {/* Intro Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-sky-400 font-semibold uppercase">Multi-Platform Suite</span>
          </div>
          <h2 className="text-lg font-bold font-display text-white tracking-tight flex items-center gap-2">
            <Package className="h-5 w-5 text-sky-400" />
            Native Apps & Desktop Packaging Hub
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Turn your CastPilot broadcasting dashboard into a high-performance, native APK for mobile content creators or a desktop application for linear producers.
          </p>
        </div>

        <div className="text-xs bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-3 py-1.5 font-semibold text-center">
          📱 Fully compatible with **Capacitor** & **Electron**
        </div>
      </div>

      {/* Main Grid: Platforms & Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left hand: Interactive Simulator Terminal (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Packaging Simulator Console */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Terminal Header */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="text-xs text-slate-300 font-mono font-bold">CastPilot Live Cloud Packager Terminal v1.0.4</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            {/* Target Select Area */}
            <div className="bg-slate-950 border-b border-slate-900 p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold font-sans">Packaging Target:</span>
                <div className="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
                  <button
                    onClick={() => { if(!isCompiling) setActivePlatform('android'); }}
                    disabled={isCompiling}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${
                      activePlatform === 'android' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Android APK
                  </button>
                  <button
                    onClick={() => { if(!isCompiling) setActivePlatform('electron'); }}
                    disabled={isCompiling}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${
                      activePlatform === 'electron' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Electron Desktop
                  </button>
                  <button
                    onClick={() => { if(!isCompiling) setActivePlatform('ios'); }}
                    disabled={isCompiling}
                    className={`px-3 py-1 text-[11px] font-bold rounded-md transition ${
                      activePlatform === 'ios' ? 'bg-sky-500 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    iOS Bundle
                  </button>
                </div>
              </div>

              <button
                onClick={handleSimulateBuild}
                disabled={isCompiling}
                className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black rounded-lg transition-all flex items-center gap-1.5 shadow-md disabled:opacity-40"
              >
                {isCompiling ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-slate-950" />}
                Trigger Compiler Run
              </button>
            </div>

            {/* Console Screen */}
            <div className="bg-black p-4 h-[320px] overflow-y-auto font-mono text-xs text-slate-300 space-y-2 select-text no-scrollbar border-b border-slate-900">
              {compileLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 space-y-2">
                  <Terminal className="h-10 w-10 text-slate-800" />
                  <p className="max-w-md text-xs leading-normal">
                    Select a packaging target platform above and click <strong className="text-emerald-400">Trigger Compiler Run</strong> to simulate standard package compilation logs in real-time.
                  </p>
                </div>
              ) : (
                <>
                  {compileLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                      <span className={`break-all ${
                        log.type === 'success' ? 'text-emerald-400 font-bold' :
                        log.type === 'warning' ? 'text-amber-400 font-bold' :
                        log.type === 'error' ? 'text-rose-400 font-bold' :
                        log.type === 'system' ? 'text-sky-400 font-extrabold tracking-wide' :
                        'text-slate-300'
                      }`}>
                        {log.type === 'system' ? `>>> ${log.text} <<<` : log.text}
                      </span>
                    </div>
                  ))}
                  {isCompiling && (
                    <div className="flex items-center gap-1.5 text-emerald-400 animate-pulse font-bold mt-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Compiling assets ({compileProgress}%)...
                    </div>
                  )}
                  <div ref={consoleEndRef} />
                </>
              )}
            </div>

            {/* Build Success Alert Box */}
            {buildComplete && buildArtifact && (
              <div className="p-4 bg-emerald-950/20 border-t border-emerald-900/40 flex items-start gap-3.5 animate-fadeIn">
                <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-white uppercase">Containerization Success</h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                    Your simulated <strong className="text-white">{getPlatformLabel()}</strong> file has been initialized. Download configuration templates below to package the application on your computer.
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-4 bg-slate-900/50 rounded-lg p-2.5 border border-slate-800 font-mono text-[10px]">
                    <div>
                      <span className="text-slate-500 block uppercase font-bold">Binary File</span>
                      <span className="text-slate-200 font-bold break-all">{buildArtifact.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold">Package Size</span>
                      <span className="text-slate-200 font-bold">{buildArtifact.size}</span>
                    </div>
                    <div className="col-span-2 border-t border-slate-800 pt-1.5 mt-1.5">
                      <span className="text-slate-500 block uppercase font-bold">Digital Signature</span>
                      <span className="text-slate-300 break-all">{buildArtifact.hash}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        // Generate dynamic receipt instruction report txt file
                        const content = `CASTPILOT NATIVE PACKAGING RECEIPT & REFERENCE\n==========================================\n\nPlatform: ${getPlatformLabel()}\nTimestamp: ${new Date().toISOString()}\nFile: ${buildArtifact.name}\nSize: ${buildArtifact.size}\nHash: ${buildArtifact.hash}\n\nHOW TO COMPILE THIS NATIVELY:\n--------------------------\n1. Download this project ZIP from the AI Studio Settings menu.\n2. Open your terminal at the project root.\n3. Run: npm install\n4. For Android (APK):\n   - Run: npm install -D @capacitor/core @capacitor/cli @capacitor/android\n   - Run: npx cap init "CastPilot" "com.castpilot.studio" --web-dir=dist\n   - Run: npm run build\n   - Run: npx cap add android\n   - Run: npx cap sync\n   - Run: npx cap open android (Opens in Android Studio where you can click Build APK)\n\n5. For Desktop App (Electron):\n   - Run: npm install -D electron electron-builder\n   - Run: npx electron .\n\nThank you for choosing CastPilot Linear FAST Scheduler!`;
                        const blob = new Blob([content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `castpilot-build-instructions-${activePlatform}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                        addToast("Instructions receipt downloaded!", "success");
                      }}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded flex items-center gap-1 shadow-md"
                    >
                      <Download className="h-3 w-3" />
                      Download Build Guide PDF/TXT
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Right hand: Setup Instructions & Boilerplate Configs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick command summary */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Code className="h-4 w-4 text-sky-400" />
              Local Developer Environment Setup
            </h3>
            
            <p className="text-[11px] text-slate-400 leading-normal">
              To convert this linear playout system into local desktop/mobile code, run this installation command on your local computer first.
            </p>

            <div className="bg-slate-900 border border-slate-850 rounded-lg p-3 relative font-mono text-xs text-slate-200">
              <button
                onClick={() => handleCopy(localInstallCommand, 'Install commands')}
                className="absolute top-2.5 right-2.5 p-1 bg-slate-950/80 hover:bg-slate-950 rounded text-slate-400 hover:text-white transition"
                title="Copy Code"
              >
                {copiedText === 'Install commands' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <code className="block pr-6 break-words whitespace-pre-wrap">{localInstallCommand}</code>
            </div>
          </div>

          {/* Tab Specific instructions card */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-lg space-y-3.5">
            
            <div className="flex items-center gap-2">
              {activePlatform === 'android' ? (
                <Smartphone className="h-5 w-5 text-emerald-400" />
              ) : activePlatform === 'ios' ? (
                <Smartphone className="h-5 w-5 text-indigo-400" />
              ) : (
                <Laptop className="h-5 w-5 text-sky-400" />
              )}
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                {activePlatform === 'android' ? 'Step-By-Step Android APK Guide' : activePlatform === 'ios' ? 'Step-By-Step iOS Apple Guide' : 'Step-By-Step Desktop App Guide'}
              </h3>
            </div>

            <p className="text-[11px] text-slate-400 leading-normal">
              {activePlatform === 'android' 
                ? 'Using Ionic Capacitor, you can wraps this app inside an Android Gradle package file, granting access to local cameras, orientation locks, and storage.' 
                : activePlatform === 'ios'
                ? 'Compile for iPhone/iPad using Capacitor and CocoaPods inside Mac Xcode environment.'
                : 'Using Electron, run this Linear playout console directly as a double-clickable Desktop client on Windows or macOS.'}
            </p>

            {/* Instruction block */}
            <div className="bg-slate-900 border border-slate-850 rounded-lg p-3 relative font-mono text-[11px] text-slate-300 max-h-[220px] overflow-y-auto no-scrollbar select-text">
              <button
                onClick={() => handleCopy(
                  activePlatform === 'android' ? androidBuildSteps : activePlatform === 'ios' ? 'cap add ios && cap open ios' : electronBuildSteps,
                  'Build guide steps'
                )}
                className="absolute top-2.5 right-2.5 p-1 bg-slate-950/80 hover:bg-slate-950 rounded text-slate-400 hover:text-white transition"
              >
                {copiedText === 'Build guide steps' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <pre className="whitespace-pre-wrap pr-6">
                {activePlatform === 'android' ? androidBuildSteps : activePlatform === 'ios' ? `# Steps to build iOS Bundle (.ipa):
# 1. Compile web assets
npm run build

# 2. Add ios wrapper platform
npx cap add ios

# 3. Synchronize assets
npx cap sync ios

# 4. Open in native Apple Xcode on a macOS computer
npx cap open ios

# 5. In Xcode, click Product > Archive to generate the native App Bundle!` : electronBuildSteps}
              </pre>
            </div>

            {/* Config boilerplates */}
            <div>
              <span className="text-[10px] text-slate-500 font-mono block mb-1">Required package.json Additions:</span>
              <div className="bg-slate-900 border border-slate-850 rounded-lg p-3 relative font-mono text-[10px] text-slate-400 max-h-[160px] overflow-y-auto no-scrollbar select-text">
                <button
                  onClick={() => handleCopy(packageJsonAdditions, 'package.json config')}
                  className="absolute top-2.5 right-2.5 p-1 bg-slate-950/80 hover:bg-slate-950 rounded text-slate-400 hover:text-white transition"
                >
                  {copiedText === 'package.json config' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
                <pre className="whitespace-pre-wrap">{packageJsonAdditions}</pre>
              </div>
            </div>

          </div>

          {/* Quick tips */}
          <div className="rounded-xl border border-slate-900 bg-slate-950/40 p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-[11px] font-bold text-slate-300">Fast Creator Advantage</h5>
              <p className="text-[10px] text-slate-400 leading-normal">
                By compiling to an APK or Electron shell, your app runs fully offline with zero internet dependencies. It utilizes GPU hardware acceleration for rendering playout stream animations smoothly!
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
