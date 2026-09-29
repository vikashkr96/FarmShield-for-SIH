import { createClient } from '../supabase/client';
import { LabResult } from '../../types/database';

const SEED_LAB_RESULTS: LabResult[] = [
  {
    id: 'lab-001',
    animal_id: 'anim-001',
    test_type: 'LC-MS/MS Multi-Residue Screen',
    sample_type: 'Bulk Raw Milk',
    collected_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    tested_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    result_value: '42.8 ug/kg',
    unit: 'ug/kg (ppb)',
    mrl_limit: '100 ug/kg',
    is_compliant: true,
    lab_name: 'NABL Acc. Central Veterinary Analytical Lab',
    certificate_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&q=80',
    remarks: 'Compliant with FSSAI MRL standards for Amoxicillin',
    created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lab-002',
    animal_id: 'anim-002',
    test_type: 'Flow Cytometric Somatic Cell Count',
    sample_type: 'Composite Herd Milk',
    collected_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    tested_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    result_value: '185,000 cells/ml',
    unit: 'cells/ml',
    mrl_limit: '< 300,000 cells/ml',
    is_compliant: true,
    lab_name: 'State Dairy Quality Assurance Laboratory',
    remarks: 'Udder health excellent, subclinical mastitis negative',
    created_at: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'lab-003',
    animal_id: 'anim-004',
    test_type: 'Enrofloxacin & Ciprofloxacin Residue Assay',
    sample_type: 'Muscle Tissue Biopsy',
    collected_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    tested_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    result_value: '12.4 ug/kg',
    unit: 'ug/kg (ppb)',
    mrl_limit: '100 ug/kg',
    is_compliant: true,
    lab_name: 'Regional Disease Diagnostic Laboratory (RDDL)',
    remarks: 'Post-withdrawal carcass tissue residue cleared',
    created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
  },
];

export class LabRepository {
  private static localResults: LabResult[] = [...SEED_LAB_RESULTS];

  static async getLabResults(animalId?: string): Promise<LabResult[]> {
    const supabase = createClient();
    try {
      let query = supabase
        .from('lab_results')
        .select('*, animal:animals(*)')
        .order('tested_at', { ascending: false });

      if (animalId) {
        query = query.eq('animal_id', animalId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data as LabResult[];
      }
    } catch {}

    return animalId
      ? this.localResults.filter((r) => r.animal_id === animalId)
      : this.localResults;
  }

  static async createLabResult(result: Partial<LabResult>): Promise<LabResult> {
    const supabase = createClient();
    const newResult: LabResult = {
      id: result.id || `lab-${Date.now()}`,
      animal_id: result.animal_id || 'anim-001',
      test_type: result.test_type || 'LC-MS/MS Residue Screen',
      sample_type: result.sample_type || 'Bulk Milk',
      collected_at: result.collected_at || new Date().toISOString(),
      tested_at: result.tested_at || new Date().toISOString(),
      result_value: result.result_value || '0.00 ug/kg',
      unit: result.unit || 'ug/kg',
      mrl_limit: result.mrl_limit || '100 ug/kg',
      is_compliant: result.is_compliant !== undefined ? result.is_compliant : true,
      lab_name: result.lab_name || 'NABL Accredited Regional Laboratory',
      certificate_url: result.certificate_url,
      remarks: result.remarks,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('lab_results').insert(newResult);
    } catch {}

    this.localResults.unshift(newResult);
    return newResult;
  }
}
