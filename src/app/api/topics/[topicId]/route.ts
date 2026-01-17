import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Cache the topics data
let topicsCache: Record<string, unknown> | null = null;

function loadTopics(): Record<string, unknown> {
  if (topicsCache) return topicsCache;

  const filePath = path.join(process.cwd(), 'scenes', 'v4', 'preference-topics.json');
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  topicsCache = data.topics as Record<string, unknown>;
  return topicsCache!;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const { topicId } = await params;
    const topics = loadTopics();

    if (!topics[topicId]) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(topics[topicId]);
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topic' },
      { status: 500 }
    );
  }
}
