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
  generateAbrigoKey,
  hashAbrigoKey,
  isValidAbrigoKey,
  isValidKeyHash,
  normalizeAbrigoKey,
} from "./AbrigoKey";
export { useAbrigoSync } from "./useAbrigoSync";
