import React, { createContext, useContext, useState } from 'react';

export interface ProjectLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export const DOSJE_PROJECTS: ProjectLocation[] = [
  { name: 'PM-DAKSH Skill Centre — Delhi', latitude: 28.6139, longitude: 77.2090 },
  { name: 'SC Boys Hostel — Jaipur', latitude: 26.9124, longitude: 75.7873 },
  { name: 'OBC Hostel — Lucknow', latitude: 26.8467, longitude: 80.9462 },
  { name: 'NGO Saksham — Pune', latitude: 18.5204, longitude: 73.8567 },
  { name: 'ABGY Training Centre — Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { name: 'PM-DAKSH Centre — Patna', latitude: 25.5941, longitude: 85.1376 },
  { name: 'SC Girls Hostel — Bhopal', latitude: 23.2599, longitude: 77.4126 },
  { name: 'NGO Koshish — Chennai', latitude: 13.0827, longitude: 80.2707 },
  { name: 'Skill Centre — Thiruvananthapuram', latitude: 8.5241, longitude: 76.9366 },
  { name: 'NGO Grantee — Ranchi', latitude: 23.3441, longitude: 85.3096 },
];

export type InspectionType = 'Scheduled' | 'Surprise' | 'AI-Random';

export function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export interface SurveyLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface SurveyContact {
  name: string;
  phoneNumber: string;
}

export interface Survey {
  id: string;
  projectName: string;
  siteName: string; // for backward compatibility
  beneficiariesPresent: string;
  clientName: string; // for backward compatibility
  description: string;
  inspectionType: InspectionType;
  priority: 'Low' | 'Medium' | 'High'; // for backward compatibility
  date: string; // ISO string
  photoUri: string | null;
  photoTimestamp: string | null;
  location: SurveyLocation | null;
  contact: SurveyContact | null;
  notes: string;
  createdAt: string; // ISO string
  anomaly: boolean;
  anomalyDistanceMeters: number;
}

export interface SurveyDraft {
  projectName: string;
  siteName?: string;
  beneficiariesPresent: string;
  clientName?: string;
  description: string;
  inspectionType: InspectionType;
  priority?: 'Low' | 'Medium' | 'High';
  date: Date;
  photoUri: string | null;
  photoTimestamp: string | null;
  location: SurveyLocation | null;
  contact: SurveyContact | null;
  notes: string;
}

interface SurveyContextType {
  surveys: Survey[];
  draft: SurveyDraft;
  editingId: string | null;
  updateDraft: (fields: Partial<SurveyDraft>) => void;
  clearDraft: () => void;
  submitDraft: () => { success: boolean; error?: string; id?: string };
  deleteSurvey: (id: string) => void;
  loadSurveyIntoDraft: (survey: Survey) => void;
}

const initialDraft: SurveyDraft = {
  projectName: '',
  siteName: '',
  beneficiariesPresent: '',
  clientName: '',
  description: '',
  inspectionType: 'Scheduled',
  priority: 'Medium',
  date: new Date(),
  photoUri: null,
  photoTimestamp: null,
  location: null,
  contact: null,
  notes: '',
};

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const SurveyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [draft, setDraft] = useState<SurveyDraft>(initialDraft);
  const [editingId, setEditingId] = useState<string | null>(null);

  const updateDraft = (fields: Partial<SurveyDraft>) => {
    setDraft((prev) => {
      const updated = { ...prev, ...fields };
      if (fields.projectName !== undefined) {
        updated.siteName = fields.projectName;
      }
      if (fields.beneficiariesPresent !== undefined) {
        updated.clientName = fields.beneficiariesPresent;
      }
      return updated;
    });
  };

  const clearDraft = () => {
    setDraft(initialDraft);
    setEditingId(null);
  };

  const submitDraft = (): { success: boolean; error?: string; id?: string } => {
    const projName = draft.projectName || draft.siteName || '';
    const benefPresent = draft.beneficiariesPresent || draft.clientName || '';

    // Validation
    if (!projName.trim()) {
      return { success: false, error: 'Project Name is required' };
    }
    if (!benefPresent.trim()) {
      return { success: false, error: 'Beneficiaries Present is required' };
    }
    if (!draft.description.trim()) {
      return { success: false, error: 'Description is required' };
    }

    // Step 4: Geo-anomaly detection using haversine formula
    const targetProject = DOSJE_PROJECTS.find((p) => p.name === projName);
    let isAnomaly = false;
    let distanceMeters = 0;

    if (targetProject && draft.location) {
      distanceMeters = calculateHaversineDistanceMeters(
        draft.location.latitude,
        draft.location.longitude,
        targetProject.latitude,
        targetProject.longitude
      );
      if (distanceMeters > 500) {
        isAnomaly = true;
      }
    } else if (!draft.location) {
      isAnomaly = true;
    }

    const targetId = editingId || `INSP-${Date.now()}`;
    const newSurvey: Survey = {
      id: targetId,
      projectName: projName,
      siteName: projName,
      beneficiariesPresent: benefPresent,
      clientName: benefPresent,
      description: draft.description,
      inspectionType: draft.inspectionType || 'Scheduled',
      priority: draft.priority || 'Medium',
      date: draft.date.toISOString(),
      photoUri: draft.photoUri,
      photoTimestamp: draft.photoTimestamp,
      location: draft.location,
      contact: draft.contact,
      notes: draft.notes,
      createdAt: new Date().toISOString(),
      anomaly: isAnomaly,
      anomalyDistanceMeters: distanceMeters,
    };

    if (editingId) {
      // Update existing
      setSurveys((prev) => prev.map((s) => (s.id === editingId ? newSurvey : s)));
    } else {
      // Add new
      setSurveys((prev) => [newSurvey, ...prev]);
    }

    clearDraft();
    return { success: true, id: targetId };
  };

  const deleteSurvey = (id: string) => {
    setSurveys((prev) => prev.filter((s) => s.id !== id));
  };

  const loadSurveyIntoDraft = (survey: Survey) => {
    setEditingId(survey.id);
    setDraft({
      projectName: survey.projectName || survey.siteName,
      siteName: survey.siteName || survey.projectName,
      beneficiariesPresent: survey.beneficiariesPresent || survey.clientName,
      clientName: survey.clientName || survey.beneficiariesPresent,
      description: survey.description,
      inspectionType: survey.inspectionType || 'Scheduled',
      priority: survey.priority || 'Medium',
      date: new Date(survey.date),
      photoUri: survey.photoUri,
      photoTimestamp: survey.photoTimestamp,
      location: survey.location,
      contact: survey.contact,
      notes: survey.notes,
    });
  };

  return (
    <SurveyContext.Provider
      value={{
        surveys,
        draft,
        editingId,
        updateDraft,
        clearDraft,
        submitDraft,
        deleteSurvey,
        loadSurveyIntoDraft,
      }}
    >
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurveys = () => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurveys must be used within a SurveyProvider');
  }
  return context;
};

