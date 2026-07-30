import { subscribe } from "./EventBus";
import { SYNC_EVENT, emitSync } from "./emitSync";
import { enqueue } from "./SyncQueue";
import SyncService from "./SyncService";

subscribe(SYNC_EVENT, (operation) => {
  enqueue(operation);
  void SyncService.processQueue();
});

SyncService.initialize();

export { emitSync, SyncService };
export {
  hashAbrigoKey,
  isValidAbrigoKey,
  isValidKeyHash,
  normalizeAbrigoKey,
} from "./AbrigoKey";
