import { useState } from "react";
import { FileText, ExternalLink, X, Brain, ImageIcon } from "lucide-react";
import { usePreviewSrc } from "@/hooks/usePreviewSrc";

const BRONWYN_INFOGRAPHICS = [
  {
    id: "parent_family_training",
    title: "Parent & Family Training Infographic",
    subtitle: "For parents & family members",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/78eafa7b4_Bronwyn-ParentFamilyTrainingInfographic.pdf",
    color: "bg-pink-100 text-pink-700",
  },
  {
    id: "support_worker_training",
    title: "Support Worker Training Infographic",
    subtitle: "For support workers",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/b3a3340fe_Bronwyn-SupportWorkerTrainingInfographic.pdf",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "sw_quick_ref_v1",
    title: "Support Worker Quick Reference",
    subtitle: "Behaviour Support Training — Version 1",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/186f0ab4f_BronwynBehaviourSupportTraining-SupportWorkerQuickReference.pdf",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    id: "sw_quick_ref_v2",
    title: "Support Worker Quick Reference v2",
    subtitle: "Behaviour Support Training — Version 2",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/a0e512a09_BronwynBehaviourSupportTraining-SupportWorkerQuickReferenceVersion2.pdf",
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: "guide_parents",
    title: "Understanding Bronwyn's Behavior — Guide for Parents",
    subtitle: "Plain-language guide for parents",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/fbed382c6_UnderstandingBronwynsBehavior-AGuideforParents.pdf",
    color: "bg-rose-100 text-rose-700",
  },
  {
    id: "practical_guide_family_v1",
    title: "Practical Guide for Family",
    subtitle: "Understanding Bronwyn's Behaviour — Version 1",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/4e00d3f01_UnderstandingBronwynsBehaviour-APracticalGuideforFamily.pdf",
    color: "bg-orange-100 text-orange-700",
  },
  {
    id: "practical_guide_family_v2",
    title: "Practical Guide for Family v2",
    subtitle: "Understanding Bronwyn's Behaviour — Version 2",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/243a7a549_UnderstandingBronwynsBehaviour-APracticalGuideforFamilyVersion2.pdf",
    color: "bg-amber-100 text-amber-700",
  },
];

const PBS_REFERENCE_DOCS = [
  {
    id: "pbs_framework",
    title: "PBS Framework Training Reference",
    subtitle: "Bronwyn Chau — Staff Training Guide",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/4e5241cd0_PBS_Framework_Training_Reference_Bronwyn_Chau.html",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: "comprehensive_response",
    title: "Comprehensive Behaviour Response Plan",
    subtitle: "Bronwyn Chau — Full Response Framework",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/976e0ed40_Bronwyn_Chau_Comprehensive_Behaviour_Response_Plan.html",
    color: "bg-purple-100 text-purple-700",
  },
  {
    id: "form_tracker",
    title: "Behavioral Support Plan & Form Tracker",
    subtitle: "Interactive Tracking Tool",
    url: "https://media.base44.com/files/public/69d54775d9a169daad84a133/0db421095_BehavioralSupportPlanFormTracker.html",
    color: "bg-teal-100 text-teal-700",
  },
];

export default function PBSReferenceDocs() {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const { src: iframeSrc } = usePreviewSrc(previewUrl);

  const openPreview = (doc) => {
    setPreviewUrl(doc.url);
    setPreviewTitle(doc.title);
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewTitle("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Brain size={18} className="text-purple-600" />
        <h3 className="font-black text-slate-900 text-lg">Behaviour Support Reference Documents</h3>
      </div>
      <p className="text-sm text-slate-500 -mt-2">
        Click any document to preview it inline, or open it in a new tab.
      </p>

      {/* Bronwyn Infographics */}
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon size={16} className="text-pink-500" />
          <h4 className="font-black text-slate-800 text-sm">Training Infographics — Bronwyn</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {BRONWYN_INFOGRAPHICS.map((doc) => (
            <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-shadow flex flex-col">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${doc.color}`}>
                <ImageIcon size={16} />
              </div>
              <h4 className="font-black text-slate-900 text-xs leading-tight mb-1">{doc.title}</h4>
              <p className="text-[11px] text-slate-500 mb-3 flex-1">{doc.subtitle}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => openPreview(doc)}
                  className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition"
                >
                  Preview
                </button>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 bg-slate-100 text-slate-600 text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-200 transition"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-purple-600" />
          <h4 className="font-black text-slate-800 text-sm">Interactive Reference Documents</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PBS_REFERENCE_DOCS.map((doc) => (
          <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${doc.color}`}>
              <FileText size={18} />
            </div>
            <h4 className="font-black text-slate-900 text-sm leading-tight mb-1">{doc.title}</h4>
            <p className="text-xs text-slate-500 mb-4">{doc.subtitle}</p>
            <div className="flex gap-2">
              <button
                onClick={() => openPreview(doc)}
                className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary/90 transition"
              >
                Preview
              </button>
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 bg-slate-100 text-slate-600 text-xs font-bold py-2 px-3 rounded-lg hover:bg-slate-200 transition"
              >
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {previewUrl && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 shrink-0">
              <h3 className="font-black text-slate-900 text-sm truncate">{previewTitle}</h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  <ExternalLink size={13} /> Open
                </a>
                <button onClick={closePreview} className="text-slate-400 hover:text-slate-700 p-1">
                  <X size={18} />
                </button>
              </div>
            </div>
            <iframe
              src={iframeSrc}
              title={previewTitle}
              className="flex-1 w-full rounded-b-2xl"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
        </div>
      )}
    </div>
  );
}