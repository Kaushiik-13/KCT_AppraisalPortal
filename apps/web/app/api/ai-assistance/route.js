import {aiAssistance} from '../../../server/nextAiRoute.js';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;

export async function POST(request){
 return aiAssistance(request);
}
