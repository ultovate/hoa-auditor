import { supabase } from './supabase.js'

// Generate a unique audit ID
function generateAuditId() {
  return 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

// Upload a single PDF file to Supabase Storage
export async function uploadFile(file, userId, auditId) {
  const filePath = `${userId}/${auditId}/original/${file.name}`
  
  const { data, error } = await supabase.storage
    .from('hoa_documents')
    .upload(filePath, file, { upsert: true })

  if (error) throw error
  return data
}

// Upload multiple files (PDFs or ZIP)
export async function uploadFiles(files, userId) {
  const auditId = generateAuditId()
  const results = []

  for (const file of files) {
    const result = await uploadFile(file, userId, auditId)
    results.push({ name: file.name, path: result.path })
  }

  return { auditId, files: results }
}

// List files for a specific audit
export async function listFiles(userId, auditId) {
  const { data, error } = await supabase.storage
    .from('hoa_documents')
    .list(`${userId}/${auditId}/original`)

  if (error) throw error
  return data
}