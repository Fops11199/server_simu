import React from 'react';
import { AlertTriangle, Globe } from 'lucide-react';

export const DnsError = ({ domain }: { domain: string }) => (
  <div className="w-full h-full bg-white flex flex-col items-center justify-center text-[#202124] font-sans">
    <div className="max-w-[600px] w-full px-8 flex flex-col gap-6">
      <Globe className="w-12 h-12 text-[#5f6368]" strokeWidth={1.5} />
      <div>
        <h1 className="text-2xl font-normal mb-2">This site can’t be reached</h1>
        <p className="text-[#5f6368] text-base leading-relaxed">
          Check if there is a typo in <strong>{domain}</strong>.<br />
          If spelling is correct, try running Windows Network Diagnostics.
        </p>
      </div>
      <div className="text-[13px] text-[#5f6368] font-mono mt-4">
        DNS_PROBE_FINISHED_NXDOMAIN
      </div>
      <button className="bg-[#1a73e8] text-white px-4 py-2 rounded self-start mt-2 hover:bg-[#1557b0] transition-colors font-medium text-sm">
        Reload
      </button>
    </div>
  </div>
);

export const ConnectionRefusedError = ({ domain }: { domain: string }) => (
  <div className="w-full h-full bg-white flex flex-col items-center justify-center text-[#202124] font-sans">
    <div className="max-w-[600px] w-full px-8 flex flex-col gap-6">
      <Globe className="w-12 h-12 text-[#5f6368]" strokeWidth={1.5} />
      <div>
        <h1 className="text-2xl font-normal mb-2">This site can’t be reached</h1>
        <p className="text-[#5f6368] text-base leading-relaxed">
          <strong>{domain}</strong> refused to connect.
        </p>
        <ul className="list-disc pl-5 mt-4 text-[#5f6368] text-sm space-y-1">
          <li>Check the connection</li>
          <li>Check the proxy and the firewall</li>
        </ul>
      </div>
      <div className="text-[13px] text-[#5f6368] font-mono mt-4">
        ERR_CONNECTION_REFUSED
      </div>
    </div>
  </div>
);

export const NginxError = ({ code, message }: { code: number, message: string }) => (
  <div className="w-full h-full bg-white flex flex-col items-center justify-center text-black font-sans">
    <div className="text-center">
      <h1 className="text-[32px] font-bold m-0">{code} {message}</h1>
      <hr className="my-4 border-t border-gray-300 w-[400px] mx-auto" />
      <p className="text-sm">nginx/1.18.0 (Ubuntu)</p>
    </div>
  </div>
);
