/**
 * Match Flow Integration Test
 *
 * Tests that when both Altan and Firat like the same company,
 * a match is created and appears in the inbox.
 *
 * Run with: npx tsx src/tests/match-flow.test.ts
 */

const API_BASE = 'http://localhost:3001';

interface User {
  id: string;
  name: string;
  display_name: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

interface FeedResponse {
  feed: Array<{ id: string; company_name: string }>;
  totalCount: number;
  userCursor: number;
}

interface SwipeResponse {
  id: string;
  decision: string;
  matchCreated: boolean;
}

interface MatchListItem {
  id: string;
  fundraiseId: string;
  companyName: string;
  reflections: Array<{
    userId: string;
    displayName: string;
    chips: string[];
    note: string | null;
  }>;
}

// Test state
let altanToken: string;
let firatToken: string;
let testFundraiseId: string;
let testCompanyName: string;

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' })) as { error?: string };
    throw new Error(`${response.status}: ${errorData.error || 'Request failed'}`);
  }

  return response.json() as Promise<T>;
}

function log(message: string, data?: any) {
  console.log(`\n✓ ${message}`);
  if (data) {
    console.log('  ', JSON.stringify(data, null, 2).split('\n').join('\n   '));
  }
}

function logError(message: string, error: any) {
  console.error(`\n✗ ${message}`);
  console.error('  ', error.message || error);
}

async function test1_LoginBothUsers() {
  console.log('\n─────────────────────────────────────────');
  console.log('TEST 1: Login both users');
  console.log('─────────────────────────────────────────');

  // Login as Altan
  const altanResponse = await request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ name: 'altan' }),
  });
  altanToken = altanResponse.token;
  log(`Altan logged in`, { userId: altanResponse.user.id, displayName: altanResponse.user.display_name });

  // Login as Firat
  const firatResponse = await request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ name: 'firat' }),
  });
  firatToken = firatResponse.token;
  log(`Firat logged in`, { userId: firatResponse.user.id, displayName: firatResponse.user.display_name });
}

async function test2_GetFeedAndSelectCompany() {
  console.log('\n─────────────────────────────────────────');
  console.log('TEST 2: Get feed and select a company');
  console.log('─────────────────────────────────────────');

  const feed = await request<FeedResponse>('/api/feed/archive', {}, altanToken);

  // Pick the first company that hasn't been swiped
  testFundraiseId = feed.feed[0].id;
  testCompanyName = feed.feed[0].company_name;

  log(`Selected company for test`, {
    fundraiseId: testFundraiseId,
    companyName: testCompanyName,
    totalInFeed: feed.totalCount
  });
}

async function test3_AltanLikesNoMatchYet() {
  console.log('\n─────────────────────────────────────────');
  console.log('TEST 3: Altan likes - no match yet');
  console.log('─────────────────────────────────────────');

  const swipeResponse = await request<SwipeResponse>('/api/swipes/archive', {
    method: 'POST',
    body: JSON.stringify({
      fundraiseId: testFundraiseId,
      decision: 'like'
    }),
  }, altanToken);

  if (swipeResponse.matchCreated) {
    throw new Error('Match should NOT be created when only one user has liked');
  }

  log(`Altan liked ${testCompanyName}`, {
    swipeId: swipeResponse.id,
    matchCreated: swipeResponse.matchCreated
  });

  // Verify no matches in inbox yet
  const matches = await request<{ matches: MatchListItem[] }>('/api/matches', {}, altanToken);
  const matchForCompany = matches.matches.find(m => m.fundraiseId === testFundraiseId);

  if (matchForCompany) {
    throw new Error('Match should NOT appear in inbox yet');
  }

  log(`Altan's inbox has no match for this company yet`);
}

async function test4_FiratLikesMatchCreated() {
  console.log('\n─────────────────────────────────────────');
  console.log('TEST 4: Firat likes - MATCH CREATED');
  console.log('─────────────────────────────────────────');

  const swipeResponse = await request<SwipeResponse>('/api/swipes/archive', {
    method: 'POST',
    body: JSON.stringify({
      fundraiseId: testFundraiseId,
      decision: 'like'
    }),
  }, firatToken);

  if (!swipeResponse.matchCreated) {
    throw new Error('Match SHOULD be created when both users have liked');
  }

  log(`Firat liked ${testCompanyName}`, {
    swipeId: swipeResponse.id,
    matchCreated: swipeResponse.matchCreated
  });
}

