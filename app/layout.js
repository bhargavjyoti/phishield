import "./globals.css";
import { UserProfileProvider } from "./context/UserProfileContext";
import { ScanHistoryProvider } from "./context/ScanHistoryContext";

export const metadata = {
  title: "PhiShield - Next Gen Phishing Defense",
  description: "Advanced AI-powered threat analysis.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen relative selection:bg-tactical-orange/30 selection:text-tactical-orange">
        {/* Ambient Background */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-void">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-tactical-orange/10 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-tactical-red/5 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,115,22,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20"></div>
        </div>
        <UserProfileProvider>
          <ScanHistoryProvider>
            {children}
          </ScanHistoryProvider>
        </UserProfileProvider>
      </body>
    </html>
  );
}
