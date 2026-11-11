import {aiStatus} from '../../../server/nextAiRoute.js';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(){
 return aiStatus();
}