async function test5_MatchAppearsInBothInboxes() {
  console.log('\n─────────────────────────────────────────');
  console.log('TEST 5: Match appears in both inboxes');
  console.log('─────────────────────────────────────────');

  // Check Altan's inbox
  const altanMatches = await request<{ matches: MatchListItem[] }>('/api/matches', {}, altanToken);
  const altanMatch = altanMatches.matches.find(m => m.fundraiseId === testFundraiseId);

  if (!altanMatch) {
    throw new Error('Match should appear in Altan\'s inbox');
  }
  log(`Match found in Altan's inbox`, {
    matchId: altanMatch.id,
    companyName: altanMatch.companyName
  });

  // Check Firat's inbox
  const firatMatches = await request<{ matches: MatchListItem[] }>('/api/matches', {}, firatToken);
  const firatMatch = firatMatches.matches.find(m => m.fundraiseId === testFundraiseId);

  if (!firatMatch) {
    throw new Error('Match should appear in Firat\'s inbox');
  }
  log(`Match found in Firat's inbox`, {
    matchId: firatMatch.id,
    companyName: firatMatch.companyName
  });

  // Verify both users' reflections are in the match
  if (altanMatch.reflections.length !== 2) {
    throw new Error(`Expected 2 reflections, got ${altanMatch.reflections.length}`);
  }

  const userNames = altanMatch.reflections.map(r => r.displayName).sort();
  log(`Match contains reflections from both users`, { users: userNames });
}

async function test6_MatchIsIdempotent() {
  console.log('\n─────────────────────────────────────────');
  console.log('TEST 6: Re-liking does not duplicate match');
  console.log('─────────────────────────────────────────');

  // Altan likes again
  const swipeResponse = await request<SwipeResponse>('/api/swipes/archive', {
    method: 'POST',
    body: JSON.stringify({
      fundraiseId: testFundraiseId,
      decision: 'like'
    }),
  }, altanToken);

  log(`Altan re-liked ${testCompanyName}`, {
    matchCreated: swipeResponse.matchCreated
  });

  // Count matches for this fundraise
  const matches = await request<{ matches: MatchListItem[] }>('/api/matches', {}, altanToken);
  const matchesForCompany = matches.matches.filter(m => m.fundraiseId === testFundraiseId);

  if (matchesForCompany.length !== 1) {
    throw new Error(`Expected 1 match, got ${matchesForCompany.length} (duplicate created!)`);
  }

  log(`Only 1 match exists for this company (idempotent)`, { count: matchesForCompany.length });
}

async function test7_DifferentModeNoMatch() {
  console.log('\n─────────────────────────────────────────');
  console.log('TEST 7: Different mode = no match');
  console.log('─────────────────────────────────────────');

  // Get a different company from recent feed
  const feed = await request<FeedResponse>('/api/feed/recent', {}, altanToken);

  if (feed.feed.length === 0) {
    log('Skipping test - no companies in recent feed');
    return;
  }

  const recentCompanyId = feed.feed[0].id;
  const recentCompanyName = feed.feed[0].company_name;

  // Altan likes in RECENT mode
  await request<SwipeResponse>('/api/swipes/recent', {
    method: 'POST',
    body: JSON.stringify({ fundraiseId: recentCompanyId, decision: 'like' }),
  }, altanToken);
  log(`Altan liked ${recentCompanyName} in RECENT mode`);

  // Firat likes in ARCHIVE mode (if same company exists there)
  const archiveFeed = await request<FeedResponse>('/api/feed/archive', {}, firatToken);
  const sameCompanyInArchive = archiveFeed.feed.find(f => f.id === recentCompanyId);

  if (sameCompanyInArchive) {
    const response = await request<SwipeResponse>('/api/swipes/archive', {
      method: 'POST',
      body: JSON.stringify({ fundraiseId: recentCompanyId, decision: 'like' }),
    }, firatToken);

    if (response.matchCreated) {
      throw new Error('Match should NOT be created for different modes');
    }
    log(`Firat liked same company in ARCHIVE mode - no match (correct)`);
  } else {
    log(`Company not in archive feed - skipping cross-mode test`);
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     MATCH FLOW INTEGRATION TEST        ║');
  console.log('╚════════════════════════════════════════╝');

  try {
    await test1_LoginBothUsers();
    await test2_GetFeedAndSelectCompany();
    await test3_AltanLikesNoMatchYet();
    await test4_FiratLikesMatchCreated();
    await test5_MatchAppearsInBothInboxes();
    await test6_MatchIsIdempotent();
    await test7_DifferentModeNoMatch();

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         ALL TESTS PASSED ✓             ║');
    console.log('╚════════════════════════════════════════╝\n');
    process.exit(0);
  } catch (error) {
    logError('TEST FAILED', error);
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║         TESTS FAILED ✗                 ║');
    console.log('╚════════════════════════════════════════╝\n');
    process.exit(1);
  }
}

runAllTests();
