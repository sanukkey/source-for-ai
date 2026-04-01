import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// GET /api/health
// Vercel の Functions ログや ブラウザで直接叩いて、APIキーとモデルの疎通を確認するエンドポイント
export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      ok: false,
      step: 'api_key',
      error: 'GEMINI_API_KEY が環境変数に存在しません',
    }, { status: 500 });
  }

  // APIキーの先頭8文字だけ返す（漏洩防止）
  const keyHint = apiKey.slice(0, 8) + '...';

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('テスト。「OK」とだけ答えて。');
    const text = result.response.text();

    return NextResponse.json({
      ok: true,
      keyHint,
      model: 'gemini-1.5-flash',
      response: text.slice(0, 50),
    });
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      step: 'gemini_call',
      keyHint,
      error: err.message,
      status: err.status ?? null,
    }, { status: 500 });
  }
}
