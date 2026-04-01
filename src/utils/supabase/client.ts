import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 環境変数未設定時もビルドエラーにならないようプレースホルダーを使用
  // 実際の読み書きは各ページの if (!process.env.NEXT_PUBLIC_SUPABASE_URL) ガードで制御
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
  )
}
