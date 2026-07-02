/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FileText, ExternalLink } from 'lucide-react';

const documents = [
  { name: 'Reserve Study', type: 'PDF', size: '2.4MB', date: 'May 2011', risk: 'Critical' },
  { name: 'CC&R Declaration', type: 'PDF', size: '15.1MB', date: 'Jan 2008', risk: 'Stable' },
  { name: 'Bylaws', type: 'PDF', size: '4.2MB', date: 'Jan 2008', risk: 'Review' },
  { name: 'House Rules', type: 'PDF', size: '1.1MB', date: 'Dec 2024', risk: 'Stable' },
];

const DocumentsTab = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
      {documents.map((doc) => (
        <div key={doc.name} className="bg-white p-5 rounded-xl border border-slate-200 flex items-center justify-between hover:border-purple-200 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-slate-800 font-bold text-sm">{doc.name}</h4>
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{doc.type} • {doc.size} • {doc.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled
              title="Coming soon"
              className="px-3 py-1.5 bg-slate-50 rounded-lg text-[10px] font-bold text-slate-300 flex items-center gap-1 cursor-not-allowed"
            >
              ✨ Summarize
            </button>
            <button className="p-2 text-slate-300 hover:text-slate-600">
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DocumentsTab;
