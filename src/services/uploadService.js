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
export async function uploadFiles(files, userId, auditId = null) {
  const finalAuditId = auditId || generateAuditId()
  const results = []

  for (const file of files) {
    const result = await uploadFile(file, userId, finalAuditId)
    results.push({ name: file.name, path: result.path })
  }

  return { auditId: finalAuditId, files: results }
}

// List files for a specific audit
export async function listFiles(userId, auditId) {
  const { data, error } = await supabase.storage
    .from('hoa_documents')
    .list(`${userId}/${auditId}/original`)

  if (error) throw error
  return data
}
// Create an audit record in the database
export async function createAuditRecord(userId, auditId, propertyName, fileCount) {
  const { data, error } = await supabase
    .from('audits')
    .insert({
      user_id: userId,
      audit_id: auditId,
      property_name: propertyName,
      file_count: fileCount,
      status: 'uploaded'
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Update audit status
export async function updateAuditStatus(auditId, status) {
  const { error } = await supabase
    .from('audits')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('audit_id', auditId)

  if (error) throw error
}
// Get all audits for a user
export async function getUserAudits(userId) {
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// Check if file already exists in an audit
export async function checkFileExists(userId, auditId, fileName) {
  const { data, error } = await supabase.storage
    .from('hoa_documents')
    .list(`${userId}/${auditId}/original`)

  if (error) throw error
  return data?.some(f => f.name === fileName) ?? false
}
// Delete a specific file from an audit
export async function deleteFile(userId, auditId, fileName) {
  const filePath = `${userId}/${auditId}/original/${fileName}`
  
  const { error } = await supabase.storage
    .from('hoa_documents')
    .remove([filePath])

  if (error) throw error
}

// Get list of uploaded files for an audit
export async function getAuditFiles(userId, auditId) {
  const { data, error } = await supabase.storage
    .from('hoa_documents')
    .list(`${userId}/${auditId}/original`)

  if (error) throw error
  return data || []
}
// Delete an entire audit and all its files
export async function deleteAudit(userId, auditId) {
  const folders = ['original', 'converted', 'analysis']
  
  for (const folder of folders) {
    try {
      const { data: files } = await supabase.storage
        .from('hoa_documents')
        .list(`${userId}/${auditId}/${folder}`)
      
      if (files && files.length > 0) {
        const paths = files.map(f => `${userId}/${auditId}/${folder}/${f.name}`)
        await supabase.storage.from('hoa_documents').remove(paths)
      }
    } catch (e) {
      // folder doesn't exist, skip
    }
  }

  const { error } = await supabase
    .from('audits')
    .delete()
    .eq('audit_id', auditId)
    .eq('user_id', userId)

  if (error) throw error
}
// Create job records in the jobs table (triggers Railway worker)
export async function createJobRecords(userId, auditId, uploadedFiles) {
  const jobs = uploadedFiles.map(file => ({
    audit_id: auditId,
    user_id: userId,
    file_name: file.name,
    file_path: file.path,
    status: 'pending',
    retry_count: 0
  }))
  const { data, error } = await supabase
    .from('jobs')
    .insert(jobs)
    .select()
  if (error) throw error
  return data
}

