import { useState } from "react";
import { Navigation, Users, Home, ExternalLink, X, Loader2, FolderOpen } from "lucide-react";
import { usePreviewSrc } from "@/hooks/usePreviewSrc";

const PROGRAM_SECTIONS = [
  {
    id: "travel",
    label: "Travel",
    icon: Navigation,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    description: "Travel training and transport support program documents",
    docs: [
      { label: "Travel Risk Assessment", description: "Comprehensive travel risk assessment", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/bdd4b5947_Travel_Risk_Assessment.html" },
      { label: "Travel Training Program", description: "Full travel training program overview", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/eb3df9e6a_Travel_Training_Program.html" },
      { label: "Mon & Wed — Rainbow St → Royal Randwick", description: "Outbound trip guide (9am)", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/fb8c77415_MondayandWednesdayTrip1242RainbowStCoogeeSth-RoyalRandwick9am.html" },
      { label: "Mon & Wed — Royal Randwick → Rainbow St", description: "Return trip guide", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/3fe072ccc_MondayandWednesdayTrip2RoyalRandwickShoppingCentre-242RainbowStreetSothCoogee.html" },
      { label: "Tue & Thu — Rainbow St → Lord St Botany", description: "Outbound trip guide", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/bd47208ec_TuesdaysandThursdaysTrip1242RainbowSt-11-13LordStBotany.html" },
      { label: "Tue & Thu — Lord St Botany → Rainbow St", description: "Return trip guide", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/4ce78b890_TuesdaysandThursdaysTrip21113LordStBotanyto242RainbowStSouthCoogee.html" },
      { label: "Saturday — Rainbow St → Westfield Bondi Junction", description: "Outbound trip guide", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/6a472c551_Saturday_Trip_242_Rainbow_St_to_Westfield_Bondi_Junction.html" },
      { label: "Saturday — Westfield Bondi Junction → Rainbow St", description: "Return trip guide", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/b37bdc084_Saturday_Return_Trip_Westfield_Bondi_Junction_to_242_Rainbow_St.html" },
      { label: "Sunday — Rainbow St → Coles Randwick", description: "Outbound trip guide", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/3f57e8f74_SundayTrip1Rainbow_to_Coles_Randwick.html" },
      { label: "Sunday — Coles Randwick → Rainbow St", description: "Return trip guide", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/9d590f14e_SundayTrip_2_Coles_to_Rainbow.html" },
    ],
  },
  {
    id: "community",
    label: "Community Program",
    icon: Users,
    color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    description: "Community access and participation program documents",
    docs: [
      { label: "30-Week Essential Practical Life Skills Workbook", description: "Interactive community program workbook", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/8c68a04ed_30_Week_Interactive_CommunityProgram.html" },
    ],
  },
  {
    id: "domestic",
    label: "Domestic Skills",
    icon: Home,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    description: "Daily living and domestic skills program documents",
    docs: [
      { label: "Saturday Domestic Skills Shift Notes", description: "Weekly shift notes workbook for Saturday domestic skills sessions", url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/eae5f78cc_SaturdayDomesticSkillsShiftNotes.html" },
    ],
  },
];

export default function Programs() {
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const { src: previewSrc, loading: srcLoading } = usePreviewSrc(previewDoc?.url);

  const openPreview = (doc) => {
    setPreviewDoc(doc);
    setPreviewLoading(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary rounded-2xl p-6 text-white">
        <h2 className="text-xl font-black mb-1">Programs</h2>
        <p className="text-primary-foreground/80 text-sm">
          Your program documents — travel, community, and domestic skills programs.
        </p>
      </div>

      {PROGRAM_SECTIONS.map(section => {
        const Icon = section.icon;
        return (
          <div key={section.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${section.color}`}>
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-black text-slate-900">{section.label}</h3>
                <p className="text-xs text-slate-500">{section.description}</p>
              </div>
            </div>
            <div className="p-5">
              {section.docs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FolderOpen size={32} className="text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-400">No documents yet</p>
                  <p className="text-xs text-slate-400 mt-0.5">Documents will be added to this section.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {section.docs.map(doc => (
                    <div key={doc.url} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-sm text-slate-900 leading-tight">{doc.label}</p>
                          {doc.description && <p className="text-[11px] text-slate-500 mt-0.5">{doc.description}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openPreview(doc)}
                          className="flex-1 text-center bg-primary text-white hover:bg-primary/90 rounded-lg py-2 text-xs font-bold transition-colors"
                        >
                          Preview
                        </button>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg py-2 px-3 text-xs font-bold transition-colors"
                        >
                          Open <ExternalLink size={11} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
              <p className="font-black text-sm text-slate-900 truncate">{previewDoc.label}</p>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewDoc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  Open Full <ExternalLink size={12} />
                </a>
                <button onClick={() => { setPreviewDoc(null); setPreviewLoading(false); }} className="text-slate-400 hover:text-slate-700 p-1">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 relative bg-slate-50">
              {(previewLoading || srcLoading) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={28} className="animate-spin text-primary" />
                </div>
              )}
              <iframe
                src={previewSrc}
                className="w-full h-full border-0"
                onLoad={() => setPreviewLoading(false)}
                title={previewDoc.label}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}