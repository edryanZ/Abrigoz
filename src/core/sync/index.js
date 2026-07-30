import { subscribe } from "./EventBus";
import { SYNC_EVENT, emitSync } from "./emitSync";
import { enqueue } from "./SyncQueue";
subscribe(SYNC_EVENT, enqueue);
export { emitSync };
