import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) {
  throw new Error('SAMPARK is missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY.')
}

export const supabase = createClient(url, key)

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args)
  if (error) throw new Error(error.message)
  return data
}

function singleRow(rows, notFoundMessage = 'QR tag not found.') {
  if (!rows?.length) throw new Error(notFoundMessage)
  return rows[0]
}

export async function lookupTag(token) {
  return singleRow(await rpc('lookup_tag', { p_scan_token: token }))
}

export async function registerTag(token, { name, mobile, carNumber }) {
  return singleRow(await rpc('register_tag', {
    p_scan_token: token,
    p_owner_name: name,
    p_owner_mobile: mobile,
    p_car_number: carNumber,
  }))
}

export async function signIn(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
}

export function signOut() { return supabase.auth.signOut() }

export async function listTags() { return rpc('list_tags') }

export async function generateTags(count) { return rpc('generate_tags', { p_count: count }) }
